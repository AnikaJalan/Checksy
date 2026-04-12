import crypto from 'crypto'
import { env } from '@/lib/env'

const ALGORITHM = 'aes-256-gcm'

export function encryptKey(plainText: string) {
  const secretKey = Buffer.from(env.ENCRYPTION_SECRET, 'utf-8')
  if (secretKey.length !== 32) {
    throw new Error('ENCRYPTION_SECRET must be exactly 32 bytes.')
  }

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv)

  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')

  return {
    encryptedKey: encrypted,
    iv: iv.toString('hex'),
    authTag,
  }
}

export function decryptKey(
  encryptedKey: string,
  ivHex: string,
  authTagHex: string
) {
  const secretKey = Buffer.from(env.ENCRYPTION_SECRET, 'utf-8')
  if (secretKey.length !== 32) {
    throw new Error('ENCRYPTION_SECRET must be exactly 32 bytes.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
