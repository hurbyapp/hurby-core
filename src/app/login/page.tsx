'use client'

/*
=========================================
HURBY — LOGIN / AUTH PAGE
LOCAL:
src/app/login/page.tsx

STATUS:
AUTH_CLOUD_STABILIZED

RESPONSABILIDADES:
- login
- signup
- redirect por perfil
- estabilização de sessão auth
- integração com middleware SSR
- compatibilidade Vercel Edge Runtime

-----------------------------------------

CORREÇÕES CLOUD SSR

[2026-05-07]

Problemas identificados:
- loop login -> login
- sessão inconsistente no Vercel
- middleware recebendo auth parcial
- redirect antes da persistência completa
- race condition SSR/cookies

-----------------------------------------

CAUSAS IDENTIFICADAS

1. RPC executando cedo demais
2. cookies SSR ainda não sincronizados
3. redirect prematuro
4. middleware edge validando antes do auth estabilizar

-----------------------------------------

CORREÇÕES IMPLEMENTADAS

✔ remoção RPC crítica do login
✔ remoção RPC crítica do signup
✔ delay SSR aumentado
✔ validação explícita de sessão
✔ estabilização auth cloud
✔ compatibilidade middleware SSR

-----------------------------------------

IMPORTANTE

NÃO:
- executar RPC logo após login
- executar RPC logo após signup
- fazer redirect imediato após auth
- confiar apenas no signInWithPassword

-----------------------------------------

DEPENDÊNCIAS

- middleware.ts
- users_profile
- auth.users
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

  // -------------------------------------
  // REDIRECT POR PERFIL
  // -------------------------------------

  const redirectByType = (
    userType: string
  ) => {
    switch (userType) {
      case 'owner':
        window.location.href = '/owner'
        break

      case 'agency':
        window.location.href = '/agency'
        break

      default:
        window.location.href = '/broker'
        break
    }
  }

  // -------------------------------------
  // LOGIN
  // -------------------------------------

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

      // -------------------------------------
      // ESTABILIZAÇÃO SSR CLOUD
      // -------------------------------------

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      )

      // -------------------------------------
      // VALIDAÇÃO EXPLÍCITA DE SESSÃO
      // -------------------------------------

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setStatus(
          'Sessão ainda não estabilizada. Tente novamente.'
        )

        return
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

      // -------------------------------------
      // REDIRECT FINAL
      // -------------------------------------

      redirectByType(userType)
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

  // -------------------------------------
  // SIGNUP
  // -------------------------------------

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

      // -------------------------------------
      // ESTABILIZAÇÃO TRIGGER CLOUD
      // -------------------------------------

      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      )

      setStatus(
        'Conta criada. Entrando...'
      )

      // -------------------------------------
      // LOGIN EXPLÍCITO
      // -------------------------------------

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

      // -------------------------------------
      // ESTABILIZAÇÃO SSR CLOUD
      // -------------------------------------

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      )

      // -------------------------------------
      // VALIDAÇÃO EXPLÍCITA DE SESSÃO
      // -------------------------------------

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

  // -------------------------------------
  // PAGE
  // -------------------------------------

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
              Li e concordo com os
              Termos de Uso e Política
              de Privacidade da HURBY.
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
        Ao continuar, você concorda
        com os Termos de Uso e Política
        de Privacidade da HURBY.
      </p>
    </div>
  )
}