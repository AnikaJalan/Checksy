import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { createSession } from '@/lib/services/grading-sessions.service';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: Request) {
  try {
    const teacher = await getTeacher();
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { name, config, files } = body;

    // 1. Create durable DB session securely owned by this teacher
    const session = await createSession(teacher.id, name || 'Untitled Grading Session', config);

    // 2. Dispatch the background AI grading pipeline to Inngest natively
    await inngest.send({
      name: 'grading/session.start',
      data: {
        sessionId: session.id,
        teacherId: teacher.id,
        config,
        files
      }
    });

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Failed to dispatch grading job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
