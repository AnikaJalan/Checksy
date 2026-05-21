import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { customRules } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getTeacher } from '@/lib/auth/get-teacher'
import { z } from 'zod'

const createRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
})

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  const rules = await db
    .select()
    .from(customRules)
    .where(eq(customRules.teacherId, teacher.id))
    .orderBy(desc(customRules.createdAt))

  return NextResponse.json(rules)
}

export async function POST(req: Request) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const data = createRuleSchema.parse(body)

    const [rule] = await db
      .insert(customRules)
      .values({ teacherId: teacher.id, ...data })
      .returning()

    return NextResponse.json(rule)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.issues[0]?.message || 'Validation error', { status: 400 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}
