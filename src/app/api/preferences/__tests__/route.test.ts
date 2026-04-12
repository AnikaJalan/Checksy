import { describe, it, expect, vi } from 'vitest'
import { GET } from '../route'

vi.mock('@/lib/auth/get-teacher', () => ({
  getTeacher: vi.fn(),
}))

describe('Preferences API GET', () => {
  it('should return 401 if unauthorized', async () => {
    const { getTeacher } = await import('@/lib/auth/get-teacher')
    vi.mocked(getTeacher).mockResolvedValue(null)

    const res = await GET()
    expect(res.status).toBe(401)
  })
})
