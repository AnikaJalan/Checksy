import { NextResponse } from 'next/server'
import { getTeacher } from '@/lib/auth/get-teacher'
import { db } from '@/lib/db'
import { apiKeys } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { decryptKey } from '@/lib/crypto'
import { ProviderGateway } from '@/lib/providers/gateway'

export async function GET() {
  try {
    const teacher = await getTeacher()
    if (!teacher) return new NextResponse('Unauthorized', { status: 401 })

    // 1. Fetch API key from DB
    const [keyRecord] = await db.select().from(apiKeys).where(eq(apiKeys.teacherId, teacher.id)).limit(1)

    if (!keyRecord) {
      return NextResponse.json({ 
        ok: false, 
        step: 'key-fetch',
        error: 'No API key found in database for this teacher.',
        teacherId: teacher.id 
      }, { status: 404 })
    }

    // 2. Decrypt the key
    let decryptedKey: string
    try {
      decryptedKey = decryptKey(keyRecord.encryptedKey, keyRecord.iv, keyRecord.authTag)
    } catch (e) {
      return NextResponse.json({ 
        ok: false, 
        step: 'decrypt',
        provider: keyRecord.provider,
        error: e instanceof Error ? e.message : String(e),
      }, { status: 500 })
    }

    // 3. Test a simple generation
    try {
      const gateway = new ProviderGateway(String(keyRecord.provider), decryptedKey)
      const result = await gateway.generate('Reply with a single word: "ok"', 20000)
      return NextResponse.json({ 
        ok: true, 
        provider: keyRecord.provider,
        keyHint: keyRecord.keyHint,
        modelResponse: result.trim(),
      })
    } catch (e) {
      return NextResponse.json({ 
        ok: false, 
        step: 'model-call',
        provider: keyRecord.provider,
        keyHint: keyRecord.keyHint,
        error: e instanceof Error ? e.message : String(e),
      }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ 
      ok: false, 
      step: 'unexpected',
      error: e instanceof Error ? e.message : String(e) 
    }, { status: 500 })
  }
}
