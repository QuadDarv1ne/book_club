import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma'
import { getServerSession } from 'next-auth/next'
import authOptions from '@lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Club ID is required' })
  }

  const club = await prisma.club.findUnique({
    where: { id },
    include: { memberships: true }
  })

  if (!club) {
    return res.status(404).json({ error: 'Club not found' })
  }

  if (req.method === 'GET') {
    const members = await prisma.membership.findMany({
      where: { clubId: id },
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    })
    return res.status(200).json(members)
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

  // Проверка прав: только админ может добавлять/удалять участников
  const adminMembership = club.memberships.find(m => m.userId === user.id && m.role === 'admin')
  
  if (req.method === 'POST') {
    // Пользователь может присоединиться сам, или админ может добавить
    const { userId } = req.body || {}
    const targetUserId = userId || user.id

    const existingMembership = club.memberships.find(m => m.userId === targetUserId)
    if (existingMembership) {
      return res.status(409).json({ error: 'User is already a member' })
    }

    const membership = await prisma.membership.create({
      data: {
        clubId: id,
        userId: targetUserId,
        role: userId && adminMembership ? 'member' : 'member'
      },
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    })

    return res.status(201).json(membership)
  }

  if (req.method === 'DELETE') {
    const { userId } = req.body || {}
    const targetUserId = userId || user.id

    // Пользователь может выйти сам, или админ может удалить
    const targetMembership = club.memberships.find(m => m.userId === targetUserId)
    if (!targetMembership) {
      return res.status(404).json({ error: 'User is not a member' })
    }

    if (targetUserId !== user.id && !adminMembership) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Нельзя удалить последнего админа
    if (targetMembership.role === 'admin') {
      const adminCount = club.memberships.filter(m => m.role === 'admin').length
      if (adminCount === 1 && targetMembership.userId === user.id) {
        return res.status(400).json({ error: 'Cannot remove the last admin' })
      }
    }

    await prisma.membership.delete({ where: { id: targetMembership.id } })
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
