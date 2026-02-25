// Mock auth options for Jest tests
module.exports = {
  adapter: jest.fn(),
  providers: [],
  secret: 'test-secret',
  session: { strategy: 'database' }
}
