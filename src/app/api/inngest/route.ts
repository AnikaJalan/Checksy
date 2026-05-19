import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { gradeSubmissionsEvent } from "@/lib/inngest/functions/grade-submissions";

const rawSigningKey = process.env.INNGEST_SIGNING_KEY
const signingKey =
  process.env.NODE_ENV === "development" && rawSigningKey === "local"
    ? undefined
    : rawSigningKey

export const { GET, POST, PUT } = serve({
  client: inngest,
  signingKey,
  functions: [
    gradeSubmissionsEvent,
  ],
});
