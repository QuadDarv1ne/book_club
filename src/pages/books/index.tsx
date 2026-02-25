import { useState, useMemo, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ITEMS_PER_PAGE = 9

export default function Books() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'author'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const { data, error, isLoading } = useSWR('/api/books', fetcher)

  const filteredAndSortedBooks = useMemo(() => {
    if (!data) return []

    let result = [...data]

    // Фильтрация
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
  }, [data, search, sortBy])

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedBooks.length / ITEMS_PER_PAGE)
  const paginatedBooks = filteredAndSortedBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Сброс страницы при изменении поиска или сортировки
  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy])

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
