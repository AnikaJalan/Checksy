import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { getSession } from '@/lib/services/grading-sessions.service';
import { getResultsBySession } from '@/lib/services/student-results.service';

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  const teacher = await getTeacher();
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 });
  
  const { sessionId } = await params;
  const session = await getSession(sessionId, teacher.id);
  if (!session) return new NextResponse('Not found', { status: 404 });

  let results: any[] = [];
  if (session.status === 'completed' || session.status === 'partial') {
    results = await getResultsBySession(sessionId, teacher.id);
  }

  return NextResponse.json({ session, results });
}
