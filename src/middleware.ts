import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Если пользователь авторизован и пытается попасть на страницы auth
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                       req.nextUrl.pathname.startsWith('/register')

    if (token && isAuthPage) {
      return NextResponse.redirect(new URL('/profile', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Защищённые роуты
export const config = {
  matcher: [
    '/books/new',
    '/books/:path*',
    '/clubs/:path*',
    '/profile',
    '/login',
    '/register'
  ]
}
