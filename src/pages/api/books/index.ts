import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const books = await prisma.book.findMany({ orderBy: { createdAt: 'desc' } })
    return res.status(200).json(books)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions as any)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const { title, author, description } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Title is required' })

    const book = await prisma.book.create({ data: { title, author: author || null, description: description || null } })
    return res.status(201).json(book)
  }

  return res.status(405).end()
}
