module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    // Map relative prisma imports to the mock - handle various nesting levels
    '^@lib/prisma$': '<rootDir>/__mocks__/prisma',
    '^@lib/auth$': '<rootDir>/__mocks__/auth',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
}
