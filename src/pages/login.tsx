import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res: any = await signIn('credentials', { redirect: false, email, password })
      setLoading(false)
      if (res?.error) {
        setError(res.error)
        return
      }
      router.push('/profile')
    } catch (err) {
      console.error(err)
      setError('Internal error')
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Вход</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" style={{ width: '100%', marginBottom: 12 }} />

        <label style={{ display: 'block', marginBottom: 8 }}>Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={{ width: '100%', marginBottom: 12 }} />

        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
      </form>
    </main>
  )
}
