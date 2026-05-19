import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

export class ProviderGateway {
  private model: Parameters<typeof generateText>[0]['model']

  constructor(providerId: string, decryptedKey: string, modelName?: string) {
    switch (providerId) {
      case 'openai':
        this.model = createOpenAI({ apiKey: decryptedKey })(modelName || 'gpt-4o')
        break
      case 'anthropic':
        this.model = createAnthropic({ apiKey: decryptedKey })(modelName || 'claude-3-5-sonnet-20240620')
        break
      case 'google':
        this.model = createGoogleGenerativeAI({ apiKey: decryptedKey })(modelName || 'gemini-1.5-flash')
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

  async generate(prompt: string, timeoutMs = 90000) {
    const request = generateText({
      model: this.model,
      prompt,
    })

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Model request timed out after ${timeoutMs}ms`)), timeoutMs)
    })

    const { text } = await Promise.race([request, timeout])
    return text
  }
}
