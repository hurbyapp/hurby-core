'use client'

/*
=========================================
HURBY - REGISTER OWNER VALIDATION
LOCAL:
src/app/register/owner/page.tsx

STATUS:
OWNER_VALIDATION_REGISTER_LOCKED

OBJETIVO:
Criar usuario Owner temporario de validacao.

IMPORTANTE:
Nao representa Core Owner/Admin definitivo.
Serve apenas para validar:
- login Owner
- dashboard Owner
- visao de usuarios
- visao de imoveis
- distribuicao de AXE

REGRA CRITICA:
O Owner temporario deve nascer e permanecer com:
- primary_entry_flow = platform_owner
- account_status = active
- registration_status = completed

Motivo:
Sem primary_entry_flow = platform_owner, a trigger de auth pode criar o perfil como seeker,
fazendo o login cair no fluxo comum de marketplace/account.
=========================================
*/

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterOwnerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      const normalizedName = name.trim()
      const normalizedEmail = email.trim().toLowerCase()

      if (!acceptTerms) {
        setStatus('Aceite os termos para continuar.')
        return
      }

      if (!normalizedName || !normalizedEmail || !password) {
        setStatus('Preencha nome, email e senha.')
        return
      }

      if (password.length < 6) {
        setStatus('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: normalizedName,
            name: normalizedName,
            primary_entry_flow: 'platform_owner',
            account_status: 'active',
            registration_status: 'completed',
          },
        },
      })

      if (error) {
        console.error('OWNER SIGNUP ERROR:', error)
        setStatus(error.message)
        return
      }

      const createdUser = data.user

      if (!createdUser) {
        setStatus('Erro ao criar usuario Owner.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const loginResult = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (loginResult.error) {
        console.error('OWNER AUTO LOGIN ERROR:', loginResult.error)
        setStatus('Owner criado. Faca login manualmente.')
        return
      }

      const currentUserId = loginResult.data.user?.id || createdUser.id

      if (!currentUserId) {
        setStatus('Owner criado, mas nao foi possivel confirmar o usuario autenticado.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 800))

      const now = new Date().toISOString()

      const { error: profileError } = await supabase
        .from('users_profile')
        .upsert(
          {
            id: currentUserId,
            display_name: normalizedName,
            email: normalizedEmail,
            primary_entry_flow: 'platform_owner',
            registration_status: 'completed',
            account_status: 'active',
            terms_version_accepted: '2026-05',
            terms_accepted_at: now,
            updated_at: now,
          },
          {
            onConflict: 'id',
          }
        )

      if (profileError) {
        console.error('OWNER PROFILE ERROR:', profileError)
        setStatus('Owner criado, mas houve erro ao atualizar profile.')
        return
      }

      const { data: isOwner, error: ownerCheckError } = await supabase.rpc(
        'is_platform_owner'
      )

      if (ownerCheckError) {
        console.error('OWNER CHECK ERROR:', ownerCheckError)
        setStatus('Owner criado, mas houve erro ao validar acesso Owner.')
        return
      }

      if (!isOwner) {
        setStatus(
          'Owner criado, mas ainda nao foi reconhecido como platform_owner. Valide o users_profile.'
        )
        return
      }

      window.location.href = '/owner'
    } catch (error) {
      console.error('OWNER SIGNUP FAILURE:', error)
      setStatus('Erro inesperado no cadastro Owner.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 620, margin: '60px auto' }}>
      <h1>Porta Owner</h1>

      <p>
        Cadastro temporario para validar ambiente Owner. Nao representa o Core
        Owner/Admin definitivo.
      </p>

      <input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      <input
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      <label style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
        />
        <span>Li e aceito os Termos de Uso e Politica de Privacidade.</span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: 12 }}
      >
        {loading ? 'Processando...' : 'Criar Owner temporario'}
      </button>

      {!!status && <p style={{ marginTop: 16, color: 'red' }}>{status}</p>}

      <p style={{ marginTop: 20 }}>
        <Link href="/login">Voltar ao login</Link>
      </p>
    </div>
  )
}
