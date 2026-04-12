import { inngest } from '../client';

export const gradeSubmissionEvent = inngest.createFunction(
  { id: 'grade-submission' },
  { event: 'grading/submission.eval' },
  async ({ event, step }) => {
    const { sessionId, studentName, fileContent, provider } = event.data;

    // We use steps for resilient execution
    await step.run('decrypt-api-key', async () => {
      // Real decryption logic will be plugged in here
      return null;
    });

    const gradingResult = await step.run('evaluate-with-llm', async () => {
      // Real AI integration using gateway will go here
      return { score: 85, feedback: 'Good job on the basic structure.' };
    });

    await step.run('save-results', async () => {
      // Connect to Drizzle schema to save results
    });

    return { success: true, result: gradingResult };
  }
);
