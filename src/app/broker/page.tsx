'use client'

/*
=========================================
HURBY — BROKER AREA
LOCAL:
src/app/broker/page.tsx

STATUS:
BROKER_STABILIZED

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

  const [balance, setBalance] =
    useState<number>(0)

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

        let authUser = currentUser

        // retry hydration

        if (userError || !currentUser) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          )

          const retry =
            await supabase.auth.getUser()

          authUser = retry.data.user

          if (!authUser) {
            window.location.href = '/login'
            return
          }
        }

        if (!mounted) return

        setUser(authUser)

        // -------------------------------------
        // PROFILE
        // -------------------------------------

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('users_profile')
          .select('user_type')
          .eq('id', authUser!.id)
          .maybeSingle()

        if (profileError) {
          console.error(
            'PROFILE ERROR:',
            profileError
          )

          setStatus(
            'Erro ao carregar perfil.'
          )

          setLoading(false)

          return
        }

        if (
          !profile ||
          profile.user_type !== 'broker'
        ) {
          window.location.href = '/login'
          return
        }

        // -------------------------------------
        // WALLET
        // -------------------------------------

        const {
          data: wallet,
          error: walletError,
        } = await supabase
          .from('wallet_balance')
          .select('balance')
          .eq('user_id', authUser!.id)
          .maybeSingle()

        if (walletError) {
          console.error(
            'WALLET ERROR:',
            walletError
          )

          setStatus(
            'Erro ao carregar wallet.'
          )
        }

        if (wallet) {
          setBalance(wallet.balance || 0)
        }

        if (!mounted) return

        setLoading(false)
      } catch (error) {
        console.error(
          'BROKER INIT ERROR:',
          error
        )

        setStatus(
          'Erro interno broker.'
        )

        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  // -------------------------------------
  // CONSUME
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
          'CONSUME ERROR FULL:',
          JSON.stringify(
            error,
            null,
            2
          )
        )

        setStatus(
          error?.message ||
            'Erro ao consumir créditos.'
        )

        return
      }

      // -------------------------------------
      // ATUALIZAR WALLET
      // -------------------------------------

      const {
        data: wallet,
        error: walletError,
      } = await supabase
        .from('wallet_balance')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle()

      if (walletError) {
        console.error(
          'WALLET REFRESH ERROR:',
          walletError
        )

        setStatus(
          'Consumo realizado, mas houve erro ao atualizar saldo.'
        )

        return
      }

      if (wallet) {
        setBalance(wallet.balance || 0)
      }

      setStatus('Consumo realizado')
    } catch (error) {
      console.error(
        'CONSUME FAILURE:',
        error
      )

      setStatus(
        'Erro ao consumir créditos.'
      )
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
        'LOGOUT ERROR:',
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
        <strong>Usuário:</strong>{' '}
        {user?.email}
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