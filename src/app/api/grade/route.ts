import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { createSession, updateSessionStatus } from '@/lib/services/grading-sessions.service';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: Request) {
  try {
    const teacher = await getTeacher();
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, config } = body;
    const files = Array.isArray(body?.files) ? body.files : [];

    // Prevent creating zombie sessions with no processable files.
    const validFiles = files.filter(
      (f: unknown): f is { fileName: string; studentName: string; textContent: string } => {
        if (!f || typeof f !== 'object') return false;
        const candidate = f as { fileName?: unknown; studentName?: unknown; textContent?: unknown };
        return (
          typeof candidate.fileName === 'string' &&
          candidate.fileName.trim().length > 0 &&
          typeof candidate.studentName === 'string' &&
          candidate.studentName.trim().length > 0 &&
          typeof candidate.textContent === 'string' &&
          candidate.textContent.trim().length > 0
        );
      }
    );

    if (validFiles.length === 0) {
      return new NextResponse('No valid extracted files found. Please re-upload the ZIP and try again.', { status: 400 });
    }

    // 1. Create durable DB session securely owned by this teacher
    const session = await createSession(teacher.id, name || 'Untitled Grading Session', config, validFiles);
    if (!session) {
      return new NextResponse('Failed to create grading session.', { status: 500 });
    }
    await updateSessionStatus(session.id, 'pending', validFiles.length);

    // 2. Dispatch the background AI grading pipeline to Inngest natively
    try {
      await inngest.send({
        name: 'grading/session.start',
        data: {
          sessionId: session.id,
          teacherId: teacher.id,
          config,
          files: validFiles,
        }
      });
    } catch (dispatchError) {
      await updateSessionStatus(session.id, 'failed', validFiles.length);
      console.error('Failed to dispatch Inngest event:', dispatchError);
      return new NextResponse('Could not start background worker. Please ensure Inngest is running and retry.', { status: 503 });
    }

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Failed to dispatch grading job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
