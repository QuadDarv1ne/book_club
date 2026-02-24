import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || Array.isArray(id)) return res.status(400).end()

  if (req.method === 'GET') {
    const book = await prisma.book.findUnique({ where: { id } })
    if (!book) return res.status(404).end()
    return res.status(200).json(book)
  }

  const session = await getServerSession(req, res, authOptions as any)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'PUT') {
    const { title, author, description } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const updated = await prisma.book.update({ where: { id }, data: { title, author: author || null, description: description || null } })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.book.delete({ where: { id } })
    return res.status(204).end()
  }

  return res.status(405).end()
}
