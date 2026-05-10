'use client'

/*
=========================================
HURBY — LOGIN / AUTH PAGE
LOCAL:
src/app/login/page.tsx

STATUS:
AUTH_CLOUD_STABILIZED
ORGANIZATION_MEMBERSHIP_READY

RESPONSABILIDADES:
- login
- signup
- redirect por identidade base
- redirect por membership organizacional
- estabilização de sessão auth
- integração com middleware SSR
- compatibilidade Vercel Edge Runtime

IMPORTANTE:
Agency NÃO é user_type.
Agency é organization + membership.

user_type representa identidade base:
- owner
- broker
- user

Acesso agency deve ser definido por:
- organization_memberships
- membership_status = active
- membership_role compatível

NÃO:
- restaurar user_type = agency
- acoplar vínculo organizacional em users_profile
- usar agency_id em users_profile

DEPENDÊNCIAS:
- middleware.ts
- auth.users
- users_profile
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

  const [acceptTerms, setAcceptTerms] =
    useState(false)

  const [status, setStatus] = useState('')

  const [loading, setLoading] =
    useState(false)

  const redirectAfterLogin = async (
    userId: string,
    userType: string
  ) => {
    if (userType === 'owner') {
      window.location.href = '/owner'
      return
    }

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

    window.location.href = '/broker'
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

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('users_profile')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error(
          'PROFILE ERROR:',
          profileError
        )
      }

      const userType =
        profile?.user_type || 'broker'

      await redirectAfterLogin(
        user.id,
        userType
      )
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

      if (!email || !password) {
        setStatus(
          'Preencha email e senha.'
        )
        return
      }

      if (password.length < 6) {
        setStatus(
          'A senha deve possuir pelo menos 6 caracteres.'
        )
        return
      }

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              user_type: 'broker',
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
        maxWidth: 420,
        margin: '80px auto',
        border: '1px solid #ddd',
        borderRadius: 12,
      }}
    >
      <h1 style={{ marginBottom: 20 }}>
        {mode === 'login'
          ? 'Entrar'
          : 'Criar conta'}
      </h1>

      {mode === 'signup' && (
        <>
          <input
            placeholder="Nome"
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
          : 'Criar conta'}
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
          ? 'Criar nova conta'
          : 'Já possuo conta'}
      </button>

      {!!status && (
        <p
          style={{
            marginTop: 20,
            color: status
              .toLowerCase()
              .includes('criada')
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
        Ao continuar, você concorda com os Termos de Uso e Política de Privacidade da HURBY.
      </p>
    </div>
  )
}
