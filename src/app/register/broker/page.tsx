'use client'

/*
=========================================
HURBY — REGISTER BROKER
LOCAL:
src/app/register/broker/page.tsx

OBJETIVO:
Validar porta profissional de corretor.

CRIA:
- auth.users
- users_profile neutro
- broker_profiles
- broker_verifications
=========================================
*/

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterBrokerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [creciNumber, setCreciNumber] = useState('')
  const [creciUf, setCreciUf] = useState('')
  const [mainCity, setMainCity] = useState('')
  const [mainState, setMainState] = useState('')
  const [serviceRegion, setServiceRegion] = useState('')
  const [bio, setBio] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const normalizeUf = (value: string) =>
    value.trim().toUpperCase().slice(0, 2)

  const handleSubmit = async () => {
    if (loading) return

    try {
      setLoading(true)
      setStatus('')

      if (!acceptTerms) {
        setStatus('Aceite os termos para continuar.')
        return
      }

      if (!name || !email || !password || !creciNumber || !creciUf) {
        setStatus('Preencha nome, email, senha, CRECI e UF do CRECI.')
        return
      }

      if (password.length < 6) {
        setStatus('A senha deve ter pelo menos 6 caracteres.')
        return
      }

      const normalizedCreciUf = normalizeUf(creciUf)
      const normalizedMainState = mainState ? normalizeUf(mainState) : null

      if (normalizedCreciUf.length !== 2) {
        setStatus('Informe a UF do CRECI com 2 letras.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            name,
            phone,
            primary_entry_flow: 'broker_professional',
          },
        },
      })

      if (error) {
        console.error('BROKER SIGNUP ERROR:', error)
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
        console.error('BROKER AUTO LOGIN ERROR:', loginResult.error)
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
          phone: phone || null,
          registration_status: 'professional_pending',
          primary_entry_flow: 'broker_professional',
          terms_version_accepted: '2026-05',
          terms_accepted_at: now,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('BROKER PROFILE UPDATE ERROR:', profileError)
        setStatus('Conta criada, mas houve erro ao atualizar profile.')
        return
      }

      const { data: brokerProfile, error: brokerError } = await supabase
        .from('broker_profiles')
        .upsert(
          {
            profile_id: user.id,
            professional_name: name,
            document_cpf: cpf || null,
            creci_number: creciNumber.trim(),
            creci_uf: normalizedCreciUf,
            main_city: mainCity.trim() || null,
            main_state: normalizedMainState,
            service_region: serviceRegion.trim() || null,
            bio: bio.trim() || null,
            professional_status: 'active',
            verification_status: 'pending',
            public_visibility_status: 'private',
          },
          { onConflict: 'profile_id' }
        )
        .select('id')
        .single()

      if (brokerError || !brokerProfile) {
        console.error('BROKER PROFILE ERROR:', brokerError)
        setStatus('Erro ao criar perfil profissional.')
        return
      }

      const { error: verificationError } = await supabase
        .from('broker_verifications')
        .insert({
          broker_profile_id: brokerProfile.id,
          verification_type: 'creci',
          verification_status: 'pending',
          creci_number: creciNumber.trim(),
          creci_uf: normalizedCreciUf,
          submitted_data: {
            professional_name: name,
            document_cpf: cpf || null,
            main_city: mainCity || null,
            main_state: normalizedMainState,
          },
        })

      if (verificationError) {
        console.error('BROKER VERIFICATION ERROR:', verificationError)
        setStatus('Perfil criado, mas houve erro ao registrar verificação.')
        return
      }

      window.location.href = '/broker'
    } catch (error) {
      console.error('BROKER SIGNUP FAILURE:', error)
      setStatus('Erro inesperado no cadastro de corretor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 660, margin: '60px auto' }}>
      <h1>Cadastro de corretor</h1>

      <input placeholder="Nome profissional" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="CRECI" value={creciNumber} onChange={(e) => setCreciNumber(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="UF do CRECI" maxLength={2} value={creciUf} onChange={(e) => setCreciUf(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12, textTransform: 'uppercase' }} />
      <input placeholder="Cidade de atuação" value={mainCity} onChange={(e) => setMainCity(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <input placeholder="UF de atuação" maxLength={2} value={mainState} onChange={(e) => setMainState(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12, textTransform: 'uppercase' }} />
      <input placeholder="Região de atuação" value={serviceRegion} onChange={(e) => setServiceRegion(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      <textarea placeholder="Bio profissional curta" value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12, minHeight: 90 }} />

      <label style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
        <span>Li e aceito os Termos de Uso e Política de Privacidade.</span>
      </label>

      <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 12 }}>
        {loading ? 'Processando...' : 'Criar cadastro de corretor'}
      </button>

      {!!status && <p style={{ marginTop: 16, color: 'red' }}>{status}</p>}
    </div>
  )
}
