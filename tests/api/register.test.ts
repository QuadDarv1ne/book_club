import { createMocks } from 'node-mocks-http'
import handler from '../../src/pages/api/auth/register'

// Мокаем Prisma клиент, чтобы тест не требовал БД.
jest.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn()
      }
    }
  }
})

import { prisma } from '../../src/lib/prisma'

describe('/api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when email missing', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { password: '12345678' } })
    await handler(req as any, res as any)
    expect(res._getStatusCode()).toBe(400)
  })

  it('creates a new user when data valid and not exists', async () => {
    // findUnique returns null => user doesn't exist
    ;(prisma as any).user.findUnique.mockResolvedValue(null)
    ;(prisma as any).user.create.mockResolvedValue({ id: '1', email: 'a@b.com', name: 'A' })

    const { req, res } = createMocks({ method: 'POST', body: { email: 'a@b.com', password: '12345678', name: 'A' } })
    await handler(req as any, res as any)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.email).toBe('a@b.com')
    expect((prisma as any).user.create).toHaveBeenCalled()
  })
})
