import React, { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Container } from './ui/Container'
import { Button } from './ui/Button'

export interface LayoutProps {
  children: ReactNode
  title?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { data: session, status } = useSession()

  const headerStyles: CSSProperties = {
    backgroundColor: 'var(--header-bg, #fff)',
    borderBottom: '1px solid var(--border-color, #eaeaea)',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  }

  const navStyles: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const logoStyles: CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--accent-color, #0070f3)',
    textDecoration: 'none',
  }

  const navLinksStyles: CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  }

  const linkStyles: CSSProperties = {
    color: 'var(--text-primary, #333)',
    textDecoration: 'none',
    fontSize: '14px',
  }

  const mainStyles: CSSProperties = {
    minHeight: 'calc(100vh - 140px)',
    padding: '40px 0',
    backgroundColor: 'var(--bg-secondary, #f9f9f9)',
  }

  const footerStyles: CSSProperties = {
    backgroundColor: 'var(--footer-bg, #fff)',
    borderTop: '1px solid var(--border-color, #eaeaea)',
    padding: '24px 0',
    textAlign: 'center',
    fontSize: '14px',
    color: 'var(--text-secondary, #666)',
  }

  return (
    <>
      <header style={headerStyles}>
        <Container>
          <nav style={navStyles}>
            <Link href="/" style={logoStyles}>
              📚 Book Club
            </Link>
            <div style={navLinksStyles}>
              <Link href="/books" style={linkStyles}>
                Книги
              </Link>
              <Link href="/clubs" style={linkStyles}>
                Клубы
              </Link>
              {status === 'authenticated' ? (
                <>
                  <Link href="/profile" style={linkStyles}>
                    Профиль
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" style={linkStyles}>
                    Войти
                  </Link>
                  <Link href="/register" style={linkStyles}>
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </nav>
        </Container>
      </header>

      <main style={mainStyles}>
        <Container>
          {title && (
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                marginBottom: '24px',
                color: 'var(--text-primary, #333)',
              }}
            >
              {title}
            </h1>
          )}
          {children}
        </Container>
      </main>

      <footer style={footerStyles}>
        <Container>
          <p>© 2026 Book Club. Все права защищены.</p>
        </Container>
      </footer>
    </>
  )
}
