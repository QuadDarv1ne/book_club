import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Book ID is required' })
  }

  // Проверка существования книги
  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) {
    return res.status(404).json({ error: 'Book not found' })
  }

  if (req.method === 'GET') {
    const reviews = await prisma.review.findMany({
      where: { bookId: id },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(reviews)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions as any)
    if (!session || !(session as any).user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userEmail = (session as any).user?.email || ''
    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { content, rating } = req.body || {}

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Review content is required' })
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    // Проверка, не оставлял ли пользователь уже рецензию на эту книгу
    const existingReview = await prisma.review.findFirst({
      where: { bookId: id, userId: user.id }
    })

    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this book' })
    }

    const review = await prisma.review.create({
      data: {
        content: content.trim(),
        rating,
        bookId: id,
        userId: user.id
      },
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    })

    return res.status(201).json(review)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
