/*
=========================================
HURBY — AUTH MIDDLEWARE
LOCAL:
middleware.ts

STATUS:
SSR_CLOUD_PATCH
OPERATIONS_FOUNDATION_ENABLED

RESPONSABILIDADES:
- proteger rotas privadas
- validar sessão SSR
- sincronizar cookies auth
- manter persistência auth cloud
- estabilizar Supabase SSR no Vercel
- bloquear acesso sem login
- evitar loop login -> login
- proteger núcleos operacionais

-----------------------------------------

PROBLEMA CORRIGIDO

[2026-05-07]

Problema identificado em ambiente cloud:

- login funcionava
- signup funcionava
- usuário era criado
- middleware redirecionava novamente para /login

Causa raiz:

- uso de getSession() no middleware edge
- sincronização incompleta de cookies SSR
- sessão stale no runtime da Vercel

-----------------------------------------

CORREÇÃO OFICIAL

Implementado:

✔ getUser() no lugar de getSession()
✔ sincronização completa cookies SSR
✔ ressincronização response cookies
✔ compatibilidade App Router
✔ compatibilidade Vercel Edge Runtime
✔ persistência auth cloud

-----------------------------------------

ROTAS PROTEGIDAS:
- /broker
- /owner
- /agency
- /statement
- /operations

-----------------------------------------

OPERATIONS FOUNDATION

IMPORTANTE:

/operations pertence aos núcleos
operacionais privados do ecossistema.

EXEMPLO:
- CORE_PROPERTIES
- CORE_PROPERTY_MANAGEMENT
- futuros cores operacionais

REGRAS:
- acesso somente autenticado
- nunca expor páginas operacionais publicamente
- frontend protegido + backend protegido
- RLS continua obrigatório

-----------------------------------------

MATCHER STRATEGY

IMPORTANTE:

matcher precisa proteger:
- rota raiz
- subrotas

EXEMPLO:
✔ /operations
✔ /operations/properties

O matcher do Next.js pode não aplicar
proteção corretamente apenas com:
'/operations/:path*'

Por isso:
sempre registrar:
- rota raiz
- rota wildcard

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
        get(name: string) {
          return request.cookies.get(name)?.value
        },

        set(
          name: string,
          value: string,
          options
        ) {
          request.cookies.set({
            name,
            value,
            ...options,
          })

          response = NextResponse.next({
            request,
          })

          response.cookies.set({
            name,
            value,
            ...options,
          })
        },

        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          response = NextResponse.next({
            request,
          })

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
  // VALIDAÇÃO SSR OFICIAL
  // -------------------------------------
  //
  // IMPORTANTE:
  // getUser() é obrigatório em middleware SSR
  // para evitar stale session na Vercel.
  //
  // getSession() pode gerar:
  // - loop login -> login
  // - sessão fantasma
  // - perda de persistência auth
  //
  // -------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // -------------------------------------
  // ROTAS PROTEGIDAS
  // -------------------------------------

  const protectedRoutes = [
    '/broker',
    '/owner',
    '/agency',
    '/statement',
    '/operations',
  ]

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      request.nextUrl.pathname.startsWith(route)
  )

  // -------------------------------------
  // BLOQUEIO SEM LOGIN
  // -------------------------------------

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    '/broker',
    '/broker/:path*',

    '/owner',
    '/owner/:path*',

    '/agency',
    '/agency/:path*',

    '/statement',
    '/statement/:path*',

    '/operations',
    '/operations/:path*',
  ],
}