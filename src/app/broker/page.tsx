'use client'

/*
=========================================
HURBY — BROKER AREA
LOCAL:
src/app/broker/page.tsx

STATUS:
AUTH_DEBUG_MODE

OBJETIVO TEMPORÁRIO:
- isolar auth cloud
- validar sessão Vercel
- validar persistência SSR
- remover interferências de profile/wallet/RLS

-----------------------------------------

IMPORTANTE

MODO TEMPORÁRIO DE DEBUG.

REMOVIDO TEMPORARIAMENTE:
- validação profile
- wallet_balance
- RPC consume_coin
- redirects automáticos

OBJETIVO:
descobrir se o auth chega vivo
na página protegida.

-----------------------------------------

TESTE ESPERADO

Se funcionar:
- auth está correto
- middleware está correto
- problema está em:
  - profile
  - wallet
  - RLS
  - RPC
  - queries internas

Se NÃO funcionar:
- problema ainda é:
  - auth SSR
  - cookies
  - sessão cloud
  - runtime Vercel

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function BrokerPage() {
  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState<any>(null)

  const [status, setStatus] =
    useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

        // -------------------------------------
        // ESTABILIZAÇÃO CLOUD
        // -------------------------------------

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        )

        // -------------------------------------
        // AUTH
        // -------------------------------------

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser()

        console.log(
          'AUTH USER:',
          currentUser
        )

        console.log(
          'AUTH ERROR:',
          userError
        )

        if (!currentUser) {
          setStatus('SEM USUARIO')
          setLoading(false)
          return
        }

        if (!mounted) return

        setUser(currentUser)

        setStatus('AUTH OK')

        setLoading(false)
      } catch (error) {
        console.error(
          'BROKER PAGE INIT ERROR:',
          error
        )

        setStatus('ERRO INIT')

        setLoading(false)
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
      console.error(
        'BROKER LOGOUT ERROR:',
        error
      )
    }

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
      <h1>Broker Area</h1>

      <p>
        <strong>Status:</strong>{' '}
        {status}
      </p>

      <br />

      <p>
        <strong>Usuário:</strong>{' '}
        {user?.email || 'NÃO LOGADO'}
      </p>

      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}