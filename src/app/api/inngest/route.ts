import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { gradeSubmissionEvent } from '@/lib/inngest/functions/grade-submission';

// Next.js Route Handlers for Inngest to communicate with background server
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    gradeSubmissionEvent,
  ]
});
