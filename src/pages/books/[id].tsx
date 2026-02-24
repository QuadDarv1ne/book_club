import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useState } from 'react'
import { getSession } from 'next-auth/react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function BookPage() {
  const router = useRouter()
  const { id } = router.query
  const { data, error, mutate } = useSWR(id ? `/api/books/${id}` : null, fetcher)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')

  if (error) return <p style={{padding:24}}>Ошибка</p>
  if (!data) return <p style={{padding:24}}>Загрузка...</p>

  async function handleDelete() {
    const session = await getSession()
    if (!session) return alert('Требуется вход')
    await fetch(`/api/books/${id}`, { method: 'DELETE' })
    router.push('/books')
  }

  async function handleSave() {
    const session = await getSession()
    if (!session) return alert('Требуется вход')
    const res = await fetch(`/api/books/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title, author, description }) })
    if (res.ok) {
      mutate()
      setEditing(false)
    } else {
      alert('Ошибка при сохранении')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{data.title}</h1>
      <p>Автор: {data.author || '—'}</p>
      <p>{data.description}</p>

      {editing ? (
        <div style={{ maxWidth: 600 }}>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width: '100%', marginBottom:8 }} placeholder="Title" />
          <input value={author} onChange={e=>setAuthor(e.target.value)} style={{ width: '100%', marginBottom:8 }} placeholder="Author" />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} style={{ width: '100%', marginBottom:8 }} placeholder="Description" />
          <button onClick={handleSave}>Сохранить</button>
          <button onClick={()=>setEditing(false)}>Отмена</button>
        </div>
      ) : (
        <div>
          <button onClick={() => { setEditing(true); setTitle(data.title); setAuthor(data.author || ''); setDescription(data.description || '') }}>Изменить</button>
          <button onClick={handleDelete} style={{ marginLeft: 8 }}>Удалить</button>
        </div>
      )}
    </main>
  )
}
