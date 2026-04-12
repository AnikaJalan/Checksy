import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { gradeSubmissionsEvent } from "@/lib/inngest/functions/grade-submissions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    gradeSubmissionsEvent,
  ],
});
