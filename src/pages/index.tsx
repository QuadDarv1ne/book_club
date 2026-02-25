import Head from 'next/head'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Home() {
  const { data: session } = useSession()

  return (
    <>
      <Head>
        <title>Book Club — Книжный клуб</title>
        <meta name="description" content="Место, где любители чтения ведут дневники, делятся рецензиями и находят единомышленников" />
      </Head>
      <Layout>
        {/* Hero секция */}
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0',
          marginBottom: 40
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: 16 }}>
            📚 Добро пожаловать в Book Club
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 24px' }}>
            Место, где любители чтения ведут дневники, делятся рецензиями и находят единомышленников
          </p>
          {!session ? (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg">Начать бесплатно</Button>
              </Link>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg">Войти</Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/books" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg">Мои книги</Button>
              </Link>
              <Link href="/books/new" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg">Добавить книгу</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Карточки возможностей */}
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <Card title="📖 Дневник чтения" description="Ведите личный журнал прочитанных книг">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Отслеживайте прочитанные книги, сохраняйте заметки и планы на чтение в одном месте.
            </p>
            <Link href="/books" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">Перейти к книгам →</Button>
            </Link>
          </Card>

          <Card title="⭐ Оценки и рецензии" description="Делитесь мнением о книгах">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Оценивайте книги по 5-звёздочной шкале и пишите развёрнутые рецензии для сообщества.
            </p>
            <Link href="/books" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">Смотреть рецензии →</Button>
            </Link>
          </Card>

          <Card title="👥 Клубы по интересам" description="Находите единомышленников">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Создавайте и участвуйте в тематических клубах, обсуждайте любимые жанры.
            </p>
            <Link href="/clubs" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">Найти клуб →</Button>
            </Link>
          </Card>

          <Card title="🎯 Рекомендации" description="Персональные подборки">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Получайте рекомендации на основе ваших предпочтений и истории чтения.
            </p>
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">Мой профиль →</Button>
            </Link>
          </Card>
        </div>

        {/* Призыв к действию */}
        {!session && (
          <Card style={{ marginTop: 40, textAlign: 'center', padding: 40 }}>
            <h2 style={{ fontSize: '28px', marginBottom: 16 }}>Готовы начать?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
              Присоединяйтесь к Book Club сегодня и откройте для себя новый уровень чтения
            </p>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">Создать аккаунт</Button>
            </Link>
          </Card>
        )}
      </Layout>
    </>
  )
}
