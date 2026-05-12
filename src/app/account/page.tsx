'use client'

/*
=========================================
HURBY — MARKETPLACE ACCOUNT
LOCAL:
src/app/account/page.tsx

STATUS:
MARKETPLACE_COMMON_ACCOUNT_FOUNDATION

OBJETIVO:
Area inicial da conta comum do marketplace Cade Negocios.

REGRA:
Usuario comum nao deve cair em /broker, /agency, /owner
ou rotas profissionais.

Esta pagina e o lugar correto para:
- dados da conta
- favoritos futuros
- mensagens futuras
- imoveis visualizados futuros
- anuncios proprios
- navegacao comum do marketplace

NAO IMPLEMENTA AGORA:
- favoritos reais
- mensagens reais
- marketplace completo
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [hasBroker, setHasBroker] = useState(false)
  const [hasAgency, setHasAgency] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        setStatus('')

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          window.location.href = '/login'
          return
        }

        setUser(currentUser)

        const { data: profileData, error: profileError } = await supabase
          .from('users_profile')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (profileError) {
          console.error('ACCOUNT PROFILE ERROR:', profileError)
          setStatus('Erro ao carregar dados da conta.')
        }

        setProfile(profileData)

        const { data: brokerData } = await supabase
          .from('broker_profiles')
          .select('id')
          .eq('profile_id', currentUser.id)
          .neq('professional_status', 'suspended')
          .limit(1)
          .maybeSingle()

        setHasBroker(!!brokerData)

        const { data: agencyData } = await supabase
          .from('organization_memberships')
          .select('id')
          .eq('profile_id', currentUser.id)
          .eq('membership_status', 'active')
          .in('membership_role', ['owner', 'manager'])
          .limit(1)
          .maybeSingle()

        setHasAgency(!!agencyData)
      } catch (error) {
        console.error('ACCOUNT INIT ERROR:', error)
        setStatus('Erro inesperado ao carregar conta.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('ACCOUNT LOGOUT ERROR:', error)
    }

    window.location.href = '/login'
  }

  if (loading) {
    return (
      <main style={{ padding: 40 }}>
        <p>Carregando conta...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 40, maxWidth: 920, margin: '40px auto' }}>
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
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/account/listings">Meus anuncios</Link>
        <Link href="/account/listings/new">Anunciar imovel</Link>
        <Link href="/login">Login</Link>

        {hasBroker && <Link href="/broker">Painel Hurby</Link>}
        {hasAgency && <Link href="/agency">Agency</Link>}
      </nav>

      <h1>Minha conta Cade Negocios</h1>

      <p>
        <strong>Usuario:</strong> {user?.email}
      </p>

      <p>
        <strong>Nome:</strong> {profile?.display_name || '-'}
      </p>

      <p>
        <strong>Entrada:</strong> {profile?.primary_entry_flow || '-'}
      </p>

      <p>
        <strong>Status:</strong> {profile?.account_status || '-'}
      </p>

      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          marginTop: 20,
        }}
      >
        <h2>Resumo da conta</h2>

        <ul>
          <li>
            <Link href="/account/profile">Meus dados cadastrais</Link>
          </li>
          <li>Meus favoritos - futuro</li>
          <li>Mensagens / atendimentos - futuro</li>
          <li>Imoveis visualizados recentemente - futuro</li>
          <li>
            <Link href="/account/listings">Meus anuncios comuns</Link>
          </li>
          <li>
            <Link href="/account/listings/new">Anunciar meu imovel</Link>
          </li>
        </ul>
      </section>

      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2>Acesso profissional</h2>

        {hasBroker || hasAgency ? (
          <ul>
            {hasBroker && (
              <li>
                <Link href="/broker">Acessar Painel Hurby / Broker</Link>
              </li>
            )}

            {hasAgency && (
              <li>
                <Link href="/agency">Acessar Agency</Link>
              </li>
            )}
          </ul>
        ) : (
          <p>
            Esta conta nao possui acesso profissional. Para atuar como corretor
            ou imobiliaria, use uma porta profissional de cadastro.
          </p>
        )}
      </section>

      {status && <p>{status}</p>}

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}
