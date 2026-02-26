import { useState, useMemo, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { useSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ITEMS_PER_PAGE = 9

const statusFilters = [
  { value: 'all', label: 'Все книги' },
  { value: 'want_to_read', label: '📚 Хочу прочитать' },
  { value: 'reading', label: '📖 Читаю' },
  { value: 'read', label: '✅ Прочитано' }
]

export default function Books() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'author'>('newest')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const { data: books, error, isLoading } = useSWR('/api/books', fetcher)
  const { data: userBooks } = useSWR(session ? '/api/user-books' : null, fetcher)

  const userBooksMap = new Map(userBooks?.map((ub: any) => [ub.bookId, ub]))

  const filteredAndSortedBooks = useMemo(() => {
    if (!books) return []

    let result = [...books]

    // Фильтрация по статусу
    if (session && statusFilter !== 'all') {
      const bookIds = userBooks
        ?.filter((ub: any) => ub.status === statusFilter)
        .map((ub: any) => ub.bookId) || []
      result = result.filter((book: any) => bookIds.includes(book.id))
    }

    // Поиск
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter((book: any) =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author?.toLowerCase().includes(searchLower)
      )
    }

    // Сортировка
    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return (a.author || '').localeCompare(b.author || '')
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [books, userBooks, session, statusFilter, search, sortBy])

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE)
  const paginatedBooks = filteredAndSortedBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const getBookStatus = (bookId: string): string | undefined => (userBooksMap.get(bookId) as any)?.status

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    const badges: Record<string, { label: string; variant: string }> = {
      want_to_read: { label: '📚 Хочу прочитать', variant: 'secondary' },
      reading: { label: '📖 Читаю', variant: 'primary' },
      read: { label: '✅ Прочитано', variant: 'success' }
    }
    const badge = badges[status]
    if (!badge) return null
    return <Badge variant={badge.variant as any}>{badge.label}</Badge>
  }

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy, statusFilter])

  return (
    <Layout title="Книги">
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            placeholder="Поиск по названию или автору..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'author')}
          style={{
            padding: '10px 12px',
            fontSize: '16px',
            borderRadius: 6,
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="newest">Сначала новые</option>
          <option value="title">По названию</option>
          <option value="author">По автору</option>
        </select>
        <Link href="/books/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary">+ Добавить книгу</Button>
        </Link>
      </div>

      {session && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: statusFilter === filter.value ? '2px solid var(--accent-color, #0070f3)' : '1px solid var(--border-color, #ccc)',
                backgroundColor: statusFilter === filter.value ? 'var(--accent-color, #0070f3)' : 'transparent',
                color: statusFilter === filter.value ? '#fff' : 'var(--text-primary, #333)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && <p>Загрузка книг...</p>}

      {error && (
        <Card>
          <p style={{ color: 'var(--danger-color)'}}>Ошибка загрузки книг</p>
        </Card>
      )}

      {!isLoading && !error && filteredAndSortedBooks.length === 0 && (
        <Card>
          <p>Книги не найдены</p>
        </Card>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {paginatedBooks.map((book: any) => (
          <Link href={`/books/${book.id}`} key={book.id} style={{ textDecoration: 'none' }}>
            <Card
              title={book.title}
              description={book.author || 'Неизвестный автор'}
              style={{ height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}
              className="book-card"
            >
              {book.description && (
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {book.description}
                </p>
              )}
              {session && getBookStatus(book.id) && (
                <div style={{ marginTop: 12 }}>
                  {getStatusBadge(getBookStatus(book.id))}
                </div>
              )}
              <style jsx>{`
                .book-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
              `}</style>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Назад
          </Button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Вперёд →
          </Button>
        </div>
      )}
    </Layout>
  )
}
