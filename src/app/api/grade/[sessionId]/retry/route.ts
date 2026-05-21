import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { gradingSessions, studentResults } from '@/lib/db/schema'
import { inngest } from '@/lib/inngest/client'

type ManifestFile = {
  fileName: string
  studentName: string
  textContent: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

    const { sessionId } = await params

    const [session] = await db
      .select()
      .from(gradingSessions)
      .where(
        and(
          eq(gradingSessions.id, sessionId),
          eq(gradingSessions.teacherId, teacher.id)
        )
      )
      .limit(1)

    if (!session) return new NextResponse('Session not found', { status: 404 })
    if (session.status === 'processing') {
      return new NextResponse('Session is already processing', { status: 409 })
    }

    let files: ManifestFile[] = []
    try {
      files = JSON.parse(session.inputManifest || '[]') as ManifestFile[]
    } catch {
      files = []
    }

    if (!Array.isArray(files) || files.length === 0) {
      return new NextResponse(
        'This session was created before retry support. Please re-upload the ZIP once to enable retries.',
        { status: 400 }
      )
    }

    await db
      .delete(studentResults)
      .where(eq(studentResults.sessionId, sessionId))

    await db
      .update(gradingSessions)
      .set({
        status: 'pending',
        totalFiles: files.length,
        gradedCount: 0,
        failedCount: 0,
        averageScore: null,
        avgAiPercentage: null,
        flaggedCount: 0,
        startedAt: null,
        completedAt: null,
      })
      .where(eq(gradingSessions.id, sessionId))

    const config = {
      subject: session.subject,
      strictness: session.strictness,
      maxScore: session.maxScore,
      feedbackTone: 'neutral',
      customInstructions: session.customInstructions || undefined,
      enableAiDetection: session.aiDetectionEnabled,
    }

    await inngest.send({
      name: 'grading/session.start',
      data: {
        sessionId: session.id,
        teacherId: teacher.id,
        config,
        files,
      },
    })

    return NextResponse.json({ success: true, sessionId: session.id })
  } catch (error) {
    console.error('Retry session error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
