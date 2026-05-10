'use client'

/*
=========================================
HURBY — LOGIN / AUTH PAGE
LOCAL:
src/app/login/page.tsx

STATUS:
IDENTITY_NEUTRAL_FOUNDATION_READY
BROKER_PROFILE_ROUTING_READY
ORGANIZATION_MEMBERSHIP_ROUTING_READY

RESPONSABILIDADES:
- login
- signup profissional básico
- criação de conta neutra via auth.users/users_profile
- criação de broker_profile no cadastro profissional
- redirect por contexto operacional
- integração com middleware SSR
- compatibilidade Vercel Edge Runtime

IMPORTANTE:
users_profile é conta neutra.

NÃO usar:
- user_type
- account_tier
- broker automático em users_profile
- redirect cego para /broker

Roteamento profissional:
- organization_membership owner/manager ativo → /agency
- broker_profile existente → /broker
- sem contexto profissional → permanece sem acesso operacional

Marketplace/conta comum será tratado em fluxo próprio futuro.

DEPENDÊNCIAS:
- middleware.ts
- auth.users
- users_profile
- broker_profiles
- organizations
- organization_memberships
- handle_new_user()
=========================================
*/

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [mode, setMode] =
    useState<'login' | 'signup'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')

  const [name, setName] = useState('')
  const [creciNumber, setCreciNumber] =
    useState('')
  const [creciUf, setCreciUf] =
    useState('')
  const [mainCity, setMainCity] =
    useState('')
  const [mainState, setMainState] =
    useState('')

  const [acceptTerms, setAcceptTerms] =
    useState(false)

  const [status, setStatus] = useState('')

  const [loading, setLoading] =
    useState(false)

  const normalizeUf = (value: string) =>
    value.trim().toUpperCase().slice(0, 2)

  const redirectAfterLogin = async (
    userId: string
  ) => {
    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from('organization_memberships')
      .select('id, membership_role, membership_status')
      .eq('profile_id', userId)
      .eq('membership_status', 'active')
      .in('membership_role', [
        'owner',
        'manager',
      ])
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      console.error(
        'LOGIN MEMBERSHIP ERROR:',
        membershipError
      )
    }

    if (membership) {
      window.location.href = '/agency'
      return
    }

    const {
      data: brokerProfile,
      error: brokerError,
    } = await supabase
      .from('broker_profiles')
      .select('id, professional_status, verification_status')
      .eq('profile_id', userId)
      .neq('professional_status', 'suspended')
      .limit(1)
      .maybeSingle()

    if (brokerError) {
      console.error(
        'LOGIN BROKER PROFILE ERROR:',
        brokerError
      )
    }

    if (brokerProfile) {
      window.location.href = '/broker'
      return
    }

    setStatus(
      'Conta autenticada, mas ainda sem ambiente profissional vinculado. Use uma entrada profissional válida ou aguarde a liberação do seu cadastro.'
    )
  }

  const handleLogin = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      if (!email || !password) {
        setStatus(
          'Preencha email e senha.'
        )
        return
      }

      const { data, error } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        )

      if (error) {
        console.error(
          'LOGIN ERROR:',
          error
        )

        setStatus(error.message)
        return
      }

      const user = data.user

      if (!user) {
        setStatus(
          'Usuário não encontrado.'
        )
        return
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setStatus(
          'Sessão ainda não estabilizada. Tente novamente.'
        )
        return
      }

      await redirectAfterLogin(user.id)
    } catch (error) {
      console.error(
        'LOGIN FAILURE:',
        error
      )

      setStatus(
        'Erro inesperado no login.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      if (!acceptTerms) {
        setStatus(
          'Você precisa aceitar os Termos de Uso e Política de Privacidade.'
        )
        return
      }

      if (!name || !email || !password) {
        setStatus(
          'Preencha nome, email e senha.'
        )
        return
      }

      if (password.length < 6) {
        setStatus(
          'A senha deve possuir pelo menos 6 caracteres.'
        )
        return
      }

      if (!creciNumber || !creciUf) {
        setStatus(
          'Informe CRECI e UF do CRECI para iniciar o cadastro profissional.'
        )
        return
      }

      const normalizedCreciUf =
        normalizeUf(creciUf)

      const normalizedMainState =
        mainState
          ? normalizeUf(mainState)
          : null

      if (normalizedCreciUf.length !== 2) {
        setStatus(
          'Informe a UF do CRECI com 2 letras.'
        )
        return
      }

      if (
        mainState &&
        normalizedMainState?.length !== 2
      ) {
        setStatus(
          'Informe a UF de atuação com 2 letras.'
        )
        return
      }

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
              name,
              primary_entry_flow:
                'broker_professional',
            },
          },
        })

      if (error) {
        console.error(
          'SIGNUP ERROR:',
          error
        )

        setStatus(error.message)
        return
      }

      const user = data.user

      if (!user) {
        setStatus(
          'Erro ao criar usuário.'
        )
        return
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      )

      setStatus(
        'Conta criada. Entrando...'
      )

      const loginResult =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        )

      if (loginResult.error) {
        console.error(
          'AUTO LOGIN ERROR:',
          loginResult.error
        )

        setStatus(
          'Conta criada. Faça login manualmente.'
        )
        return
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setStatus(
          'Sessão ainda não estabilizada.'
        )
        return
      }

      const now = new Date().toISOString()

      const { error: profileUpdateError } =
        await supabase
          .from('users_profile')
          .update({
            display_name: name,
            email,
            registration_status:
              'professional_pending',
            primary_entry_flow:
              'broker_professional',
            terms_version_accepted:
              '2026-05',
            terms_accepted_at: now,
          })
          .eq('id', user.id)

      if (profileUpdateError) {
        console.error(
          'PROFILE UPDATE ERROR:',
          profileUpdateError
        )

        setStatus(
          'Conta criada, mas houve erro ao atualizar o perfil.'
        )
        return
      }

      const { error: brokerProfileError } =
        await supabase
          .from('broker_profiles')
          .upsert(
            {
              profile_id: user.id,
              professional_name: name,
              creci_number:
                creciNumber.trim(),
              creci_uf: normalizedCreciUf,
              main_city:
                mainCity.trim() || null,
              main_state:
                normalizedMainState,
              professional_status:
                'active',
              verification_status:
                'pending',
              public_visibility_status:
                'private',
            },
            {
              onConflict: 'profile_id',
            }
          )

      if (brokerProfileError) {
        console.error(
          'BROKER PROFILE ERROR:',
          brokerProfileError
        )

        setStatus(
          'Conta criada, mas houve erro ao criar o perfil profissional.'
        )
        return
      }

      window.location.href = '/broker'
    } catch (error) {
      console.error(
        'SIGNUP FAILURE:',
        error
      )

      setStatus(
        'Erro inesperado no cadastro.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 460,
        margin: '80px auto',
        border: '1px solid #ddd',
        borderRadius: 12,
      }}
    >
      <h1 style={{ marginBottom: 20 }}>
        {mode === 'login'
          ? 'Entrar'
          : 'Criar conta profissional'}
      </h1>

      {mode === 'signup' && (
        <>
          <input
            placeholder="Nome profissional"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            placeholder="CRECI"
            value={creciNumber}
            onChange={(e) =>
              setCreciNumber(
                e.target.value
              )
            }
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            placeholder="UF do CRECI"
            value={creciUf}
            onChange={(e) =>
              setCreciUf(e.target.value)
            }
            disabled={loading}
            maxLength={2}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          />

          <input
            placeholder="Cidade principal de atuação"
            value={mainCity}
            onChange={(e) =>
              setMainCity(e.target.value)
            }
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            placeholder="UF de atuação"
            value={mainState}
            onChange={(e) =>
              setMainState(e.target.value)
            }
            disabled={loading}
            maxLength={2}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          />

          <label
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              marginBottom: 20,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) =>
                setAcceptTerms(
                  e.target.checked
                )
              }
            />

            <span>
              Li e concordo com os Termos de Uso e Política de Privacidade da HURBY.
            </span>
          </label>
        </>
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 12,
        }}
      />

      <input
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 12,
        }}
      />

      <button
        onClick={
          mode === 'login'
            ? handleLogin
            : handleSignup
        }
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          cursor: loading
            ? 'not-allowed'
            : 'pointer',
        }}
      >
        {loading
          ? 'Processando...'
          : mode === 'login'
          ? 'Entrar'
          : 'Criar conta profissional'}
      </button>

      <button
        onClick={() =>
          setMode(
            mode === 'login'
              ? 'signup'
              : 'login'
          )
        }
        disabled={loading}
        style={{
          width: '100%',
          padding: 12,
          marginTop: 10,
          cursor: loading
            ? 'not-allowed'
            : 'pointer',
        }}
      >
        {mode === 'login'
          ? 'Criar conta profissional'
          : 'Já possuo conta'}
      </button>

      {!!status && (
        <p
          style={{
            marginTop: 20,
            color:
              status
                .toLowerCase()
                .includes('criada') ||
              status
                .toLowerCase()
                .includes('entrando')
                ? 'green'
                : 'red',
          }}
        >
          {status}
        </p>
      )}

      <p
        style={{
          marginTop: 20,
          fontSize: 12,
          color: '#666',
          lineHeight: 1.5,
        }}
      >
        Esta entrada é destinada ao ambiente profissional HURBY. Contas comuns do marketplace Cadê Negócios terão fluxo próprio.
      </p>
    </div>
  )
}
