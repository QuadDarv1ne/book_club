import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

export default function Login() {
  const router = useRouter()
  const { data: session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  // Перенаправляем если уже авторизован
  if (session) {
    router.push('/profile')
    return null
  }

  function validateForm() {
    const errors: { [key: string]: string } = {}

    if (!email.trim()) {
      errors.email = 'Email обязателен'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Введите корректный email'
    }

    if (!password) {
      errors.password = 'Пароль обязателен'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const res: any = await signIn('credentials', { redirect: false, email, password })

      if (res?.error) {
        throw new Error(res.error || 'Неверный email или пароль')
      }

      // Получаем redirect из query params или перенаправляем на профиль
      const callbackUrl = (router.query.callbackUrl as string) || '/profile'
      router.push(callbackUrl)
    } catch (err: any) {
      setError(err.message || 'Внутренняя ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Вход">
      <Card style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            error={fieldErrors.email}
            disabled={loading}
            autoComplete="email"
          />

          <Input
            label="Пароль *"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="current-password"
          />

          {error && (
            <Alert variant="error" style={{ marginBottom: 16 }}>
              {error}
            </Alert>
          )}

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Войти
          </Button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link href="/register" style={{ color: 'var(--accent-color)', fontSize: 14 }}>
              Нет аккаунта? Зарегистрироваться
            </Link>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => signIn('github', { callbackUrl: '/profile' })}
              disabled={loading}
            >
              <svg style={{ width: 20, height: 20, marginRight: 8 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Войти через GitHub
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  )
}
