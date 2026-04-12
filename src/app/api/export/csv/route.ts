import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { getResultsBySession } from '@/lib/services/student-results.service';
import { generateCsv } from '@/lib/export/csv';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) return new NextResponse('Session ID missing', { status: 400 });

    const teacher = await getTeacher();
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 });

    const results = await getResultsBySession(sessionId, teacher.id);
    const csvContent = generateCsv(results as any);

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="checksy-grading-${sessionId}.csv"`
      }
    });
  } catch (error) {
    return new NextResponse('Internal Execution Error', { status: 500 });
  }
}
