import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.getAll().find((c) =>
    c.name.includes('access-token')
  )?.value

  const isLoginPage = request.nextUrl.pathname === '/login'

  // 🔴 se não tem token válido → bloqueia
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 🔴 se tem token → impede voltar pro login
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/login'],
}