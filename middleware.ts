/*
=========================================
HURBY — AUTH MIDDLEWARE
LOCAL:
middleware.ts

RESPONSABILIDADES:
- proteger rotas privadas
- validar sessão SSR
- bloquear acesso sem login
- estabilizar auth no App Router
- evitar acesso após logout

-----------------------------------------

ROTAS PROTEGIDAS:
- /broker
- /owner
- /agency
- /statement

-----------------------------------------

IMPORTANTE

Este é o ÚNICO middleware oficial do projeto.

NÃO criar:
- src/middleware.ts
- app/middleware.ts

-----------------------------------------

REGRAS DE SEGURANÇA

- nunca confiar apenas no frontend
- sessão deve ser validada no middleware
- páginas protegidas devem passar por SSR auth
- logout deve invalidar sessão completamente

-----------------------------------------

DEPENDÊNCIAS

- @supabase/ssr
- auth.users
- users_profile

=========================================
*/

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },

        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },

        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // -------------------------------------
  // VALIDAÇÃO DE SESSÃO
  // -------------------------------------

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // -------------------------------------
  // ROTAS PROTEGIDAS
  // -------------------------------------

  const protectedRoutes = [
    '/broker',
    '/owner',
    '/agency',
    '/statement',
  ]

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // -------------------------------------
  // BLOQUEIO SEM LOGIN
  // -------------------------------------

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    '/broker/:path*',
    '/owner/:path*',
    '/agency/:path*',
    '/statement/:path*',
  ],
}