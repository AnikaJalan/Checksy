import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gradingTemplates } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  strictness: z.string().optional(),
  customInstructions: z.string().nullable().optional(),
  aiDetectionEnabled: z.boolean().optional(),
  ruleIds: z.array(z.string()).optional(),
  maxScore: z.number().optional(),
})

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  const templates = await db
    .select()
    .from(gradingTemplates)
    .where(eq(gradingTemplates.teacherId, teacher.id))
    .orderBy(desc(gradingTemplates.createdAt))

  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const data = createTemplateSchema.parse(body)

    const [template] = await db
      .insert(gradingTemplates)
      .values({ teacherId: teacher.id, ...data })
      .returning()

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
