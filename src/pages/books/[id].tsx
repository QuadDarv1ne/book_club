import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Textarea'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function BookPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()

  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: book, error: bookError } = useSWR(id ? `/api/books/${id}` : null, fetcher)
  const { data: reviews, error: reviewsError } = useSWR(id ? `/api/books/${id}/reviews` : null, fetcher)

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) return

    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/books')
    } else {
      setError('Ошибка при удалении книги')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!content.trim()) {
      setError('Текст рецензии обязателен')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/books/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, rating })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при создании рецензии')
      }

      setSuccess(true)
      setContent('')
      setRating(5)
      mutate(`/api/books/${id}/reviews`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!id) {
    return (
      <Layout title="Книга">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  if (bookError) {
    return (
      <Layout title="Книга">
        <Alert variant="error">Ошибка загрузки книги</Alert>
        <Link href="/books">
          <Button variant="secondary">← Назад к книгам</Button>
        </Link>
      </Layout>
    )
  }

  if (!book) {
    return (
      <Layout title="Книга">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <Layout title={book.title}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/books">
          <Button variant="ghost" size="sm">← Назад к книгам</Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Информация о книге */}
        <Card title="О книге">
          {book.author && (
            <p style={{ fontSize: '16px', marginBottom: 8 }}>
              <strong>Автор:</strong> {book.author}
            </p>
          )}
          {book.description && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {book.description}
            </p>
          )}
          {!book.description && (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Описание отсутствует
            </p>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            {averageRating && (
              <Badge variant="default">
                ⭐ {averageRating} / 5
              </Badge>
            )}
            <Badge variant="secondary">
              📝 {reviews?.length || 0} рецензий
            </Badge>
          </div>

          {session && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
              <Link href={`/books/${id}/edit`} style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm">
                  Редактировать
                </Button>
              </Link>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Удалить книгу
              </Button>
            </div>
          )}
        </Card>

        {/* Форма добавления рецензии */}
        {session && !reviews?.some((r: any) => r.user?.email === session.user?.email) && (
          <Card title="Оставить рецензию">
            <form onSubmit={handleSubmitReview}>
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
                label="Ваша рецензия"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Поделитесь своим мнением о книге..."
                rows={4}
                disabled={isSubmitting}
              />

              {error && (
                <Alert variant="error" style={{ marginBottom: 16 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" style={{ marginBottom: 16 }}>
                  Рецензия успешно добавлена!
                </Alert>
              )}

              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Опубликовать рецензию
              </Button>
            </form>
          </Card>
        )}

        {session && reviews?.some((r: any) => r.user?.email === session.user?.email) && (
          <Card>
            <Alert variant="info">
              Вы уже оставили рецензию на эту книгу
            </Alert>
          </Card>
        )}

        {!session && (
          <Card>
            <Alert variant="info">
              <Link href="/login">Войдите</Link>, чтобы оставить рецензию
            </Alert>
          </Card>
        )}
      </div>

      {/* Список рецензий */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '24px', marginBottom: 16 }}>Рецензии</h2>

        {reviewsError && (
          <Alert variant="error">Ошибка загрузки рецензий</Alert>
        )}

        {!reviews || reviews.length === 0 ? (
          <Card>
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Пока нет рецензий. Будьте первым!
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {reviews.map((review: any) => {
              const isOwnReview = session?.user?.email === review.user?.email
              return (
                <Card key={review.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {review.user?.image && (
                        <img
                          src={review.user.image}
                          alt={review.user.name || 'User'}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <p style={{ fontWeight: 600, margin: 0 }}>
                          {review.user?.name || review.user?.email || 'Аноним'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                          {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Badge variant={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </Badge>
                      {isOwnReview && (
                        <Link href={`/reviews/${review.id}/edit?bookId=${id}`} style={{ textDecoration: 'none' }}>
                          <Button variant="ghost" size="sm">
                            Редактировать
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{review.content}</p>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
