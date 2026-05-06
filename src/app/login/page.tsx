'use client'

/*
=========================================
HURBY — LOGIN / AUTH PAGE
LOCAL:
src/app/login/page.tsx

RESPONSABILIDADES:
- login
- signup
- redirect por perfil
- estabilização de sessão auth
- integração com middleware SSR

-----------------------------------------

ROTAS OFICIAIS

- /broker
- /agency
- /owner

TIPO PADRÃO:
broker

-----------------------------------------

IMPORTANTE — HISTÓRICO CRÍTICO

[2026-05-06]

Após implantação do módulo LGPD,
foram identificados problemas de:

- login inconsistente
- erro 400 auth
- profile não encontrado
- redirect inesperado
- retorno indevido para login
- sessão fantasma pós logout

-----------------------------------------

CAUSA RAIZ IDENTIFICADA

A RPC register_consent()
estava sendo executada imediatamente
após login.

Em alguns cenários:
- auth.uid() ainda não estava estabilizado
- cookies SSR ainda não estavam sincronizados
- middleware recebia sessão inconsistente

-----------------------------------------

DECISÃO TEMPORÁRIA

A RPC LGPD foi removida do fluxo crítico
de autenticação para estabilização completa
do auth.

-----------------------------------------

REGRAS IMPORTANTES

NÃO:
- executar RPCs críticas imediatamente após login
- alterar redirects sem validar middleware
- criar múltiplos clients Supabase
- confiar apenas em router.push()
- criar lógica auth duplicada

-----------------------------------------

IMPORTANTE SOBRE REDIRECT

window.location.href foi adotado
em vez de router.push()

Motivo:
- força reload completo
- sincroniza middleware SSR
- limpa estados do React/Turbopack
- evita sessão fantasma
- reduz inconsistências de auth

-----------------------------------------

SE FUTURAMENTE REATIVAR LGPD

Preferir:
- delayed execution
- background job
- server action
- useEffect pós estabilização de sessão

-----------------------------------------

DEPENDÊNCIAS

- middleware.ts
- users_profile
- auth.users
- handle_new_user()

=========================================
*/
'use client'

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

      // estabilização SSR/auth

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      )

      // busca profile

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
      // LGPD (NÃO BLOQUEANTE)
      // -------------------------------------

      try {
        await supabase.rpc(
          'register_consent',
          {
            p_type: 'terms_acceptance',
            p_version: 'v1',
          }
        )
      } catch (error) {
        console.error(
          'CONSENT ERROR:',
          error
        )
      }

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

      // estabilização trigger/profile

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      )

      // registra consentimento

      try {
        await supabase.rpc(
          'register_consent',
          {
            p_type: 'terms_acceptance',
            p_version: 'v1',
          }
        )
      } catch (error) {
        console.error(
          'CONSENT ERROR:',
          error
        )
      }

      setStatus(
        'Conta criada. Entrando...'
      )

      // login explícito

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
        setTimeout(resolve, 500)
      )

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