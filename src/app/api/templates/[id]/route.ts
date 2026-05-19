import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gradingTemplates } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  subject: z.string().min(1, 'Subject is required').optional(),
  strictness: z.string().optional(),
  customInstructions: z.string().nullable().optional(),
  aiDetectionEnabled: z.boolean().optional(),
  ruleIds: z.array(z.string()).optional(),
  maxScore: z.number().optional(),
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const data = updateTemplateSchema.parse(body)

    const [template] = await db
      .update(gradingTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(gradingTemplates.id, id), eq(gradingTemplates.teacherId, teacher.id)))
      .returning()

    if (!template) return new NextResponse('Not Found', { status: 404 })

    return NextResponse.json(template)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.errors[0].message, { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const { id } = await params

  const [template] = await db
    .delete(gradingTemplates)
    .where(and(eq(gradingTemplates.id, id), eq(gradingTemplates.teacherId, teacher.id)))
    .returning()

  if (!template) return new NextResponse('Not Found', { status: 404 })

  return NextResponse.json({ success: true })
}
