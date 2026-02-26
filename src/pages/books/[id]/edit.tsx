import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Layout } from '../../../components/Layout'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { Alert } from '../../../components/ui/Alert'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function EditBook() {
  const router = useRouter()
  const { id } = router.query
  const { data: session, status } = useSession()
  const { data: book, error: bookError } = useSWR(id ? `/api/books/${id}` : null, fetcher)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (book) {
      setTitle(book.title || '')
      setAuthor(book.author || '')
      setDescription(book.description || '')
    }
  }, [book])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Название книги обязательно')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author: author || null, description: description || null })
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Ошибка при обновлении книги')
      }

      router.push(`/books/${id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || !book) {
    return (
      <Layout title="Редактировать книгу">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  if (bookError || !book) {
    return (
      <Layout title="Редактировать книгу">
        <Alert variant="error">Книга не найдена</Alert>
        <Link href="/books">
          <Button variant="secondary">← Назад к книгам</Button>
        </Link>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout title="Редактировать книгу">
        <Alert variant="error">
          Для редактирования книги необходимо <a href="/login">войти</a>
        </Alert>
      </Layout>
    )
  }

  return (
    <Layout title="Редактировать книгу">
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
              Сохранить изменения
            </Button>
            <Link href={`/books/${id}`} style={{ textDecoration: 'none' }}>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Отмена
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </Layout>
  )
}
