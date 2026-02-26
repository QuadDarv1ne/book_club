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
    include: { book: true }
  })

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { book: true }
  })

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { club: true }
  })

  const stats = {
    totalBooks: userBooks.length,
    wantToRead: userBooks.filter(ub => ub.status === 'want_to_read').length,
    reading: userBooks.filter(ub => ub.status === 'reading').length,
    read: userBooks.filter(ub => ub.status === 'read').length,
    reviewsCount: reviews.length,
    clubsCount: memberships.length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    booksThisYear: userBooks.filter(ub => {
      if (!ub.finishedAt) return false
      return new Date(ub.finishedAt).getFullYear() === new Date().getFullYear()
    }).length
  }

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt
    },
    stats,
    recentReviews: reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 10).map(r => ({
      ...r,
      book: r.book
    })),
    clubs: memberships.map(m => ({
      ...m,
      club: m.club
    }))
  })
}
