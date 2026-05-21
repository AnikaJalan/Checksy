import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { getSession, updateSessionStatus } from '@/lib/services/grading-sessions.service';
import { getResultsBySession } from '@/lib/services/student-results.service';

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const teacher = await getTeacher();
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 });
  
  const { sessionId } = await params;
  const session = await getSession(sessionId, teacher.id);
  if (!session) return new NextResponse('Not found', { status: 404 });

  let results: Awaited<ReturnType<typeof getResultsBySession>> = [];
  try {
    results = await getResultsBySession(sessionId, teacher.id);
  } catch {
    results = [];
  }

  // Auto-recover sessions that have been stuck in pending/processing for too long.
  if (session.status === 'pending' || session.status === 'processing') {
    const startedAt = session.startedAt ?? session.createdAt;
    const startedMs = startedAt ? new Date(startedAt).getTime() : Date.now();
    const isStale = Date.now() - startedMs > 30 * 60 * 1000;

    if (isStale) {
      const recoveredStatus = results.length > 0 ? 'partial' : 'failed';
      await updateSessionStatus(sessionId, recoveredStatus);
      session.status = recoveredStatus;
    }
  }

  return NextResponse.json({ session, results });
}
