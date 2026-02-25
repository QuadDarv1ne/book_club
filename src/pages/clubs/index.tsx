import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Clubs() {
  const router = useRouter()
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newClubName, setNewClubName] = useState('')
  const [newClubDescription, setNewClubDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: clubs, error: clubsError, isLoading } = useSWR('/api/clubs', fetcher)

  const filteredClubs = clubs?.filter((club: any) =>
    club.name.toLowerCase().includes(search.toLowerCase()) ||
    club.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newClubName.trim()) {
      setError('Название клуба обязательно')
      return
    }

    setIsCreating(true)

    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClubName, description: newClubDescription })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при создании клуба')
      }

      mutate('/api/clubs')
      router.push(`/clubs/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCreating(false)
      setNewClubName('')
      setNewClubDescription('')
    }
  }

  return (
    <Layout title="Клубы">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              placeholder="Поиск клубов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        {session && (
          <Card>
            <form onSubmit={handleCreateClub}>
              <h3 style={{ marginBottom: 16 }}>Создать клуб</h3>
              <Input
                label="Название клуба *"
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                placeholder="Введите название клуба"
                disabled={isCreating}
              />
              <Input
                label="Описание"
                value={newClubDescription}
                onChange={(e) => setNewClubDescription(e.target.value)}
                placeholder="Краткое описание клуба"
                disabled={isCreating}
              />
              {error && (
                <Alert variant="error" style={{ marginBottom: 16 }}>
                  {error}
                </Alert>
              )}
              <Button type="submit" variant="primary" isLoading={isCreating}>
                Создать клуб
              </Button>
            </form>
          </Card>
        )}
      </div>

      {isLoading && <p>Загрузка клубов...</p>}

      {clubsError && (
        <Alert variant="error">Ошибка загрузки клубов</Alert>
      )}

      {!isLoading && !clubsError && filteredClubs?.length === 0 && (
        <Card>
          <p>Клубы не найдены</p>
        </Card>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredClubs?.map((club: any) => (
          <Link href={`/clubs/${club.id}`} key={club.id} style={{ textDecoration: 'none' }}>
            <Card
              title={club.name}
              description={club.description || 'Описание отсутствует'}
              style={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
              className="club-card"
            >
              <div style={{ marginTop: 12 }}>
                <Badge variant="secondary">
                  👥 {club.memberships?.length || 0} участников
                </Badge>
              </div>
              <style jsx>{`
                .club-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
              `}</style>
            </Card>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
