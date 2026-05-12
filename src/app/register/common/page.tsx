'use client'

/*
=========================================
HURBY — REGISTER COMMON
LOCAL:
src/app/register/common/page.tsx

OBJETIVO:
Validar porta de cadastro de usuario comum do marketplace.

CRIA:
- auth.users
- users_profile neutro
- client_entities
- client_contact_methods
- client_relationships
- client_relationship_roles

REGRA:
Usuario comum nao e broker.
Usuario comum nao acessa modulo profissional.
=========================================
*/

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Intent = 'seeker' | 'property_provider' | 'both'

export default function RegisterCommonPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [intent, setIntent] = useState<Intent>('seeker')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const onlyDigits = (value: string) => value.replace(/\D/g, '')

  const handleSubmit = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      const cleanPhone = onlyDigits(phone)
      const cleanWhatsapp = onlyDigits(whatsapp)

      if (!acceptTerms) {
        setStatus('Aceite os termos para continuar.')
        return
      }

      if (!name || !email || !password) {
        setStatus('Preencha nome, email e senha.')
        return
      }

      if (password.length < 6) {
        setStatus('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      if (phone && cleanPhone.length < 8) {
        setStatus('Informe um telefone valido apenas com numeros.')
        return
      }

      if (whatsapp && cleanWhatsapp.length < 8) {
        setStatus('Informe um WhatsApp valido apenas com numeros.')
        return
      }

      const primaryEntryFlow =
        intent === 'property_provider'
          ? 'property_provider'
          : intent === 'seeker'
          ? 'seeker'
          : 'marketplace_common'

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            name,
            phone: cleanPhone || cleanWhatsapp || null,
            primary_entry_flow: primaryEntryFlow,
          },
        },
      })

      if (error) {
        console.error('COMMON SIGNUP ERROR:', error)
        setStatus(error.message)
        return
      }

      const user = data.user

      if (!user) {
        setStatus('Erro ao criar usuario.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const loginResult = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginResult.error) {
        console.error('COMMON AUTO LOGIN ERROR:', loginResult.error)
        setStatus('Conta criada. Faça login manualmente.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const now = new Date().toISOString()

      const { error: profileError } = await supabase
        .from('users_profile')
        .update({
          display_name: name,
          email,
          phone: cleanPhone || cleanWhatsapp || null,
          registration_status: 'completed',
          primary_entry_flow: primaryEntryFlow,
          terms_version_accepted: '2026-05',
          terms_accepted_at: now,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('COMMON PROFILE ERROR:', profileError)
        setStatus('Conta criada, mas houve erro ao atualizar profile.')
        return
      }

      const { data: clientEntity, error: clientError } = await supabase
        .from('client_entities')
        .insert({
          linked_profile_id: user.id,
          display_name: name,
          entity_type: 'individual',
          verification_level:
            cleanPhone || cleanWhatsapp ? 'contact_verified' : 'unverified',
          entity_status: 'active',
          created_by_profile_id: user.id,
        })
        .select('id')
        .single()

      if (clientError || !clientEntity) {
        console.error('COMMON CLIENT ERROR:', clientError)
        setStatus('Erro ao criar entidade de cliente.')
        return
      }

      const contacts = [
        {
          client_entity_id: clientEntity.id,
          contact_type: 'email',
          contact_value: email,
          is_primary: true,
          verification_status: 'unverified',
          consent_status: 'granted',
          created_by_profile_id: user.id,
        },
      ]

      if (cleanPhone) {
        contacts.push({
          client_entity_id: clientEntity.id,
          contact_type: 'phone',
          contact_value: cleanPhone,
          is_primary: !cleanWhatsapp,
          verification_status: 'unverified',
          consent_status: 'granted',
          created_by_profile_id: user.id,
        })
      }

      if (cleanWhatsapp) {
        contacts.push({
          client_entity_id: clientEntity.id,
          contact_type: 'whatsapp',
          contact_value: cleanWhatsapp,
          is_primary: true,
          verification_status: 'unverified',
          consent_status: 'granted',
          created_by_profile_id: user.id,
        })
      }

      const { error: contactsError } = await supabase
        .from('client_contact_methods')
        .insert(contacts)

      if (contactsError) {
        console.error('COMMON CONTACTS ERROR:', contactsError)
        setStatus('Cliente criado, mas houve erro ao salvar contatos.')
        return
      }

      const { data: relationship, error: relationshipError } = await supabase
        .from('client_relationships')
        .insert({
          client_entity_id: clientEntity.id,
          relationship_context: 'marketplace',
          relationship_status: 'active',
          created_by_profile_id: user.id,
          notes: 'Cadastro comum criado pela porta marketplace.',
        })
        .select('id')
        .single()

      if (relationshipError || !relationship) {
        console.error('COMMON RELATIONSHIP ERROR:', relationshipError)
        setStatus('Cliente criado, mas houve erro no relacionamento.')
        return
      }

      const roles = [
        {
          client_relationship_id: relationship.id,
          role_type: 'marketplace_user',
          role_status: 'active',
        },
      ]

      if (intent === 'seeker' || intent === 'both') {
        roles.push({
          client_relationship_id: relationship.id,
          role_type: 'seeker',
          role_status: 'active',
        })
      }

      if (intent === 'property_provider' || intent === 'both') {
        roles.push({
          client_relationship_id: relationship.id,
          role_type: 'property_provider',
          role_status: 'active',
        })
      }

      const { error: rolesError } = await supabase
        .from('client_relationship_roles')
        .insert(roles)

      if (rolesError) {
        console.error('COMMON ROLES ERROR:', rolesError)
        setStatus('Cliente criado, mas houve erro ao salvar papeis.')
        return
      }

      window.location.href = '/account'
    } catch (error) {
      console.error('COMMON SIGNUP FAILURE:', error)
      setStatus('Erro inesperado no cadastro comum.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 620, margin: '60px auto' }}>
      <h1>Conta comum do marketplace</h1>

      <p>
        Esta conta e para navegar no Cadê Negocios, salvar favoritos,
        acompanhar atendimentos futuros e anunciar imovel proprio em fluxo comum.
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

      <input
        placeholder="Telefone somente numeros"
        value={phone}
        onChange={(e) => setPhone(onlyDigits(e.target.value))}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      <input
        placeholder="WhatsApp somente numeros"
        value={whatsapp}
        onChange={(e) => setWhatsapp(onlyDigits(e.target.value))}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />

      <select
        value={intent}
        onChange={(e) => setIntent(e.target.value as Intent)}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      >
        <option value="seeker">Estou procurando imovel</option>
        <option value="property_provider">Quero anunciar meu imovel</option>
        <option value="both">Quero buscar e anunciar</option>
      </select>

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
        {loading ? 'Processando...' : 'Criar conta comum'}
      </button>

      {!!status && <p style={{ marginTop: 16, color: 'red' }}>{status}</p>}

      <p style={{ marginTop: 20 }}>
        <Link href="/login">Voltar ao login</Link>
      </p>
    </div>
  )
}
