import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert } from '../components/ui/Alert'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Profile() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { data: profileData, error } = useSWR(session ? '/api/profile' : null, fetcher)

  if (status === 'loading' || !profileData) {
    return (
      <Layout title="Профиль">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  const { user, stats, recentReviews, clubs } = profileData

  return (
    <Layout title="Профиль">
      {/* Информация о пользователе */}
      <Card title="👤 Информация" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: 'white',
              fontWeight: 700
            }}>
              {(session?.user?.name || session?.user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>{session?.user?.name || 'Пользователь'}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
              {session?.user?.email}
            </p>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/' })}>
            Выйти
          </Button>
        </div>
      </Card>

      {/* Статистика */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 24 }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-color)' }}>
            {stats.totalBooks}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Всего книг</p>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#28a745' }}>
            {stats.read}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Прочитано</p>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0070f3' }}>
            {stats.reading}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Читаю</p>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#6c757d' }}>
            {stats.wantToRead}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Хочу прочитать</p>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ffc107' }}>
            ⭐ {stats.averageRating}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Средний рейтинг</p>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#dc3545' }}>
            {stats.booksThisYear}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Книг в {new Date().getFullYear()}</p>
        </Card>
      </div>

      {/* Мои рецензии */}
      <Card title="📝 Мои рецензии" style={{ marginBottom: 24 }}>
        {error && (
          <Alert variant="error">Ошибка загрузки данных</Alert>
        )}
        {recentReviews?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            У вас пока нет рецензий. <Link href="/books">Найдите книгу</Link> и поделитесь мнением!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {recentReviews?.slice(0, 5).map((review: any) => (
              <div key={review.id} style={{
                padding: 16,
                border: '1px solid var(--border-color)',
                borderRadius: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Link href={`/books/${review.book.id}`} style={{ fontWeight: 600 }}>
                    {review.book.title}
                  </Link>
                  <Badge variant={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </Badge>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>
                  {review.content}
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Мои клубы */}
      <Card title="👥 Мои клубы">
        {clubs?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Вы не состоите ни в одном клубе. <Link href="/clubs">Найдите клуб</Link> по интересам!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {clubs?.map((m: any) => {
              const club = m.club
              return (
                <Link key={club.id} href={`/clubs/${club.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: 12,
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  className="club-item"
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{club.name}</p>
                      {club.description && (
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {club.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={m.role === 'admin' ? 'primary' : 'secondary'}>
                      {m.role === 'admin' ? '👑 Админ' : '👤 Участник'}
                    </Badge>
                    <style jsx>{`
                      .club-item:hover {
                        background-color: var(--bg-secondary);
                      }
                    `}</style>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Card>
    </Layout>
  )
}
