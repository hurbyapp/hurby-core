'use client'

/*
=========================================
HURBY â€” BROKER AREA
LOCAL:
src/app/broker/page.tsx

STATUS:
BROKER_PROFILE_ROUTING_READY
AXE_TEST_RESTORED

OBJETIVO:
Area operacional inicial do corretor.

REGRAS:
- acesso broker depende de broker_profiles
- se usuario for agency sem broker_profile, redireciona para /agency
- wallet temporaria mantida para teste de AXE
- owner bloqueado ate Core Owner/Admin oficial
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function BrokerPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [brokerProfile, setBrokerProfile] = useState<any>(null)
  const [canAccessAgency, setCanAccessAgency] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

        await new Promise((resolve) => setTimeout(resolve, 800))

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          window.location.href = '/login'
          return
        }

        if (!mounted) return

        setUser(currentUser)

        const { data: agencyMembership, error: agencyMembershipError } =
          await supabase
            .from('organization_memberships')
            .select('id, membership_role, membership_status')
            .eq('profile_id', currentUser.id)
            .eq('membership_status', 'active')
            .in('membership_role', ['owner', 'manager'])
            .limit(1)
            .maybeSingle()

        if (agencyMembershipError) {
          console.error('BROKER AGENCY ACCESS ERROR:', agencyMembershipError)
        }

        setCanAccessAgency(!!agencyMembership)

        const { data: broker, error: brokerError } = await supabase
          .from('broker_profiles')
          .select(
            'id, professional_name, professional_status, verification_status, public_visibility_status'
          )
          .eq('profile_id', currentUser.id)
          .maybeSingle()

        if (brokerError) {
          console.error('BROKER PROFILE ERROR:', brokerError)
          setStatus('Erro ao carregar perfil profissional.')
          setLoading(false)
          return
        }

        if (!broker && !agencyMembership) {
          const { data: ownerProfile, error: ownerProfileError } = await supabase
            .from('users_profile')
            .select('primary_entry_flow, account_status')
            .eq('id', currentUser.id)
            .maybeSingle()

          if (ownerProfileError) {
            console.error('BROKER OWNER ACCESS ERROR:', ownerProfileError)
          }

          const isPlatformOwner =
            ownerProfile?.account_status === 'active' &&
            ownerProfile?.primary_entry_flow === 'platform_owner'

          if (!isPlatformOwner) {
            window.location.href = '/account'
            return
          }
        }

        if (broker?.professional_status === 'suspended') {
          setStatus('Perfil profissional suspenso.')
          setLoading(false)
          return
        }

        setBrokerProfile(broker)

        const { data: wallet, error: walletError } = await supabase
          .from('wallet_balance')
          .select('balance')
          .eq('user_id', currentUser.id)
          .maybeSingle()

        if (walletError) {
          console.error('WALLET ERROR:', walletError)
          setStatus('Erro ao carregar wallet.')
        }

        if (wallet) {
          setBalance(wallet.balance || 0)
        } else {
          setBalance(0)
        }

        setLoading(false)
      } catch (error) {
        console.error('BROKER INIT ERROR:', error)
        setStatus('Erro interno broker.')
        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  const refreshWallet = async () => {
    if (!user) return

    const { data: wallet, error: walletError } = await supabase
      .from('wallet_balance')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()

    if (walletError) {
      console.error('WALLET REFRESH ERROR:', walletError)
      setStatus('Erro ao atualizar saldo AXE.')
      return
    }

    if (wallet) {
      setBalance(wallet.balance || 0)
    } else {
      setBalance(0)
    }
  }

  const handleConsume = async () => {
    if (!user) return

    try {
      setStatus('Processando consumo AXE...')

      const { error } = await supabase.rpc('consume_coin', {
        p_user_id: user.id,
        p_amount: 10,
        p_description: 'Teste consumo frontend',
      })

      if (error) {
        console.error('CONSUME ERROR FULL:', JSON.stringify(error, null, 2))
        setStatus(error?.message || 'Erro ao consumir AXE.')
        await refreshWallet()
        return
      }

      await refreshWallet()
      setStatus('Consumo realizado.')
    } catch (error) {
      console.error('CONSUME FAILURE:', error)
      setStatus('Erro ao consumir AXE.')
    }
  }

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('LOGOUT ERROR:', error)
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
        <Link href="/broker">Broker</Link>
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/operations/pipeline">Pipeline Pro</Link>
        <Link href="/operations/properties">Core Imobiliario</Link>
        <Link href="/operations/properties/new">Cadastrar imovel</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
        <Link href="/statement">Extrato AXE</Link>
        {canAccessAgency && <Link href="/agency">Agency</Link>}
      </nav>

      {/* BROKER_PIPELINE_PRO_HERO_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta area posiciona o Pipeline Pro como produto principal do ambiente broker.
        - Pipeline Pro nao e apenas menu; e entrada operacional da captacao profissional.
        - Nao conectar banco, migrations, RLS, RPC ou services aqui sem auditoria.
        - Codex pode refinar layout, hierarquia visual, copy e acentuacao mantendo UTF-8.
        - Manter separacao: Pipeline executa, Dossie consolida, Analise interpreta, Publicacao distribui.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 20,
          padding: 24,
          background: '#f8fafc',
          marginBottom: 22,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#667085',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Produto operacional
        </p>

        <h1 style={{ marginBottom: 10 }}>
          Pipeline Pro
        </h1>

        <p
          style={{
            maxWidth: 860,
            color: '#5f6b7a',
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          Inicie uma captacao profissional, acompanhe o levantamento do patrimonio,
          organize diagnostico, estrategia, proposta e publicacao. O objetivo e
          transformar atendimento solto em processo comercial executavel.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Link
            href="/operations/pipeline/atendimento"
            style={{
              display: 'inline-flex',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            Iniciar Anuncio Placeholder
          </Link>

          <Link
            href="/operations/pipeline"
            style={{
              display: 'inline-flex',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #d7dee8',
              background: '#fff',
              color: '#344054',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Abrir Pipeline Pro
          </Link>

          <Link
            href="/operations/properties/list"
            style={{
              display: 'inline-flex',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #d7dee8',
              background: '#fff',
              color: '#344054',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Ver imóveis
          </Link>
        </div>
      </section>


      <h1>Broker Area</h1>

      {!brokerProfile && canAccessAgency && (
        <p style={{ color: '#666' }}>
          Acesso operacional via perfil de imobiliaria.
        </p>
      )}

      <p>
        <strong>Usuario:</strong> {user?.email}
      </p>

      {brokerProfile && (
        <>
          <p>
            <strong>Perfil profissional:</strong>{' '}
            {brokerProfile.professional_name || 'Corretor'}
          </p>

          <p>
            <strong>Status profissional:</strong>{' '}
            {brokerProfile.professional_status}
          </p>

          <p>
            <strong>Verificacao:</strong>{' '}
            {brokerProfile.verification_status}
          </p>
        </>
      )}

      <p>
        <strong>Saldo (AXE):</strong> {balance}
      </p>

      <section
        style={{
          border: '1px solid #ccc',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2>Operacoes</h2>

        <p>Acesso rapido aos modulos operacionais disponiveis para teste.</p>

        <ul>
          <li>
            <Link href="/operations/pipeline">Pipeline Pro</Link>
          </li>
          <li>
            <Link href="/operations/properties">Core Imobiliario</Link>
          </li>
          <li>
            <Link href="/operations/properties/new">Cadastrar novo imovel</Link>
          </li>
          <li>
            <Link href="/operations/properties/list">Listar imoveis</Link>
          </li>
          <li>
            <Link href="/statement">Extrato AXE</Link>
          </li>
          {canAccessAgency && (
            <li>
              <Link href="/agency">Area Agency</Link>
            </li>
          )}
        </ul>

        {!canAccessAgency && (
          <p style={{ fontSize: 13, color: '#666' }}>
            Area Agency indisponivel para este usuario. E necessario vinculo
            ativo como owner ou manager de uma organizacao.
          </p>
        )}

        <p style={{ fontSize: 13, color: '#666' }}>
          Area Owner bloqueada ate existir Core Owner/Admin oficial.
        </p>
      </section>

      <section
        style={{
          border: '1px solid #ccc',
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h2>Wallet temporaria</h2>

        <p>Recurso mantido apenas para teste da camada financeira AXE.</p>

        <button onClick={handleConsume}>Consumir 10 AXE</button>
      </section>

      {status && <p style={{ marginTop: 20 }}>{status}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

