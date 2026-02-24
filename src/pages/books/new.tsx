import { useState } from 'react'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'

export default function NewBook() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const session = await getSession()
    if (!session) {
      setError('Требуется вход')
      return
    }

    const res = await fetch('/api/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, author, description }) })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error || 'Ошибка')
      return
    }
    const b = await res.json()
    router.push(`/books/${b.id}`)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Добавить книгу</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <label>Название</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <label>Автор</label>
        <input value={author} onChange={e => setAuthor(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <label>Описание</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit">Создать</button>
      </form>
    </main>
  )
}
