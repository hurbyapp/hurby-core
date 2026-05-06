'use client'

/*
=========================================
HURBY — AGENCY AREA
LOCAL:
src/app/agency/page.tsx

RESPONSABILIDADES:
- validar sessão do usuário
- validar acesso agency
- bloquear acesso indevido
- permitir logout seguro

-----------------------------------------

REGRAS DE ACESSO

- apenas user_type = agency
- sem sessão → /login
- perfil inválido → /login

-----------------------------------------

IMPORTANTE

A proteção principal da rota ocorre em:
middleware.ts

Esta página mantém:
- validação client-side complementar
- controle visual
- estabilidade de sessão

-----------------------------------------

SEGURANÇA

- nunca confiar apenas no frontend
- nunca usar user_id via URL
- sempre usar session.user.id
- logout deve invalidar sessão completamente

-----------------------------------------

HISTÓRICO

[2026-05-06]
- removido redirect legado para /dashboard
- padronizado redirect para /login
- corrigido logout incompleto
- estabilizado fluxo auth
- padronizado com middleware SSR
- removidos estados inconsistentes
- adicionada proteção contra memory state

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AgencyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

        // -------------------------------------
        // VALIDAR SESSÃO
        // -------------------------------------

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          window.location.href = '/login'
          return
        }

        const currentUser = session.user

        if (!mounted) return

        setUser(currentUser)

        // -------------------------------------
        // VALIDAR PROFILE
        // -------------------------------------

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('users_profile')
          .select('user_type')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (
          profileError ||
          !profile ||
          profile.user_type !== 'agency'
        ) {
          window.location.href = '/login'
          return
        }

        if (!mounted) return

        setLoading(false)
      } catch (error) {
        console.error('AGENCY INIT ERROR:', error)

        window.location.href = '/login'
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  // -------------------------------------
  // LOGOUT
  // -------------------------------------

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('LOGOUT ERROR:', error)
    }

    // reload completo
    window.location.href = '/login'
  }

  // -------------------------------------
  // LOADING
  // -------------------------------------

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p>Carregando...</p>
      </div>
    )
  }

  // -------------------------------------
  // PAGE
  // -------------------------------------

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Agência</h1>

      <p>
        <strong>Usuário:</strong> {user?.email}
      </p>

      {status && (
        <p style={{ color: '#666' }}>
          {status}
        </p>
      )}

      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}