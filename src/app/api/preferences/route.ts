import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teacherPreferences } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { z } from 'zod'

const updatePreferencesSchema = z.object({
  defaultSubject: z.string().optional(),
  defaultStrictness: z.string().optional(),
  aiDetectionEnabled: z.boolean().optional(),
  defaultMaxScore: z.number().optional(),
  feedbackTone: z.string().optional(),
  preferredLlmProvider: z.string().optional(),
  preferredLlmModel: z.string().optional(),
})

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  let [prefs] = await db
    .select()
    .from(teacherPreferences)
    .where(eq(teacherPreferences.teacherId, teacher.id))
    .limit(1)

  if (!prefs) {
    // Scaffold default preferences gracefully if it does not inherently exist yet
    ;[prefs] = await db
      .insert(teacherPreferences)
      .values({ teacherId: teacher.id })
      .returning()
  }

  return NextResponse.json(prefs)
}

export async function PUT(req: Request) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const data = updatePreferencesSchema.parse(body)

    const [updated] = await db
      .insert(teacherPreferences)
      .values({ teacherId: teacher.id, ...data })
      .onConflictDoUpdate({
        target: teacherPreferences.teacherId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.issues[0]?.message || 'Validation error', { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
