'use client'

/*
=========================================
HURBY — STATEMENT PAGE
LOCAL:
src/app/statement/page.tsx

STATUS:
STATEMENT_STABILIZED

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function StatementPage() {
  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  const [transactions, setTransactions] =
    useState<any[]>([])

  const [user, setUser] =
    useState<any>(null)

  const [status, setStatus] =
    useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

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
            'STATEMENT PROFILE ERROR:',
            profileError
          )

          setStatus(
            'Erro ao carregar perfil.'
          )

          setLoading(false)

          return
        }

        // -------------------------------------
        // ROLE PROTECTION
        // -------------------------------------

        if (
          !profile ||
          ![
            'broker',
            'owner',
            'agency',
          ].includes(profile.user_type)
        ) {
          window.location.href = '/login'
          return
        }

        // -------------------------------------
        // USER
        // -------------------------------------

        if (!mounted) return

        setUser(authUser)

        // -------------------------------------
        // STATEMENT
        // -------------------------------------

        const {
          data,
          error: statementError,
        } = await supabase
          .from('wallet_ledger')
          .select('*')
          .eq('user_id', authUser!.id)
          .order('created_at', {
            ascending: false,
          })

        if (statementError) {
          console.error(
            'STATEMENT ERROR:',
            statementError
          )

          setStatus(
            'Erro ao carregar extrato.'
          )
        }

        if (mounted && data) {
          setTransactions(data)
        }

        if (!mounted) return

        setLoading(false)
      } catch (error) {
        console.error(
          'STATEMENT INIT ERROR:',
          error
        )

        setStatus(
          'Erro interno statement.'
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
  // LOGOUT
  // -------------------------------------

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error(
        'STATEMENT LOGOUT ERROR:',
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
      <h1>Extrato</h1>

      <p>
        <strong>Usuário:</strong>{' '}
        {user?.email}
      </p>

      <br />

      {status && (
        <p style={{ color: '#666' }}>
          {status}
        </p>
      )}

      {transactions.length === 0 && (
        <p>
          Nenhuma movimentação encontrada.
        </p>
      )}

      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {t.created_at} |{' '}
            {t.transaction_type} |{' '}
            {t.amount} |{' '}
            {t.description}
          </li>
        ))}
      </ul>

      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}