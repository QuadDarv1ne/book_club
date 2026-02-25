import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  function validateEmail(input: string) {
    return /^\S+@\S+\.\S+$/.test(input)
  }

  function validateForm() {
    const errors: { [key: string]: string } = {}

    if (!name.trim()) {
      errors.name = 'Имя обязательно'
    } else if (name.trim().length < 2) {
      errors.name = 'Имя должно содержать минимум 2 символа'
    }

    if (!email.trim()) {
      errors.email = 'Email обязателен'
    } else if (!validateEmail(email)) {
      errors.email = 'Введите корректный email'
    }

    if (!password) {
      errors.password = 'Пароль обязателен'
    } else if (password.length < 8) {
      errors.password = 'Минимум 8 символов'
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Пароль должен содержать буквы и цифры'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают'
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Ошибка при регистрации')
      }

      // Автоматический вход после регистрации
      const signInRes = await signIn('credentials', { redirect: false, email, password })

      if (signInRes?.error) {
        throw new Error('Регистрация успешна, но вход не выполнен. Пожалуйста, войдите вручную.')
      }

      router.push('/profile')
    } catch (err: any) {
      setError(err.message || 'Внутренняя ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Регистрация">
      <Card style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Имя *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            error={fieldErrors.name}
            disabled={loading}
            autoComplete="name"
          />

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
            placeholder="Минимум 8 символов"
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="new-password"
          />

          <Input
            label="Подтверждение пароля *"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            error={fieldErrors.confirmPassword}
            disabled={loading}
            autoComplete="new-password"
          />

          {error && (
            <Alert variant="error" style={{ marginBottom: 16 }}>
              {error}
            </Alert>
          )}

          <Alert variant="info" style={{ marginBottom: 16 }}>
            <strong>Требования к паролю:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              <li>Минимум 8 символов</li>
              <li>Должен содержать буквы и цифры</li>
            </ul>
          </Alert>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Зарегистрироваться
          </Button>

          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-secondary)' }}>
            Уже есть аккаунт?{' '}
            <Link href="/login" style={{ color: 'var(--accent-color)' }}>
              Войти
            </Link>
          </p>
        </form>
      </Card>
    </Layout>
  )
}
