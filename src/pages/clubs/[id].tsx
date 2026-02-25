import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ClubPage() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: club, error: clubError } = useSWR(id ? `/api/clubs/${id}` : null, fetcher)
  const { data: members } = useSWR(id ? `/api/clubs/${id}/members` : null, fetcher)

  const isAdmin = session && club?.memberships?.some(
    (m: any) => m.user?.email === session.user?.email && m.role === 'admin'
  )
  const isMember = session && club?.memberships?.some(
    (m: any) => m.user?.email === session.user?.email
  )

  const handleJoin = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/clubs/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при вступлении в клуб')
      }

      mutate(`/api/clubs/${id}`)
      mutate(`/api/clubs/${id}/members`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Вы уверены, что хотите выйти из клуба?')) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/clubs/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при выходе из клуба')
      }

      mutate(`/api/clubs/${id}`)
      mutate(`/api/clubs/${id}/members`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!editName.trim()) {
      setError('Название клуба обязательно')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/clubs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDescription })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при обновлении клуба')
      }

      mutate(`/api/clubs/${id}`)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClub = async () => {
    if (!confirm('Вы уверены, что хотите удалить клуб? Это действие нельзя отменить.')) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/clubs/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Ошибка при удалении клуба')
      }
      router.push('/clubs')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!id) {
    return (
      <Layout title="Клуб">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  if (clubError) {
    return (
      <Layout title="Клуб">
        <Alert variant="error">Ошибка загрузки клуба</Alert>
        <Link href="/clubs">
          <Button variant="secondary">← Назад к клубам</Button>
        </Link>
      </Layout>
    )
  }

  if (!club) {
    return (
      <Layout title="Клуб">
        <p>Загрузка...</p>
      </Layout>
    )
  }

  return (
    <Layout title={club.name}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/clubs">
          <Button variant="ghost" size="sm">← Назад к клубам</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Информация о клубе */}
        <Card title="О клубе">
          {isEditing && isAdmin ? (
            <form onSubmit={handleUpdateClub}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: '100%', marginBottom: 12, padding: 8, fontSize: 16 }}
                placeholder="Название клуба"
                disabled={isSubmitting}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{ width: '100%', marginBottom: 12, padding: 8, fontSize: 14, minHeight: 100 }}
                placeholder="Описание клуба"
                disabled={isSubmitting}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="submit" variant="primary" isLoading={isSubmitting} size="sm">
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditName(club.name)
                    setEditDescription(club.description || '')
                  }}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p style={{ fontSize: '16px', marginBottom: 8 }}>
                <strong>Название:</strong> {club.name}
              </p>
              {club.description ? (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {club.description}
                </p>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Описание отсутствует
                </p>
              )}

              <div style={{ marginTop: 16 }}>
                <Badge variant="secondary">
                  👥 {club.memberships?.length || 0} участников
                </Badge>
              </div>

              {isAdmin && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true)
                      setEditName(club.name)
                      setEditDescription(club.description || '')
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteClub}>
                    Удалить клуб
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Действия для участника */}
        <Card title="Участие">
          {isMember ? (
            <>
              <Alert variant="success" style={{ marginBottom: 16 }}>
                Вы являетесь участником клуба
              </Alert>
              <Button variant="danger" onClick={handleLeave} isLoading={isSubmitting}>
                Выйти из клуба
              </Button>
            </>
          ) : (
            <>
              <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                Присоединяйтесь к клубу, чтобы участвовать в обсуждениях
              </p>
              <Button variant="primary" onClick={handleJoin} isLoading={isSubmitting}>
                Вступить в клуб
              </Button>
            </>
          )}
        </Card>
      </div>

      {/* Участники */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '24px', marginBottom: 16 }}>Участники</h2>

        {!members || members.length === 0 ? (
          <Card>
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Пока нет участников
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {members.map((member: any) => (
              <Card key={member.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {member.user?.image && (
                    <img
                      src={member.user.image}
                      alt={member.user.name || 'User'}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>
                      {member.user?.name || member.user?.email || 'Аноним'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      {member.user?.email}
                    </p>
                  </div>
                  <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'}>
                    {member.role === 'admin' ? '👑 Админ' : '👤 Участник'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
