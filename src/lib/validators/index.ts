import { z } from 'zod'

export const providerEnum = z.enum([
  'openai',
  'anthropic',
  'google',
  'cerebras',
  'mistral',
  'groq',
  'wolfram',
])

export type Provider = z.infer<typeof providerEnum>

export const apiKeySchema = z.object({
  provider: providerEnum,
  key: z.string().min(10, 'API key must be at least 10 characters long').trim(),
})
