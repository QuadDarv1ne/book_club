import NextAuth from 'next-auth'
import authOptions from '../../../lib/auth'

// Reuse shared auth options
export default NextAuth(authOptions as any)
