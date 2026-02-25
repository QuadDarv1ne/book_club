// Setup file for Jest tests
// This file runs before each test file

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Global mock for Prisma client - using require to ensure it's applied
const mockPrisma = {
  review: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  book: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  club: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  membership: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  account: {
    findUnique: jest.fn(),
  },
  session: {
    findUnique: jest.fn(),
  },
}

// Mock all possible prisma import paths
jest.mock('prisma', () => ({ prisma: mockPrisma }))
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn() }))

// Export for use in tests
export const prisma = mockPrisma
