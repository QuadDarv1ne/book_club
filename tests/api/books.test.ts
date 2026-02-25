import { createMocks } from 'node-mocks-http'

// Мокаем Prisma перед импортом handler
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Импортируем после моков
import handler from '../../src/pages/api/books/index'
import { prisma } from '../../src/lib/prisma'
import { getServerSession } from 'next-auth/next'

describe('/api/books/index', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('GET', () => {
    it('returns books list', async () => {
      const books = [
        { id: '1', title: 'Book 1', author: 'Author 1', description: 'Desc 1', createdAt: new Date() }
      ]
      ;(prisma as any).book.findMany.mockResolvedValue(books)
      ;(prisma as any).book.count.mockResolvedValue(1)

      const { req, res } = createMocks({ method: 'GET', query: {} })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
    })

    it('supports pagination', async () => {
      const books = Array(12).fill(null).map((_, i) => ({
        id: String(i),
        title: `Book ${i}`,
        author: 'Author',
        description: 'Desc',
        createdAt: new Date()
      }))
      ;(prisma as any).book.findMany.mockResolvedValue(books)
      ;(prisma as any).book.count.mockResolvedValue(100)

      const { req, res } = createMocks({ method: 'GET', query: { page: '2', limit: '12' } })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
    })
  })

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const { req, res } = createMocks({ method: 'POST', body: { title: 'Test' } })
      await handler(req as any, res as any)
      expect(res._getStatusCode()).toBe(401)
    })

    it('returns 400 when title missing', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'a@b.com' } })
      const { req, res } = createMocks({ method: 'POST', body: { author: 'Author' } })
      await handler(req as any, res as any)
      expect(res._getStatusCode()).toBe(400)
    })

    it('creates book when valid', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'a@b.com' } })
      ;(prisma as any).book.create.mockResolvedValue({ id: '1', title: 'Test', author: 'Author' })

      const { req, res } = createMocks({ method: 'POST', body: { title: 'Test', author: 'Author' } })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(201)
      expect((prisma as any).book.create).toHaveBeenCalled()
    })
  })
})
