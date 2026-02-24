import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

export default function Register() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    // client-side validation
    if (!validateEmail(email)) {
      setError('Некорректный email')
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // После успешной регистрации пробуем сразу войти
      const signInRes = await signIn('credentials', { redirect: false, email, password })
      setLoading(false)
      // @ts-ignore
      if (signInRes?.ok) {
        router.push('/profile')
      } else {
        setError('Registration succeeded but automatic sign-in failed')
      }
    } catch (err) {
      console.error(err)
      setError('Internal error')
      setLoading(false)
    }
  }

  function validateEmail(input: string) {
    return /^\S+@\S+\.\S+$/.test(input)
  }

  const isValid = validateEmail(email) && password.length >= 8

  return (
    <main style={{ padding: 24 }}>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Имя</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" style={{ width: '100%', marginBottom: 12 }} />

        <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" style={{ width: '100%', marginBottom: 12 }} />

        <label style={{ display: 'block', marginBottom: 8 }}>Пароль (мин 8 символов)</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={{ width: '100%', marginBottom: 12 }} />

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading || !isValid}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
      </form>
    </main>
  )
}
