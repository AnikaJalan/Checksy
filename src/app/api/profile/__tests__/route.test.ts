import { describe, it, expect, vi } from 'vitest'
import { GET } from '../route'

vi.mock('@/lib/auth/get-teacher', () => ({
  getTeacher: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ id: 'test-1', firstName: 'John' }]),
  },
}))

describe('Profile API GET', () => {
  it('should return 401 if unauthorized', async () => {
    const { getTeacher } = await import('@/lib/auth/get-teacher')
    vi.mocked(getTeacher).mockResolvedValue(null)

    const res = await GET()
    expect(res.status).toBe(401)
  })
})
