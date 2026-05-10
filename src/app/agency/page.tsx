'use client'

/*
=========================================
HURBY — AGENCY AREA
LOCAL:
src/app/agency/page.tsx

STATUS:
ORGANIZATION_MEMBERSHIP_FOUNDATION

RESPONSABILIDADES:
- validar autenticação
- validar membership organizacional ativo
- permitir acesso somente a papéis de gestão
- preparar dashboard institucional futuro
- manter agency fora de user_type

IMPORTANTE:
Agency NÃO é user_type.

Agency é:
- organization
- contexto operacional
- ambiente institucional

O acesso depende de:
- organization_memberships
- membership_status = active
- membership_role = owner ou manager

NÃO:
- restaurar profile.user_type = agency
- usar agency_id em users_profile
- acoplar organização na identidade base

PREVISÃO:
Esta página deverá evoluir para:
- gestão da organização
- gestão de membros
- carteira institucional
- homologação de corretores
- visibilidade operacional
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AgencyPage() {
  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState<any>(null)

  const [membership, setMembership] =
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

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          window.location.href = '/login'
          return
        }

        const {
          data: activeMembership,
          error: membershipError,
        } = await supabase
          .from('organization_memberships')
          .select(`
            *,
            organizations (
              id,
              legal_name,
              trade_name,
              organization_type
            )
          `)
          .eq('profile_id', authUser.id)
          .eq('membership_status', 'active')
          .in('membership_role', [
            'owner',
            'manager',
          ])
          .maybeSingle()

        if (
          membershipError ||
          !activeMembership
        ) {
          console.error(
            'AGENCY MEMBERSHIP ERROR:',
            membershipError
          )

          window.location.href = '/broker'
          return
        }

        if (!mounted) return

        setUser(authUser)
        setMembership(activeMembership)
        setLoading(false)
      } catch (error) {
        console.error(
          'AGENCY INIT ERROR:',
          error
        )

        setStatus(
          'Erro interno agency.'
        )

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
      console.error(
        'AGENCY LOGOUT ERROR:',
        error
      )
    }

    window.location.href = '/login'
  }

  if (loading) {
    return (
      <main style={{ padding: 20 }}>
        <p>Carregando...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 20 }}>
      <header
        style={{
          display: 'flex',
          gap: 16,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <Link href="/agency">
          Dashboard Agency
        </Link>

        <Link href="/broker">
          Área Broker
        </Link>

        <Link href="/operations/properties">
          Imóveis
        </Link>

        <Link href="/statement">
          Extrato
        </Link>
      </header>

      <h1>Dashboard Agency</h1>

      <p>
        <strong>Usuário:</strong>{' '}
        {user?.email}
      </p>

      <p>
        <strong>Organização:</strong>{' '}
        {membership?.organizations
          ?.trade_name ||
          membership?.organizations
            ?.legal_name}
      </p>

      <p>
        <strong>Tipo:</strong>{' '}
        {membership?.organizations
          ?.organization_type}
      </p>

      <p>
        <strong>Papel:</strong>{' '}
        {membership?.membership_role}
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
    </main>
  )
}
