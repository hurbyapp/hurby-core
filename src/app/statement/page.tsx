'use client'

/*
=========================================
HURBY — STATEMENT PAGE
LOCAL:
src/app/statement/page.tsx

STATUS:
IDENTITY_NEUTRAL_LEDGER_READY

OBJETIVO:
Exibir extrato AXE do usuario autenticado.

REGRA:
O extrato financeiro usa auth.users.id diretamente.

Contratos preservados:
- wallet_ledger.user_id = auth.users.id
- wallet_balance.user_id = auth.users.id

NAO depende de perfil operacional.
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function StatementPage() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<number>(0)
  const [canAccessBroker, setCanAccessBroker] = useState(false)
  const [canAccessAgency, setCanAccessAgency] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

        await new Promise((resolve) => setTimeout(resolve, 800))

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser()

        let authUser = currentUser

        if (userError || !currentUser) {
          await new Promise((resolve) => setTimeout(resolve, 800))

          const retry = await supabase.auth.getUser()
          authUser = retry.data.user

          if (!authUser) {
            window.location.href = '/login'
            return
          }
        }

        if (!mounted) return

        setUser(authUser)

        const { data: brokerAccess, error: brokerError } = await supabase
          .from('broker_profiles')
          .select('id, professional_status')
          .eq('profile_id', authUser!.id)
          .neq('professional_status', 'suspended')
          .limit(1)
          .maybeSingle()

        if (brokerError) {
          console.error('STATEMENT BROKER ACCESS ERROR:', brokerError)
        }

        const { data: agencyAccess, error: agencyError } = await supabase
          .from('organization_memberships')
          .select('id, membership_role, membership_status')
          .eq('profile_id', authUser!.id)
          .eq('membership_status', 'active')
          .in('membership_role', ['owner', 'manager'])
          .limit(1)
          .maybeSingle()

        if (agencyError) {
          console.error('STATEMENT AGENCY ACCESS ERROR:', agencyError)
        }

        setCanAccessBroker(!!brokerAccess)
        setCanAccessAgency(!!agencyAccess)

        const { data: wallet, error: walletError } = await supabase
          .from('wallet_balance')
          .select('balance')
          .eq('user_id', authUser!.id)
          .maybeSingle()

        if (walletError) {
          console.error('STATEMENT WALLET ERROR:', walletError)
          setStatus('Nao foi possivel carregar o saldo.')
        }

        if (wallet) {
          setBalance(wallet.balance || 0)
        } else {
          setBalance(0)
        }

        const { data, error: statementError } = await supabase
          .from('wallet_ledger')
          .select('*')
          .eq('user_id', authUser!.id)
          .order('created_at', {
            ascending: false,
          })

        if (statementError) {
          console.error('STATEMENT LEDGER ERROR:', statementError)
          setStatus('Erro ao carregar extrato.')
        }

        if (mounted) {
          setTransactions(data || [])
        }

        setLoading(false)
      } catch (error) {
        console.error('STATEMENT INIT ERROR:', error)
        setStatus('Erro interno statement.')
        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('STATEMENT LOGOUT ERROR:', error)
    }

    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <nav
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/account/profile">Meu cadastro</Link>

        {canAccessBroker && <Link href="/broker">Broker</Link>}

        {canAccessAgency && <Link href="/agency">Agency</Link>}

        {(canAccessBroker || canAccessAgency) && (
          <Link href="/operations/properties">Imoveis</Link>
        )}

        <Link href="/login">Login</Link>
      </nav>

      <h1>Extrato AXE</h1>

      <p>
        <strong>Usuario:</strong> {user?.email}
      </p>

      <p>
        <strong>Saldo atual:</strong> {balance}
      </p>

      {status && <p style={{ color: '#666' }}>{status}</p>}

      {transactions.length === 0 && (
        <p>Nenhuma movimentacao encontrada.</p>
      )}

      {transactions.length > 0 && (
        <table
          border={1}
          cellPadding={8}
          style={{
            marginTop: 20,
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Descricao</th>
              <th>Origem</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.created_at}</td>
                <td>{transaction.transaction_type}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.description || '-'}</td>
                <td>{transaction.origin_type || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
