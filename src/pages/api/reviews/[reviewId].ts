import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reviewId } = req.query

  if (!reviewId || Array.isArray(reviewId)) {
    return res.status(400).json({ error: 'reviewId is required' })
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { user: true }
  })

  if (!review) {
    return res.status(404).json({ error: 'Review not found' })
  }

  if (req.method === 'GET') {
    return res.status(200).json(review)
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

  // Проверка прав: только автор рецензии может редактировать/удалять
  if (review.userId !== user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'PUT') {
    const { content, rating } = req.body || {}

    const updateData: any = {}
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Review content cannot be empty' })
      }
      updateData.content = content.trim()
    }

    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' })
      }
      updateData.rating = rating
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    })

    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.review.delete({ where: { id: reviewId } })
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
