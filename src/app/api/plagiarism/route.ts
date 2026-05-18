import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { analyzeSubmission } from '@/lib/services/plagiarism.service'
import { ProviderGateway } from '@/lib/providers/gateway'

export async function POST(req: Request) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

    const { text, strictness } = await req.json()

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return NextResponse.json({ error: 'Text is too short to analyze.' }, { status: 400 })
    }

    // Use system OpenRouter key as default gateway
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'No AI provider configured.' }, { status: 500 })
    }

    const gateway = new ProviderGateway('openrouter', apiKey)
    const result = await analyzeSubmission(text, gateway)

    // Override isHighRisk threshold based on strictness setting
    const threshold = strictness === 'low' ? 90 : strictness === 'high' ? 50 : 70
    result.isHighRisk = result.aiDetection.percentage >= threshold

    return NextResponse.json(result)
  } catch (error) {
    console.error('Plagiarism API error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
