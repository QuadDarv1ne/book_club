import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') return <p style={{ padding: 24 }}>Загрузка...</p>

  return (
    <main style={{ padding: 24 }}>
      <h1>Профиль</h1>
      <p>Имя: {session?.user?.name || '—'}</p>
      <p>Email: {session?.user?.email || '—'}</p>
      <button onClick={() => signOut({ callbackUrl: '/' })}>Выйти</button>
    </main>
  )
}
