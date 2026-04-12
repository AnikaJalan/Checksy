import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { getStatistics } from '@/lib/services/statistics.service';

export async function GET() {
  try {
    const teacher = await getTeacher();
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 });

    const stats = await getStatistics(teacher.id);
    return NextResponse.json(stats || {
      totalGraded: 0,
      averageScore: '0',
      averageAiPercentage: '0',
      flaggedCount: 0,
      timeSavedSeconds: 0
    });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
