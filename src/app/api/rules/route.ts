import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { createRule, getRules } from '@/lib/services/rules.service'

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const rules = await getRules(teacher.id)
  return NextResponse.json(rules)
}

export async function POST(req: Request) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const body = await req.json()
  const rule = await createRule(teacher.id, body)
  return NextResponse.json(rule)
}
