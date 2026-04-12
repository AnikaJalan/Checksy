import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { createTemplate, getTemplates } from '@/lib/services/templates.service'

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const templates = await getTemplates(teacher.id)
  return NextResponse.json(templates)
}

export async function POST(req: Request) {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })
  const body = await req.json()
  const template = await createTemplate(teacher.id, body)
  return NextResponse.json(template)
}
