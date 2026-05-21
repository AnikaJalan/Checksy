import { inngest } from '../client';
import { updateSessionStatus } from '@/lib/services/grading-sessions.service';
import { analyzeSubmission } from '@/lib/services/plagiarism.service';
import { ProviderGateway } from '@/lib/providers/gateway';
import { getAdapter } from '@/lib/grading/adapters';
import { buildGradingPrompt } from '@/lib/grading/prompt-builder';
import { parseGradingResponse } from '@/lib/grading/response-parser';
import { db } from '@/lib/db';
import { studentResults, apiKeys, gradingSessions } from '@/lib/db/schema';
import { eq, count, avg, sql } from 'drizzle-orm';
import { decryptKey } from '@/lib/crypto';
import { NonRetriableError } from 'inngest';

export const gradeSubmissionsEvent = inngest.createFunction(
  { 
    id: 'grade-submissions-orchestrator', 
    concurrency: 5,
    retries: 1,
    triggers: [{ event: 'grading/session.start' }]
  },
  async ({ event, step }) => {
    const { sessionId, teacherId, config, files } = event.data;

    const safeFail = async (reason: string) => {
      try {
        await updateSessionStatus(sessionId, 'failed');
      } catch (e) {
        console.error('Unable to mark failed session:', e);
      }
      throw new NonRetriableError(reason);
    };

    await step.run('set-processing-status', async () => {
      await updateSessionStatus(sessionId, 'processing', files.length);
    });

    const providerKeyRecord = await step.run('fetch-api-key', async () => {
      const [keyDb] = await db.select().from(apiKeys).where(eq(apiKeys.teacherId, teacherId)).limit(1);
      return keyDb;
    });

    if (!providerKeyRecord && !process.env.OPENROUTER_API_KEY) {
      await safeFail('Missing API key and no system fallback available');
    }

    let successCount = 0;
    
    // We process sequentially step by step to ensure distributed resilience 
    // where any single file crash won't tear down the entire batch job orchestrator.
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await step.run(`process-file-${file.fileName}`, async () => {
        try {
          let gateway: ProviderGateway;

          if (providerKeyRecord) {
            const decryptedKey = decryptKey(
              providerKeyRecord.encryptedKey,
              providerKeyRecord.iv,
              providerKeyRecord.authTag
            );
            gateway = new ProviderGateway(
              String(providerKeyRecord.provider),
              decryptedKey
            );
          } else {
            // Fallback to the system-level OpenRouter key
            gateway = new ProviderGateway(
              'openrouter',
              process.env.OPENROUTER_API_KEY!
            );
          }

          let plagiarismRes = undefined;
          if (config.enableAiDetection) {
             plagiarismRes = await analyzeSubmission(file.textContent ?? '', gateway);
          }

          const adapter = getAdapter(config.subject);
          const specificContext = adapter.getPromptContext(config);
          const prompt = buildGradingPrompt(config, file.textContent ?? '', specificContext);
          
          const rawResponse = await gateway.generate(prompt);
          const gradingResult = parseGradingResponse(rawResponse, config.maxScore);

          await db.insert(studentResults).values({
            sessionId,
            studentName: file.studentName,
            fileName: file.fileName,
            score: gradingResult.score,
            feedback: gradingResult.feedback,
            aiContentPercentage: plagiarismRes ? plagiarismRes.aiDetection.percentage : null,
            isFlagged: plagiarismRes ? plagiarismRes.isHighRisk : false,
            status: 'graded',
            gradedAt: new Date(),
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error processing file ${file.fileName}:`, error);
          await db.insert(studentResults).values({
            sessionId,
            studentName: file.studentName,
            fileName: file.fileName,
            score: null,
            feedback: 'Grading failed due to an internal execution error.',
            aiContentPercentage: null,
            isFlagged: false,
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });

      // Pace requests to stay within provider RPM limits.
      // For Google free tier (5 RPM) this is ~15s between each file.
      if (i < files.length - 1) {
        const provider = providerKeyRecord ? String(providerKeyRecord.provider) : 'openrouter';
        const rpmMap: Record<string, number> = { google: 5, openai: 60, anthropic: 50, nvidia: 30, openrouter: 20 };
        const rpm = rpmMap[provider] ?? 20;
        const delaySec = Math.ceil((60 / rpm) * 1.2); // seconds, with 20% buffer
        await step.sleep(`rate-limit-delay-${i}`, `${delaySec}s`);
      }
    }

    await step.run('finalize-session', async () => {
      // Count graded results directly from DB — don't rely on successCount closure
      // because Inngest replays steps and the closure value resets between replays.
      const [gradedRow] = await db
        .select({ count: count() })
        .from(studentResults)
        .where(sql`${studentResults.sessionId} = ${sessionId} AND ${studentResults.status} = 'graded'`);

      const [avgRow] = await db
        .select({ avg: avg(studentResults.score) })
        .from(studentResults)
        .where(eq(studentResults.sessionId, sessionId));

      const gradedCount = gradedRow?.count ?? 0;
      const averageScore = avgRow?.avg ? Math.round(Number(avgRow.avg)) : null;
      const finalStatus = gradedCount >= files.length ? 'completed' : gradedCount > 0 ? 'partial' : 'failed';

      // Update status and averageScore in one go
      await db.update(gradingSessions)
        .set({ 
          status: finalStatus, 
          averageScore: averageScore,
          completedAt: new Date() 
        })
        .where(eq(gradingSessions.id, sessionId));
    });

    return { success: true, total: files.length };
  }
);
