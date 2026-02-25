import { createMocks } from 'node-mocks-http'
import { prisma } from '../../__mocks__/prisma'

// Mock getServerSession
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

import { getServerSession } from 'next-auth/next'
import clubsHandler from '../../src/pages/api/clubs/index'
import clubHandler from '../../src/pages/api/clubs/[id]'
import membersHandler from '../../src/pages/api/clubs/[id]/members'

describe('Clubs API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' }
  const mockSession = { user: { email: mockUser.email } }
  const mockClub = { 
    id: 'club-1', 
    name: 'Book Lovers', 
    description: 'A club for book lovers',
    memberships: []
  }

  describe('GET /api/clubs', () => {
    it('returns list of clubs', async () => {
      const clubs = [mockClub]
      ;(prisma.club.findMany as jest.Mock).mockResolvedValue(clubs)

      const { req, res } = createMocks({ method: 'GET' })
      await clubsHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(clubs)
    })
  })

  describe('POST /api/clubs', () => {
    it('returns 401 when not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const { req, res } = createMocks({ 
        method: 'POST', 
        body: { name: 'New Club' } 
      })
      await clubsHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(401)
    })

    it('returns 400 when name is missing', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const { req, res } = createMocks({ 
        method: 'POST', 
        body: {} 
      })
      await clubsHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(400)
    })

    it('creates club successfully', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.club.create as jest.Mock).mockResolvedValue(mockClub)

      const { req, res } = createMocks({ 
        method: 'POST', 
        body: { name: 'New Club', description: 'Test description' } 
      })
      await clubsHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(201)
      expect(prisma.club.create).toHaveBeenCalled()
    })
  })

  describe('GET /api/clubs/[id]', () => {
    it('returns club by id', async () => {
      ;(prisma.club.findUnique as jest.Mock).mockResolvedValue(mockClub)

      const { req, res } = createMocks({ 
        method: 'GET', 
        query: { id: 'club-1' } 
      })
      await clubHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
    })

    it('returns 404 if club not found', async () => {
      ;(prisma.club.findUnique as jest.Mock).mockResolvedValue(null)

      const { req, res } = createMocks({ 
        method: 'GET', 
        query: { id: 'nonexistent' } 
      })
      await clubHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(404)
    })
  })

  describe('GET /api/clubs/[id]/members', () => {
    it('returns members list', async () => {
      const members = [
        { id: 'm1', userId: 'user-1', role: 'admin', user: mockUser }
      ]
      ;(prisma.club.findUnique as jest.Mock).mockResolvedValue(mockClub)
      ;(prisma.membership.findMany as jest.Mock).mockResolvedValue(members)

      const { req, res } = createMocks({ 
        method: 'GET', 
        query: { id: 'club-1' } 
      })
      await membersHandler(req as any, res as any)

      expect(res._getStatusCode()).toBe(200)
    })
  })
})
