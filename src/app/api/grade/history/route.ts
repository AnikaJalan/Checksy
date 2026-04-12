import { NextResponse } from 'next/server';
import { getTeacher } from '@/lib/auth/get-teacher';
import { db } from '@/lib/db';
import { gradingSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const teacher = await getTeacher();
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 });

  // Map historical metrics returning perfectly ordered payloads effortlessly
  const history = await db.select()
    .from(gradingSessions)
    .where(eq(gradingSessions.teacherId, teacher.id))
    .orderBy(desc(gradingSessions.createdAt));

  return NextResponse.json(history);
}
