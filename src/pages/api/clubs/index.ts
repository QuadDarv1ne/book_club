import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const clubs = await prisma.club.findMany({
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(clubs)
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

    const { name, description } = req.body || {}

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Club name is required' })
    }

    // Создаём клуб и сразу добавляем создателя как участника с ролью admin
    const club = await prisma.club.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        memberships: {
          create: {
            userId: user.id,
            role: 'admin'
          }
        }
      },
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } }
        }
      }
    })

    return res.status(201).json(club)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
