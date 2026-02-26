import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Book ID is required' })
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

  const book = await prisma.book.findUnique({ where: { id } })
  if (!book) {
    return res.status(404).json({ error: 'Book not found' })
  }

  if (req.method === 'GET') {
    const userBook = await prisma.userBook.findUnique({
      where: { userId_bookId: { userId: user.id, bookId: id } }
    })
    return res.status(200).json(userBook)
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { status, rating, notes, startedAt, finishedAt } = req.body || {}

    const updateData: any = {}
    if (status !== undefined) {
      if (!['want_to_read', 'reading', 'read'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }
      updateData.status = status
      if (status === 'reading' && !startedAt) {
        updateData.startedAt = new Date()
      }
      if (status === 'read' && !finishedAt) {
        updateData.finishedAt = new Date()
      }
    }
    if (rating !== undefined) {
      if (rating !== null && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' })
      }
      updateData.rating = rating
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }
    if (startedAt !== undefined) {
      updateData.startedAt = startedAt ? new Date(startedAt) : null
    }
    if (finishedAt !== undefined) {
      updateData.finishedAt = finishedAt ? new Date(finishedAt) : null
    }

    const userBook = await prisma.userBook.upsert({
      where: { userId_bookId: { userId: user.id, bookId: id } },
      update: updateData,
      create: {
        userId: user.id,
        bookId: id,
        status: 'want_to_read',
        ...updateData
      }
    })

    return res.status(200).json(userBook)
  }

  if (req.method === 'DELETE') {
    await prisma.userBook.delete({
      where: { userId_bookId: { userId: user.id, bookId: id } }
    })
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
