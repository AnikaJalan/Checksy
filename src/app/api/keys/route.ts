import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { saveApiKey, getMaskedApiKeys } from '@/lib/services/api-keys.service'
import { z } from 'zod'

const keySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'wolfram', 'nvidia']),
  key: z.string().min(1, 'Key is required'),
})

export async function GET() {
  const teacher = await getTeacher()
  if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

  const keys = await getMaskedApiKeys(teacher.id)
  return NextResponse.json(keys)
}

export async function POST(req: Request) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

    const body = await req.json()
    const validated = keySchema.parse(body)

    await saveApiKey(teacher.id, validated.provider, validated.key)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Failed to save API key:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
