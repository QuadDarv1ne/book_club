import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, password } = req.body || {}
  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' })
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  try {
    const v = await prisma.verificationToken.findUnique({ where: { token } })
    if (!v) return res.status(400).json({ error: 'Invalid or expired token' })
    if (v.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } })
      return res.status(400).json({ error: 'Token expired' })
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.user.update({ where: { email: v.identifier }, data: { password: hashed } })
    await prisma.verificationToken.deleteMany({ where: { token } })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
