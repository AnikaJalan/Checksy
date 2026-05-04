import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { deleteApiKey } from '@/lib/services/api-keys.service'

export async function DELETE(
  req: Request,
  { params }: { params: { provider: string } }
) {
  try {
    const teacher = await getTeacher()
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

    const { provider } = params
    await deleteApiKey(teacher.id, provider)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete API key:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
