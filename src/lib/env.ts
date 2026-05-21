import { z } from 'zod'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.CI === 'true' || process.env.VERCEL === '1';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default(isBuild ? 'postgres://dummy:dummy@localhost:5432/dummy' : (undefined as any)),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).default(isBuild ? 'pk_test_dummy' : (undefined as any)),
  CLERK_SECRET_KEY: z.string().min(1).default(isBuild ? 'sk_test_dummy' : (undefined as any)),
  CLERK_WEBHOOK_SECRET: z.string().min(1).default(isBuild ? 'whsec_dummy' : (undefined as any)),
  ENCRYPTION_SECRET: z
    .string()
    .min(32, 'Encryption secret must be at least 32 characters')
    .default(isBuild ? 'dummy_encryption_secret_32_characters_long' : (undefined as any)),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
