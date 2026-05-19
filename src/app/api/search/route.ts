import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq, ilike } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { gradingSessions, studentResults } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  if (q.length < 2) {
    return NextResponse.json({ sessions: [], students: [] })
  }

  const search = `%${q}%`

  const sessions = await db
    .select({
      id: gradingSessions.id,
      name: gradingSessions.name,
      subject: gradingSessions.subject,
      status: gradingSessions.status,
      createdAt: gradingSessions.createdAt,
    })
    .from(gradingSessions)
    .where(
      and(
        eq(gradingSessions.teacherId, teacher.id),
        ilike(gradingSessions.name, search)
      )
    )
    .orderBy(desc(gradingSessions.createdAt))
    .limit(6)

  const students = await db
    .select({
      sessionId: studentResults.sessionId,
      studentName: studentResults.studentName,
      sessionName: gradingSessions.name,
      subject: gradingSessions.subject,
      createdAt: gradingSessions.createdAt,
    })
    .from(studentResults)
    .innerJoin(gradingSessions, eq(studentResults.sessionId, gradingSessions.id))
    .where(
      and(
        eq(gradingSessions.teacherId, teacher.id),
        ilike(studentResults.studentName, search)
      )
    )
    .orderBy(desc(gradingSessions.createdAt))
    .limit(8)

  return NextResponse.json({ sessions, students })
}
