import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, getSession } from 'next-auth/react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Alert } from '../../components/ui/Alert'

export default function NewBook() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Название книги обязательно')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author: author || null, description: description || null })
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Ошибка при создании книги')
      }

      const book = await res.json()
      router.push(`/books/${book.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <Layout title="Добавить книгу">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout title="Добавить книгу">
        <Alert variant="error">
          Для добавления книги необходимо <a href="/login">войти</a>
        </Alert>
      </Layout>
    )
  }

  return (
    <Layout title="Добавить книгу">
      <Card style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Название книги *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название книги"
            required
            disabled={isSubmitting}
          />

          <Input
            label="Автор"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Введите имя автора"
            disabled={isSubmitting}
          />

          <Textarea
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание книги"
            rows={4}
            disabled={isSubmitting}
          />

          {error && (
            <Alert variant="error" style={{ marginBottom: 16 }}>
              {error}
            </Alert>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Создать книгу
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  )
}
