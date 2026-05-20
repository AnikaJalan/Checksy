import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { gradeSubmissionsEvent } from "@/lib/inngest/functions/grade-submissions";

const isDev = process.env.NODE_ENV !== "production";

// In production, Inngest needs to know the public URL to call back into.
// VERCEL_URL is automatically set by Vercel. For other hosts set APP_URL manually.
const serveHost = isDev
  ? "http://localhost:3000"
  : process.env.APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const { GET, POST, PUT } = serve({
  client: inngest,
  signingKey: isDev ? undefined : process.env.INNGEST_SIGNING_KEY,
  ...(serveHost && { serveHost }),
  functions: [
    gradeSubmissionsEvent,
  ],
});
