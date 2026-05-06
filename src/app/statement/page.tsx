'use client'

/*
=========================================
HURBY — STATEMENT PAGE
LOCAL:
src/app/statement/page.tsx

RESPONSABILIDADES:
- validar sessão do usuário
- carregar extrato financeiro
- garantir acesso apenas ao próprio usuário
- proteger dados financeiros
- exibir ledger oficial do sistema

-----------------------------------------

REGRAS DE ACESSO

- usuário autenticado obrigatório
- sem sessão → /login
- somente dados do próprio usuário

-----------------------------------------

IMPORTANTE

A proteção principal da rota ocorre em:
middleware.ts

Esta página mantém:
- validação client-side complementar
- carregamento seguro do extrato
- estabilidade visual da sessão

-----------------------------------------

SEGURANÇA

- nunca usar user_id via URL
- nunca confiar apenas no frontend
- sempre usar session.user.id
- extrato deve respeitar RLS
- consultas financeiras devem ser privadas

-----------------------------------------

DEPENDÊNCIAS

- wallet_ledger
- wallet_balance
- auth.users
- middleware.ts

-----------------------------------------

IMPORTANTE — HISTÓRICO

Inicialmente esta página utilizava:
credit_transactions

Porém, após auditoria do banco real,
foi identificado que a tabela oficial
do core financeiro HURBY é:

wallet_ledger

Estrutura validada:
- amount
- description
- transaction_type
- created_at

-----------------------------------------

RECOMENDAÇÃO FUTURA

Padronizar:
- paginação
- filtros
- resumo financeiro
- exportação
- cache control

-----------------------------------------

HISTÓRICO

[2026-05-06]
- corrigido acesso após logout
- padronizado redirect para /login
- estabilizado fluxo auth
- adicionada proteção de sessão
- adicionada proteção contra estado inconsistente
- padronizado com middleware SSR
- removido comportamento inseguro de render
- corrigido uso incorreto de tabela legado
- integrado ao wallet_ledger oficial

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function StatementPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [transactions, setTransactions] =
    useState<any[]>([])

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
        // BUSCAR EXTRATO
        // -------------------------------------

        const {
          data,
          error: statementError,
        } = await supabase
          .from('wallet_ledger')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', {
            ascending: false,
          })

        if (statementError) {
          console.error(
            'STATEMENT ERROR:',
            statementError
          )

          setStatus(
            'Erro ao carregar extrato'
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

        window.location.href = '/login'
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

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
    </div>
  )
}