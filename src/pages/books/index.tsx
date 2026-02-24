import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Books() {
  const { data, error } = useSWR('/api/books', fetcher)

  if (error) return <p style={{padding:24}}>Ошибка загрузки</p>
  if (!data) return <p style={{padding:24}}>Загрузка...</p>

  return (
    <main style={{ padding: 24 }}>
      <h1>Книги</h1>
      <p><Link href="/books/new">Добавить книгу</Link></p>
      <ul>
        {data.map((b: any) => (
          <li key={b.id} style={{ marginBottom: 12 }}>
            <Link href={`/books/${b.id}`}><a>{b.title}</a></Link>
            {b.author && <span> — {b.author}</span>}
          </li>
        ))}
      </ul>
    </main>
  )
}
