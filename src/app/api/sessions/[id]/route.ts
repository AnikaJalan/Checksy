import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { gradingSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

    const { id } = await params

    // Only delete sessions owned by this teacher (prevents horizontal privilege escalation)
    const [deleted] = await db
      .delete(gradingSessions)
      .where(and(eq(gradingSessions.id, id), eq(gradingSessions.teacherId, teacher.id)))
      .returning({ id: gradingSessions.id })

    if (!deleted) {
      return NextResponse.json({ error: 'Session not found or not owned by you' }, { status: 404 })
    }

    return NextResponse.json({ success: true, deleted: deleted.id })
  } catch (error) {
    console.error('Failed to delete session:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
