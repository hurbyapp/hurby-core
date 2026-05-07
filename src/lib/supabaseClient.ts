/*
=========================================
HURBY — SUPABASE CLIENT
LOCAL:
src/lib/supabaseClient.ts

STATUS:
SSR_BROWSER_STABILIZED

RESPONSABILIDADES:
- criar browser client oficial
- persistir auth cloud
- sincronizar cookies SSR
- compatibilidade App Router
- compatibilidade middleware SSR
- estabilizar auth Vercel

-----------------------------------------

PROBLEMAS HISTÓRICOS

[2026-05-07]

Problemas identificados:
- sessão não persistia na Vercel
- cookies auth ausentes
- loop login -> login
- middleware sem sessão
- hydration inconsistente
- auth cloud parcialmente funcional

-----------------------------------------

CAUSA RAIZ

Uso legado:
- createClient()
- @supabase/supabase-js

Em arquitetura moderna:
- Next.js App Router
- SSR middleware
- Vercel Edge Runtime

-----------------------------------------

CORREÇÃO IMPLEMENTADA

✔ createBrowserClient()
✔ @supabase/ssr
✔ persistência SSR oficial
✔ cookies compatíveis
✔ auth cloud estável
✔ sincronização middleware/browser

-----------------------------------------

IMPORTANTE

Este é o ÚNICO client frontend oficial.

NÃO:
- criar múltiplos clients
- criar createClient local
- misturar clients SSR e legado
- usar localStorage manual

-----------------------------------------

DEPENDÊNCIAS

- @supabase/ssr
- middleware.ts

=========================================
*/

import { createBrowserClient } from '@supabase/ssr'

// -------------------------------------
// ENVIRONMENT
// -------------------------------------

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// -------------------------------------
// CLIENT
// -------------------------------------

export const supabase =
  createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )