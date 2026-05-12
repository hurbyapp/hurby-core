'use client'

/*
=========================================
HURBY — REGISTER AGENCY
LOCAL:
src/app/register/agency/page.tsx

OBJETIVO:
Validar porta de cadastro de imobiliária.

CRIA:
- auth.users
- users_profile neutro do responsável
- organizations
- organization_memberships
=========================================
*/

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterAgencyPage() {
  const [responsibleName, setResponsibleName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [responsiblePhone, setResponsiblePhone] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      if (!acceptTerms) {
        setStatus('Aceite os termos para continuar.')
        return
      }

      if (!responsibleName || !email || !password || !legalName || !documentNumber) {
        setStatus('Preencha responsável, email, senha, razão social e CNPJ.')
        return
      }

      if (password.length < 6) {
        setStatus('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: responsibleName,
            name: responsibleName,
            phone: responsiblePhone,
            primary_entry_flow: 'agency_owner',
          },
        },
      })

      if (error) {
        console.error('AGENCY SIGNUP ERROR:', error)
        setStatus(error.message)
        return
      }

      const user = data.user

      if (!user) {
        setStatus('Erro ao criar usuário.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const loginResult = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginResult.error) {
        console.error('AGENCY AUTO LOGIN ERROR:', loginResult.error)
        setStatus('Conta criada. Faça login manualmente.')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const now = new Date().toISOString()

      const { error: profileError } = await supabase
        .from('users_profile')
        .update({
          display_name: responsibleName,
          email,
          phone: responsiblePhone || null,
          registration_status: 'professional_pending',
          primary_entry_flow: 'agency_owner',
          terms_version_accepted: '2026-05',
          terms_accepted_at: now,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('AGENCY PROFILE ERROR:', profileError)
        setStatus('Conta criada, mas houve erro ao atualizar profile.')
        return
      }

      const organizationId = crypto.randomUUID()

      const { error: organizationError } = await supabase
        .from('organizations')
        .insert({
          id: organizationId,
          organization_type: 'agency',
          legal_name: legalName,
          trade_name: tradeName || null,
          document_number: documentNumber,
          created_by_profile_id: user.id,
          is_active: true,
        })

      if (organizationError) {
        console.error('ORGANIZATION ERROR:', organizationError)
        setStatus('Erro ao criar organização.')
        return
      }

      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          organization_id: organizationId,
          profile_id: user.id,
          membership_role: 'owner',
          membership_status: 'active',
        })

      if (membershipError) {
        console.error('MEMBERSHIP ERROR:', membershipError)
        setStatus('Organização criada, mas houve erro ao criar vínculo.')
        return
      }

      window.location.href = '/agency'
    } catch (error) {
      console.error('AGENCY SIGNUP FAILURE:', error)
      setStatus('Erro inesperado no cadastro de imobiliária.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 660, margin: '60px auto' }}>
      <h1>Cadastro de imobiliária</h1>

      <input placeholder="Nome do responsável" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Email do responsável" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Telefone do responsável" value={responsiblePhone} onChange={(e) => setResponsiblePhone(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Nome fantasia" value={tradeName} onChange={(e) => setTradeName(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Razão social" value={legalName} onChange={(e) => setLegalName(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="CNPJ" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />

      <label style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
        <span>Li e aceito os Termos de Uso e Política de Privacidade.</span>
      </label>

      <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 12 }}>
        {loading ? 'Processando...' : 'Criar cadastro de imobiliária'}
      </button>

      {!!status && <p style={{ marginTop: 16, color: 'red' }}>{status}</p>}
    </div>
  )
}
