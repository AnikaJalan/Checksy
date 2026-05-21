import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customRules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { z } from 'zod'

const updateRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const data = updateRuleSchema.parse(body)

    const [rule] = await db
      .update(customRules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(customRules.id, id), eq(customRules.teacherId, teacher.id)))
      .returning()

    if (!rule) return new NextResponse('Not Found', { status: 404 })

    return NextResponse.json(rule)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.issues[0]?.message || 'Validation error', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const { id } = await params

  const [rule] = await db
    .delete(customRules)
    .where(and(eq(customRules.id, id), eq(customRules.teacherId, teacher.id)))
    .returning()

  if (!rule) return new NextResponse('Not Found', { status: 404 })

  return NextResponse.json({ success: true })
}
