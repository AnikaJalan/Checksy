import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

export async function GET() {
  try {
    // Gather diagnostic info about the Inngest client configuration
    const diagnostics: Record<string, unknown> = {
      mode: inngest.mode,
      eventKeySet: inngest.eventKeySet(),
      eventKeyPrefix: inngest.eventKey ? inngest.eventKey.substring(0, 6) + '...' : 'NOT SET',
      eventBaseUrl: inngest.eventBaseUrl,
      apiBaseUrl: inngest.apiBaseUrl,
      env_INNGEST_DEV: process.env.INNGEST_DEV ?? 'NOT SET',
      env_INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY ? process.env.INNGEST_EVENT_KEY.substring(0, 6) + '...' : 'NOT SET',
      env_INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY ? process.env.INNGEST_SIGNING_KEY.substring(0, 8) + '...' : 'NOT SET',
      env_NODE_ENV: process.env.NODE_ENV,
    };

    // Try sending a test event
    try {
      const result = await inngest.send({
        name: 'test/ping',
        data: { ts: Date.now() },
      });
      diagnostics.sendResult = result;
      diagnostics.sendSuccess = true;
    } catch (sendErr) {
      diagnostics.sendSuccess = false;
      diagnostics.sendError = sendErr instanceof Error ? sendErr.message : String(sendErr);
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
