import { db } from '@/lib/db'
import { apiKeys } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { encryptKey, decryptKey } from '@/lib/crypto'

export async function saveApiKey(
  teacherId: string,
  provider: string,
  plaintextKey: string
) {
  // 1. Extract hint (last 4 chars)
  const keyHint = plaintextKey.slice(-4)

  // 2. Encrypt the key natively
  const { encryptedKey, iv, authTag } = encryptKey(plaintextKey)

  // 3. Upsert into database securely
  const [existing] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.teacherId, teacherId), eq(apiKeys.provider, provider)))
    .limit(1)

  if (existing) {
    return db
      .update(apiKeys)
      .set({
        encryptedKey,
        iv,
        authTag,
        keyHint,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, existing.id))
  }

  return db.insert(apiKeys).values({
    teacherId,
    provider,
    encryptedKey,
    iv,
    authTag,
    keyHint,
  })
}

export async function getMaskedApiKeys(teacherId: string) {
  const keys = await db
    .select({
      provider: apiKeys.provider,
      keyHint: apiKeys.keyHint,
      updatedAt: apiKeys.updatedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.teacherId, teacherId))

  return keys
}

export async function deleteApiKey(teacherId: string, provider: string) {
  return db
    .delete(apiKeys)
    .where(and(eq(apiKeys.teacherId, teacherId), eq(apiKeys.provider, provider)))
}

export async function getDecryptedApiKey(teacherId: string, provider: string) {
  const [record] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.teacherId, teacherId), eq(apiKeys.provider, provider)))
    .limit(1)

  if (!record) return null

  return decryptKey(record.encryptedKey, record.iv, record.authTag)
}
