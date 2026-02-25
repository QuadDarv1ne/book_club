import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { Layout } from '../../../components/Layout'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Textarea } from '../../../components/ui/Textarea'
import { Alert } from '../../../components/ui/Alert'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function EditReview() {
  const router = useRouter()
  const { id, bookId } = router.query
  const { data: session, status } = useSession()

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: review, error: reviewError } = useSWR(id ? `/api/reviews/${id}` : null, fetcher)

  useEffect(() => {
    if (review) {
      setRating(review.rating || 5)
      setContent(review.content || '')
    }
  }, [review])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Текст рецензии обязателен')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), rating })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при обновлении рецензии')
      }

      router.push(`/books/${bookId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || !review) {
    return (
      <Layout title="Редактировать рецензию">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  if (reviewError) {
    return (
      <Layout title="Редактировать рецензию">
        <Alert variant="error">Ошибка загрузки рецензии</Alert>
        {bookId && (
          <Link href={`/books/${bookId}`}>
            <Button variant="secondary">← Назад к книге</Button>
          </Link>
        )}
      </Layout>
    )
  }

  return (
    <Layout title="Редактировать рецензию">
      <Card style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Оценка:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px',
                    color: star <= rating ? '#ffc107' : '#ccc',
                    transition: 'color 0.2s'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Ваша рецензия *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Поделитесь своим мнением о книге"
            rows={6}
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
            <Link href={`/books/${bookId}`} style={{ textDecoration: 'none' }}>
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
