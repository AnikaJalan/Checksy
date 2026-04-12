import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  school: z.string().optional(),
  subjectsTaught: z.array(z.string()).optional(),
})

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  const [profile] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.id, teacher.id))
    .limit(1)

  return NextResponse.json(profile)
}

export async function PUT(req: Request) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    const [updated] = await db
      .update(teachers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teachers.id, teacher.id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse((error as z.ZodError<any>).errors[0].message, { status: 400 });
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
