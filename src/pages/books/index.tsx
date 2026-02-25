import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Books() {
  const [search, setSearch] = useState('')
  const { data, error, isLoading } = useSWR('/api/books', fetcher)

  const filteredBooks = data?.filter((book: any) =>
    book.title.toLowerCase().includes(search.toLowerCase()) ||
    book.author?.toLowerCase().includes(search.toLowerCase())
  )

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

      {!isLoading && !error && filteredBooks?.length === 0 && (
        <Card>
          <p>Книги не найдены</p>
        </Card>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredBooks?.map((book: any) => (
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
    </Layout>
  )
}
