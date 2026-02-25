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
  const [userReviews, setUserReviews] = useState<any[]>([])
  const [userClubs, setUserClubs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Загрузка рецензий пользователя
  useEffect(() => {
    if (!session?.user?.email) return

    const loadUserData = async () => {
      setIsLoading(true)
      try {
        // Загружаем все книги и фильтруем рецензии
        const booksRes = await fetch('/api/books')
        const books = await booksRes.json()
        
        const allReviews: any[] = []
        for (const book of books) {
          const reviewsRes = await fetch(`/api/books/${book.id}/reviews`)
          const reviews = await reviewsRes.json()
          const userBookReviews = reviews.filter((r: any) => r.user?.email === session.user?.email)
          allReviews.push(...userBookReviews.map((r: any) => ({ ...r, book })))
        }
        
        setUserReviews(allReviews.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))

        // Загружаем клубы пользователя
        const clubsRes = await fetch('/api/clubs')
        const clubs = await clubsRes.json()
        const userClubsData = clubs.filter((c: any) =>
          c.memberships?.some((m: any) => m.user?.email === session.user?.email)
        )
        setUserClubs(userClubsData)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [session?.user?.email])

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="Профиль">
        <p>Загрузка...</p>
      </Layout>
    )
  }

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
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-color)' }}>
            {userReviews.length}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Рецензий</p>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-color)' }}>
            {userClubs.length}
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>Клубов</p>
        </Card>
      </div>

      {/* Мои рецензии */}
      <Card title="📝 Мои рецензии" style={{ marginBottom: 24 }}>
        {userReviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            У вас пока нет рецензий. <Link href="/books">Найдите книгу</Link> и поделитесь мнением!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {userReviews.slice(0, 5).map((review) => (
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
        {userClubs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Вы не состоите ни в одном клубе. <Link href="/clubs">Найдите клуб</Link> по интересам!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {userClubs.map((club) => (
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
                  <Badge variant="secondary">
                    👥 {club.memberships?.length || 0}
                  </Badge>
                  <style jsx>{`
                    .club-item:hover {
                      background-color: var(--bg-secondary);
                    }
                  `}</style>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  )
}
