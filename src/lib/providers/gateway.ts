import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// The BYOK Provider Gateway ensures all LLM models use the credentials mapped to a given teacher
export function getLlmProvider(providerId: string, decryptedKey: string) {
  switch (providerId) {
    case 'openai':
      return createOpenAI({ apiKey: decryptedKey })
    case 'anthropic':
      return createAnthropic({ apiKey: decryptedKey })
    case 'google':
      return createGoogleGenerativeAI({ apiKey: decryptedKey })
    // Future providers (cerebras, mistral, groq) will be added here
    default:
      throw new Error(`Unsupported AI gateway provider: ${providerId}`)
  }
}
