/*
=========================================
HURBY — SUPABASE CLIENT
LOCAL:
src/lib/supabaseClient.ts

RESPONSABILIDADES:
- criar client único Supabase
- persistir sessão auth
- manter refresh automático de token
- sincronizar auth client-side
- integrar com middleware SSR

-----------------------------------------

IMPORTANTE

Este é o ÚNICO client Supabase
frontend oficial do projeto.

NÃO:
- criar múltiplos clients
- criar clients locais em páginas
- duplicar instâncias auth

-----------------------------------------

PROBLEMAS HISTÓRICOS IDENTIFICADOS

[2026-05-06]

Problemas anteriores incluíam:
- sessão fantasma
- logout inconsistente
- middleware SSR fora de sincronia
- redirects incorretos
- auth intermitente

-----------------------------------------

DECISÕES TÉCNICAS

persistSession:
- mantém login após refresh

autoRefreshToken:
- renova token automaticamente

detectSessionInUrl:
- necessário para fluxos auth futuros
- recuperação de senha
- magic links

-----------------------------------------

IMPORTANTE SOBRE SSR

O middleware.ts utiliza:
@supabase/ssr

Este client frontend deve permanecer
compatível com:
- cookies SSR
- App Router
- middleware auth

-----------------------------------------

DEPENDÊNCIAS

- @supabase/supabase-js
- middleware.ts

=========================================
*/

import { createClient } from '@supabase/supabase-js'

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

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,

      autoRefreshToken: true,

      detectSessionInUrl: true,
    },
  }
)