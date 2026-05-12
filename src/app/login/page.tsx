'use client'

/*
=========================================
HURBY â€” LOGIN / ENTRY PAGE
LOCAL:
src/app/login/page.tsx

STATUS:
ENTRY_FLOW_READY

RESPONSABILIDADES:
- login
- roteamento por contexto profissional
- entrada para formularios por porta
- acesso a area comum de conta
=========================================
*/

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectAfterLogin = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('primary_entry_flow, account_status')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('LOGIN PROFILE ERROR:', profileError)
    }

    if (
      profile?.account_status === 'active' &&
      profile?.primary_entry_flow === 'platform_owner'
    ) {
      window.location.href = '/owner'
      return
    }

    const { data: membership, error: membershipError } = await supabase
      .from('organization_memberships')
      .select('id, membership_role, membership_status')
      .eq('profile_id', userId)
      .eq('membership_status', 'active')
      .in('membership_role', ['owner', 'manager'])
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      console.error('LOGIN MEMBERSHIP ERROR:', membershipError)
    }

    if (membership) {
      window.location.href = '/agency'
      return
    }

    const { data: brokerProfile, error: brokerError } = await supabase
      .from('broker_profiles')
      .select('id, professional_status, verification_status')
      .eq('profile_id', userId)
      .neq('professional_status', 'suspended')
      .limit(1)
      .maybeSingle()

    if (brokerError) {
      console.error('LOGIN BROKER PROFILE ERROR:', brokerError)
    }

    if (
      brokerProfile ||
      profile?.primary_entry_flow === 'broker_professional'
    ) {
      window.location.href = '/broker'
      return
    }

    window.location.href = '/account'
  }

  const handleLogin = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      if (!email || !password) {
        setStatus('Preencha email e senha.')
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('LOGIN ERROR:', error)
        setStatus(error.message)
        return
      }

      const user = data.user

      if (!user) {
        setStatus('Usuario nao encontrado.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setStatus('Sessao ainda nao estabilizada. Tente novamente.')
        return
      }

      await redirectAfterLogin(user.id)
    } catch (error) {
      console.error('LOGIN FAILURE:', error)
      setStatus('Erro inesperado no login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 760, margin: '60px auto' }}>
      <h1>Entrar no Hurby</h1>

      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />

        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: 12 }}
        >
          {loading ? 'Processando...' : 'Entrar'}
        </button>

        {!!status && (
          <p style={{ marginTop: 16, color: 'red' }}>{status}</p>
        )}
      </section>

      <section
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2>Portas de cadastro</h2>

        <p>Escolha o caminho correto para validar o fluxo operacional.</p>

        <div style={{ display: 'grid', gap: 12 }}>
          <Link href="/register/common">Criar conta comum do marketplace</Link>
          <Link href="/register/broker">Sou corretor</Link>
          <Link href="/register/agency">Sou imobiliaria</Link>
          <Link href="/register/owner">Porta Owner</Link>
          <Link href="/account">Minha conta</Link>
          <Link href="/account/profile">Editar meu cadastro</Link>
        </div>
      </section>

      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
        A conta base e neutra. O acesso profissional depende de broker_profile
        ou organization_membership ativo.
      </p>
    </div>
  )
}

