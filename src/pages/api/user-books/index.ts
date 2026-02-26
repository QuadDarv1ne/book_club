import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions as any)
  if (!session || !(session as any).user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userEmail = (session as any).user?.email || ''
  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const userBooks = await prisma.userBook.findMany({
    where: { userId: user.id },
    include: {
      book: true
    },
    orderBy: { updatedAt: 'desc' }
  })

  return res.status(200).json(userBooks)
}
