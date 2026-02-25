import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@lib/prisma'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(200).json({ ok: true }) // don't reveal existence

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    // TODO: отправить письмо с ссылкой вида /reset?token=...
    // Для разработки возвращаем токен (удалите в продакшне).
    return res.status(200).json({ ok: true, token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
