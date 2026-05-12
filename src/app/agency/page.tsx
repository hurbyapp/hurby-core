'use client'

/*
=========================================
HURBY â€” AGENCY AREA
LOCAL:
src/app/agency/page.tsx

STATUS:
ORGANIZATION_MEMBERSHIP_GUARDED

REGRA:
- agency_owner com membership ativo acessa /agency
- broker tentando /agency volta para /broker
- marketplace tentando /agency volta para /account
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AgencyPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

        await new Promise((resolve) => setTimeout(resolve, 800))

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          window.location.href = '/login'
          return
        }

        const { data: profile } = await supabase
          .from('users_profile')
          .select('primary_entry_flow, account_status')
          .eq('id', authUser.id)
          .maybeSingle()

        const { data: activeMembership, error: membershipError } =
          await supabase
            .from('organization_memberships')
            .select(
              `
              *,
              organizations (
                id,
                legal_name,
                trade_name,
                organization_type
              )
            `
            )
            .eq('profile_id', authUser.id)
            .eq('membership_status', 'active')
            .in('membership_role', ['owner', 'manager'])
            .limit(1)
            .maybeSingle()

        if (membershipError) {
          console.error('AGENCY MEMBERSHIP ERROR:', membershipError)
        }

        const isAgency =
          profile?.primary_entry_flow === 'agency_owner' &&
          profile?.account_status === 'active' &&
          !!activeMembership

        if (!isAgency) {
          const { data: brokerProfile } = await supabase
            .from('broker_profiles')
            .select('id, professional_status')
            .eq('profile_id', authUser.id)
            .neq('professional_status', 'suspended')
            .limit(1)
            .maybeSingle()

          if (
            brokerProfile ||
            profile?.primary_entry_flow === 'broker_professional'
          ) {
            window.location.href = '/broker'
            return
          }

          if (
            profile?.account_status === 'active' &&
            profile?.primary_entry_flow === 'platform_owner'
          ) {
            window.location.href = '/owner'
            return
          }

          window.location.href = '/account'
          return
        }

        if (!mounted) return

        setUser(authUser)
        setMembership(activeMembership)
        setLoading(false)
      } catch (error) {
        console.error('AGENCY INIT ERROR:', error)
        setStatus('Erro interno agency.')
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
      console.error('AGENCY LOGOUT ERROR:', error)
    }

    window.location.href = '/login'
  }

  const Nav = () => (
    <nav
      style={{
        display: 'flex',
        gap: 12,
        borderBottom: '1px solid #ddd',
        paddingBottom: 12,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      <Link href="/broker">Broker</Link>
      <Link href="/agency">Agency</Link>
      <Link href="/account">Minha conta</Link>
      <Link href="/account/profile">Editar cadastro</Link>
      <Link href="/operations/properties">Imoveis</Link>
      <Link href="/operations/properties/new">Cadastrar imovel</Link>
      <Link href="/operations/properties/list">Listar imoveis</Link>
      <Link href="/statement">Extrato AXE</Link>
    </nav>
  )

  if (loading) {
    return (
      <main style={{ padding: 20 }}>
        <p>Carregando...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 20 }}>
      <Nav />

      <h1>Dashboard Agency</h1>

      <p>
        <strong>Usuario:</strong> {user?.email}
      </p>

      <p>
        <strong>Organizacao:</strong>{' '}
        {membership?.organizations?.trade_name ||
          membership?.organizations?.legal_name}
      </p>

      <p>
        <strong>Tipo:</strong> {membership?.organizations?.organization_type}
      </p>

      <p>
        <strong>Papel:</strong> {membership?.membership_role}
      </p>

      {status && <p style={{ color: '#666' }}>{status}</p>}

      <br />

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}

