import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Club ID is required' })
  }

  if (req.method === 'GET') {
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } }
        }
      }
    })

    if (!club) {
      return res.status(404).json({ error: 'Club not found' })
    }

    return res.status(200).json(club)
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

  const club = await prisma.club.findUnique({
    where: { id },
    include: { memberships: true }
  })

  if (!club) {
    return res.status(404).json({ error: 'Club not found' })
  }

  // Проверка прав: только админ может редактировать/удалять
  const membership = club.memberships.find(m => m.userId === user.id)
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only admins can modify the club' })
  }

  if (req.method === 'PUT') {
    const { name, description } = req.body || {}

    const updateData: any = {}
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Club name cannot be empty' })
      }
      updateData.name = name.trim()
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    const updated = await prisma.club.update({
      where: { id },
      data: updateData,
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } }
        }
      }
    })

    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    await prisma.club.delete({ where: { id } })
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
