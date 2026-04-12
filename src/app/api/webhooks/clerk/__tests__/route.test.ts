import { describe, it, expect } from 'vitest'
import { POST } from '../route'

describe('Clerk Webhook', () => {
  it('should return 400 if svix headers are missing', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
