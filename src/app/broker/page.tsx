'use client'

/*
=========================================
HURBY — BROKER AREA
LOCAL:
src/app/broker/page.tsx

STATUS:
BROKER_STABILIZED

OBJETIVO:
Área operacional inicial do corretor.

IMPORTANTE:
Esta página funciona como ponto de entrada
para testes do ambiente broker.

NÃO misturar aqui regras avançadas de:
- marketplace
- leads
- contratos
- gestão de imóveis
- automações
- inteligência comercial

Os links abaixo são navegação operacional
para validação dos cores já existentes.

OBSERVAÇÃO:
O botão de consumo de AXE permanece apenas
como recurso de teste temporário da wallet.
Não tratar como fluxo definitivo de produto.
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

      <section
        style={{
          border: '1px solid #ccc',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2>Operações</h2>

        <p>
          Acesso rápido aos módulos operacionais
          disponíveis para teste.
        </p>

        <ul>
          <li>
            <a href="/operations/properties">
              Core Imobiliário
            </a>
          </li>

          <li>
            <a href="/operations/properties/new">
              Cadastrar novo imóvel
            </a>
          </li>

          <li>
            <a href="/operations/properties/list">
              Listar imóveis
            </a>
          </li>

          <li>
            <a href="/statement">
              Extrato AXE
            </a>
          </li>

          <li>
            <a href="/agency">
              Área Agency
            </a>
          </li>

          <li>
            <a href="/owner">
              Área Owner
            </a>
          </li>
        </ul>
      </section>

      <section
        style={{
          border: '1px solid #ccc',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2>Wallet temporária</h2>

        <p>
          Recurso mantido apenas para teste da
          camada financeira.
        </p>

        <button onClick={handleConsume}>
          Consumir 10 AXE
        </button>
      </section>

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