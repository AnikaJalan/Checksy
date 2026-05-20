import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

// Rate limit config per provider (requests per minute)
const PROVIDER_RPM: Record<string, number> = {
  google: 5,      // Gemini 2.5 Flash free tier: 5 RPM
  openai: 60,
  anthropic: 50,
  nvidia: 30,
  openrouter: 20,
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class ProviderGateway {
  private model: Parameters<typeof generateText>[0]['model']
  private providerId: string

  constructor(providerId: string, decryptedKey: string, modelName?: string) {
    this.providerId = providerId
    switch (providerId) {
      case 'openai':
        this.model = createOpenAI({ apiKey: decryptedKey })(modelName || 'gpt-4o')
        break
      case 'anthropic':
        this.model = createAnthropic({ apiKey: decryptedKey })(modelName || 'claude-3-5-sonnet-20240620')
        break
      case 'google':
        // gemini-2.5-flash is the only free tier model (5 RPM, 250K TPM, 20 RPD)
        this.model = createGoogleGenerativeAI({ apiKey: decryptedKey })(modelName || 'gemini-2.5-flash')
        break
      case 'nvidia':
        this.model = createOpenAI({ 
          baseURL: 'https://integrate.api.nvidia.com/v1',
          apiKey: decryptedKey 
        })(modelName || 'meta/llama-3.1-70b-instruct')
        break
      case 'openrouter':
        this.model = createOpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: decryptedKey,
          headers: {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Checksy AI Grading',
          }
        })(modelName || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free')
        break
      default:
        throw new Error(`Unsupported AI gateway provider: ${providerId}`)
    }
  }

  async generate(prompt: string, timeoutMs = 120000) {
    const rpm = PROVIDER_RPM[this.providerId] ?? 20
    // Minimum gap between calls to stay within RPM limit (with 20% safety buffer)
    const minGapMs = Math.ceil((60 / rpm) * 1000 * 1.2)

    const attemptGenerate = async (attempt: number): Promise<string> => {
      try {
        const request = generateText({
          model: this.model,
          prompt,
          maxRetries: 0, // We handle retries manually with backoff
        })

        const timeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Model request timed out after ${timeoutMs}ms`)), timeoutMs)
        })

        const { text } = await Promise.race([request, timeout])
        return text
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        const is429 = msg.includes('429') || msg.includes('TooManyRequests') || msg.includes('quota') || msg.includes('rate')
        const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('temporarily')

        if ((is429 || is503) && attempt < 4) {
          // Exponential backoff: 15s, 30s, 60s, 120s
          const waitMs = minGapMs + Math.pow(2, attempt) * 15000
          console.warn(`[Gateway] Transient error (attempt ${attempt + 1}). Waiting ${Math.round(waitMs / 1000)}s before retry…`)
          await sleep(waitMs)
          return attemptGenerate(attempt + 1)
        }

        throw error
      }
    }

    return attemptGenerate(0)
  }

  /** Returns the recommended delay (ms) to insert between sequential file calls */
  get interFileDelayMs(): number {
    const rpm = PROVIDER_RPM[this.providerId] ?? 20
    return Math.ceil((60 / rpm) * 1000 * 1.2)
  }
}
