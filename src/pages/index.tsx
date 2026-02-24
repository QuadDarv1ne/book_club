import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Book Club</title>
        <meta name="description" content="Книжный клуб" />
      </Head>
      <main style={{padding: 40}}>
        <h1>Добро пожаловать в Book Club</h1>
        <p>Начните вести дневник чтения, читать рецензии и участвовать в клубах.</p>
        <p>
          <Link href="/api/auth/signin">Войти / Зарегистрироваться</Link>
        </p>
      </main>
    </>
  )
}
