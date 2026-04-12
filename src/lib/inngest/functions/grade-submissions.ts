import { inngest } from '../client';
import { updateSessionStatus } from '@/lib/services/grading-sessions.service';
import { analyzeSubmission } from '@/lib/services/plagiarism.service';
import { ProviderGateway } from '@/lib/providers/gateway';
import { getAdapter } from '@/lib/grading/adapters';
import { buildGradingPrompt } from '@/lib/grading/prompt-builder';
import { parseGradingResponse } from '@/lib/grading/response-parser';
import { db } from '@/lib/db';
import { studentResults, apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// @ts-expect-error Types mismatch due to Inngest SDK generic type requirements
export const gradeSubmissionsEvent = inngest.createFunction(
  { id: 'grade-submissions-orchestrator', concurrency: 10 },
  { event: 'grading/session.start' },
  async ({ event, step }) => {
    const { sessionId, teacherId, config, files } = event.data;

    await step.run('set-processing-status', async () => {
      await updateSessionStatus(sessionId, 'processing', files.length);
    });

    const providerKeyRecord = await step.run('fetch-api-key', async () => {
      const [keyDb] = await db.select().from(apiKeys).where(eq(apiKeys.teacherId, teacherId)).limit(1);
      return keyDb;
    });

    if (!providerKeyRecord) {
      await step.run('fail-session', async () => {
        await updateSessionStatus(sessionId, 'failed');
      });
      return { success: false, reason: 'Missing API Key' };
    }

    let successCount = 0;
    
    // We process sequentially step by step to ensure distributed resilience 
    // where any single file crash won't tear down the entire batch job orchestrator.
    for (const file of files) {
      await step.run(`process-file-${file.fileName}`, async () => {
        try {
          const gateway = new ProviderGateway(
            providerKeyRecord.provider as any,
            providerKeyRecord.encryptedKey 
          );

          let plagiarismRes = undefined;
          if (config.enableAiDetection) {
             plagiarismRes = await analyzeSubmission(file.textContent, gateway);
          }

          const adapter = getAdapter(config.subject);
          const specificContext = adapter.getPromptContext(config);
          const prompt = buildGradingPrompt(config, file.textContent, specificContext);
          
          const rawResponse = await gateway.generate(prompt);
          const gradingResult = parseGradingResponse(rawResponse, config.maxScore);

          await db.insert(studentResults).values({
            sessionId,
            studentName: file.studentName,
            score: gradingResult.score,
            feedback: gradingResult.feedback,
            aiScore: plagiarismRes ? plagiarismRes.aiDetection.percentage : null,
            isFlagged: plagiarismRes ? plagiarismRes.isHighRisk : false,
            strengths: gradingResult.strengths || [],
            areasForImprovement: gradingResult.areasForImprovement || [],
            grammarIssues: [],
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error processing file ${file.fileName}:`, error);
          await db.insert(studentResults).values({
            sessionId,
            studentName: file.studentName,
            score: null,
            feedback: 'Grading failed due to an internal execution error.',
            aiScore: null,
            isFlagged: false,
            strengths: [],
            areasForImprovement: [],
            grammarIssues: [],
          });
        }
      });
    }

    await step.run('finalize-session', async () => {
      const finalStatus = successCount === files.length ? 'completed' : 'partial';
      await updateSessionStatus(sessionId, finalStatus);
    });

    return { success: true, processed: successCount, total: files.length };
  }
);
