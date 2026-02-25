import { createMocks } from 'node-mocks-http'
import { prisma } from '../../__mocks__/prisma'
import { getServerSession } from 'next-auth/next'

// Mock getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

import handler from '../../src/pages/api/books/[id]/reviews'

describe('/api/books/[id]/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockBook = { id: 'book-1', title: 'Test Book' }
  const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' }
  const mockSession = { user: { email: mockUser.email } }

  describe('GET', () => {
    it('returns reviews for a book', async () => {
      const reviews = [
        { id: '1', content: 'Great book!', rating: 5, userId: 'user-1', bookId: 'book-1', createdAt: new Date() }
      ]
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.review.findMany as jest.Mock).mockResolvedValue(reviews)

      const { req, res } = createMocks({ 
        method: 'GET', 
        query: { bookId: 'book-1' } 
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
      const result = JSON.parse(res._getData())
      expect(result[0].id).toBe('1')
      expect(result[0].content).toBe('Great book!')
      expect(result[0].rating).toBe(5)
    })

    it('returns 400 if bookId is missing', async () => {
      const { req, res } = createMocks({ method: 'GET', query: {} })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(400)
    })

    it('returns 404 if book not found', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(null)

      const { req, res } = createMocks({ 
        method: 'GET', 
        query: { bookId: 'nonexistent' } 
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(404)
    })
  })

  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const { req, res } = createMocks({ 
        method: 'POST', 
        query: { bookId: 'book-1' },
        body: { content: 'Great!', rating: 5 }
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(401)
    })

    it('returns 400 when content is missing', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const { req, res } = createMocks({ 
        method: 'POST', 
        query: { bookId: 'book-1' },
        body: { rating: 5 }
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(400)
    })

    it('returns 400 when rating is invalid', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const { req, res } = createMocks({ 
        method: 'POST', 
        query: { bookId: 'book-1' },
        body: { content: 'Great!', rating: 10 }
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(400)
    })

    it('returns 409 when user already reviewed', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.review.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-review' })

      const { req, res } = createMocks({ 
        method: 'POST', 
        query: { bookId: 'book-1' },
        body: { content: 'Great!', rating: 5 }
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(409)
    })

    it('creates review successfully', async () => {
      ;(prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.review.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.review.create as jest.Mock).mockResolvedValue({ 
        id: 'new-review', 
        content: 'Great!', 
        rating: 5,
        user: mockUser 
      })

      const { req, res } = createMocks({ 
        method: 'POST', 
        query: { bookId: 'book-1' },
        body: { content: 'Great!', rating: 5 }
      })
      await handler(req as any, res as any)

      expect(res._getStatusCode()).toBe(201)
      expect(prisma.review.create).toHaveBeenCalled()
    })
  })
})
