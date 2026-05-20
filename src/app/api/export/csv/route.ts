import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { getResultsBySession } from '@/lib/services/student-results.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) return new NextResponse('Session ID missing', { status: 400 });

    const teacher = await getTeacher();
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 });

    const results = await getResultsBySession(sessionId, teacher.id);

    const escapeCell = (val: string | number | boolean | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      // Wrap in quotes if the value contains comma, quote, or newline
      if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headers = [
      'Student Name',
      'File Name',
      'Score',
      'Status',
      'Feedback',
      'AI Content %',
      'Flagged',
      'Graded At',
    ];

    const rows = results.map(r => [
      escapeCell(r.studentName),
      escapeCell(r.fileName),
      escapeCell(r.score),
      escapeCell(r.status),
      escapeCell(r.feedback),
      escapeCell(r.aiContentPercentage !== null ? `${r.aiContentPercentage}%` : ''),
      escapeCell(r.isFlagged ? 'Yes' : 'No'),
      escapeCell(r.gradedAt ? new Date(r.gradedAt).toLocaleString() : ''),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');
    const sessionName = `checksy-${sessionId.slice(0, 8)}`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${sessionName}.csv"`,
      },
    });
  } catch (error) {
    console.error('[CSV Export Error]', error);
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Export failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
