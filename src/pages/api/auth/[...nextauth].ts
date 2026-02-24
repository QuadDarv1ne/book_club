import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Пример минимальной конфигурации NextAuth.
// Для продакшена рекомендуем использовать провайдеры OAuth (GitHub, Google) и/или адаптер Prisma.

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Здесь добавьте логику проверки пользователя (по базе данных).
        // В демо-режиме возвращаем фиктивного пользователя при наличии email.
        if (credentials?.email) {
          return { id: 'demo', name: 'Demo User', email: credentials.email }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }
})
