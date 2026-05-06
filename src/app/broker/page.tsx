'use client'

/*
=========================================
HURBY — BROKER AREA
LOCAL:
src/app/broker/page.tsx

RESPONSABILIDADES:
- validar sessão do usuário
- validar acesso broker
- carregar saldo wallet
- consumir créditos
- permitir logout seguro

-----------------------------------------

REGRAS DE ACESSO

- apenas user_type = broker
- sem sessão → /login
- perfil inválido → /login

-----------------------------------------

IMPORTANTE

A proteção principal da rota ocorre em:
middleware.ts

Esta página mantém:
- validação client-side complementar
- carregamento de dados do usuário
- renderização segura
- estabilidade visual da sessão

-----------------------------------------

SEGURANÇA

- nunca confiar apenas no frontend
- nunca usar user_id via URL
- sempre usar session.user.id
- logout deve invalidar sessão completamente
- consumo financeiro deve depender de RPC segura

-----------------------------------------

DEPENDÊNCIAS

- users_profile
- wallet_balance
- consume_coin()

-----------------------------------------

HISTÓRICO

[2026-05-06]
- removido redirect legado
- estabilizado fluxo auth
- corrigido logout incompleto
- padronizado com middleware SSR
- adicionada proteção contra estado inconsistente
- melhorado tratamento de sessão
- adicionada proteção contra render indevido
- organizado fluxo financeiro

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function BrokerPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<number>(0)
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
          profile.user_type !== 'broker'
        ) {
          window.location.href = '/login'
          return
        }

        // -------------------------------------
        // CARREGAR WALLET
        // -------------------------------------

        const {
          data: wallet,
          error: walletError,
        } = await supabase
          .from('wallet_balance')
          .select('balance')
          .eq('user_id', currentUser.id)
          .maybeSingle()

        if (!walletError && wallet) {
          setBalance(wallet.balance || 0)
        }

        if (!mounted) return

        setLoading(false)
      } catch (error) {
        console.error(
          'BROKER PAGE INIT ERROR:',
          error
        )

        window.location.href = '/login'
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  // -------------------------------------
  // CONSUMIR CRÉDITOS
  // -------------------------------------

  const handleConsume = async () => {
    if (!user) return

    try {
      setStatus('Processando...')

      const { error } = await supabase.rpc(
        'consume_coin',
        {
          p_user_id: user.id,
          p_amount: 10,
          p_description:
            'Teste consumo frontend',
        }
      )

      if (error) {
        console.error(
          'BROKER CONSUME ERROR:',
          error
        )

        setStatus(error.message)
        return
      }

      // atualizar saldo
      const { data: wallet } = await supabase
        .from('wallet_balance')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle()

      if (wallet) {
        setBalance(wallet.balance || 0)
      }

      setStatus('Consumo realizado')
    } catch (error) {
      console.error(
        'BROKER RPC FAILURE:',
        error
      )

      setStatus('Erro ao consumir créditos')
    }
  }

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
      <h1>Broker Area</h1>

      <p>
        <strong>Usuário:</strong> {user?.email}
      </p>

      <p>
        <strong>Saldo (AXE):</strong>{' '}
        {balance}
      </p>

      <br />

      <button onClick={handleConsume}>
        Consumir 10 AXE
      </button>

      <p style={{ marginTop: 20 }}>
        {status}
      </p>

      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}