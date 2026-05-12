'use client'

/*
=========================================
HURBY — ACCOUNT PROFILE
LOCAL:
src/app/account/profile/page.tsx

OBJETIVO:
Visualizar e editar cadastro consolidado da conta.

REGRA:
Nao exibir JSON bruto para usuario comum.
Esta pagina e de validacao, mas precisa ser legivel.
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AccountProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [broker, setBroker] = useState<any>(null)

  const [clients, setClients] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])
  const [relationshipRoles, setRelationshipRoles] = useState<any[]>([])

  const [memberships, setMemberships] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])

  const [status, setStatus] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setStatus('')

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        window.location.href = '/login'
        return
      }

      setUser(currentUser)

      const { data: profileData, error: profileError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (profileError) {
        console.error('PROFILE LOAD ERROR:', profileError)
        setStatus('Erro ao carregar profile.')
      }

      setProfile(profileData)

      const { data: brokerData } = await supabase
        .from('broker_profiles')
        .select('*')
        .eq('profile_id', currentUser.id)
        .maybeSingle()

      setBroker(brokerData)

      const { data: clientData } = await supabase
        .from('client_entities')
        .select('*')
        .or(`linked_profile_id.eq.${currentUser.id},created_by_profile_id.eq.${currentUser.id}`)

      setClients(clientData || [])

      const clientIds = (clientData || []).map((item: any) => item.id)

      if (clientIds.length) {
        const { data: contactData } = await supabase
          .from('client_contact_methods')
          .select('*')
          .in('client_entity_id', clientIds)

        setContacts(contactData || [])

        const { data: relationshipData } = await supabase
          .from('client_relationships')
          .select('*')
          .in('client_entity_id', clientIds)

        setRelationships(relationshipData || [])

        const relationshipIds = (relationshipData || []).map((item: any) => item.id)

        if (relationshipIds.length) {
          const { data: roleData } = await supabase
            .from('client_relationship_roles')
            .select('*')
            .in('client_relationship_id', relationshipIds)

          setRelationshipRoles(roleData || [])
        }
      }

      const { data: membershipData } = await supabase
        .from('organization_memberships')
        .select('*')
        .eq('profile_id', currentUser.id)

      setMemberships(membershipData || [])

      const organizationIds = (membershipData || []).map((item: any) => item.organization_id)

      if (organizationIds.length) {
        const { data: organizationData } = await supabase
          .from('organizations')
          .select('*')
          .in('id', organizationIds)

        setOrganizations(organizationData || [])
      }
    } catch (error) {
      console.error('ACCOUNT PROFILE LOAD FAILURE:', error)
      setStatus('Erro inesperado ao carregar cadastro.')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user || !profile) return

    try {
      setSaving(true)
      setStatus('Salvando...')

      const { error } = await supabase
        .from('users_profile')
        .update({
          display_name: profile.display_name || null,
          phone: profile.phone || null,
          avatar_url: profile.avatar_url || null,
        })
        .eq('id', user.id)

      if (error) {
        console.error('PROFILE SAVE ERROR:', error)
        setStatus('Erro ao salvar profile.')
        return
      }

      setStatus('Cadastro atualizado.')
      await loadData()
    } catch (error) {
      console.error('PROFILE SAVE FAILURE:', error)
      setStatus('Erro inesperado ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('PROFILE LOGOUT ERROR:', error)
    }

    window.location.href = '/login'
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Carregando cadastro...</div>
  }

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: '40px auto' }}>
      <nav
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        {broker && <Link href="/broker">Painel Hurby</Link>}
        {memberships.length > 0 && <Link href="/agency">Agency</Link>}
        <Link href="/login">Login</Link>
      </nav>

      <h1>Meu cadastro</h1>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 20 }}>
        <h2>Conta neutra</h2>

        <p><strong>Email auth:</strong> {user?.email}</p>

        <label>Nome</label>
        <input
          placeholder="Nome"
          value={profile?.display_name || ''}
          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />

        <label>Telefone</label>
        <input
          placeholder="Telefone"
          value={profile?.phone || ''}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '') })}
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />

        <label>Avatar URL</label>
        <input
          placeholder="Avatar URL"
          value={profile?.avatar_url || ''}
          onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
          style={{ width: '100%', padding: 12, marginBottom: 12 }}
        />

        <p><strong>Status:</strong> {profile?.account_status}</p>
        <p><strong>Cadastro:</strong> {profile?.registration_status}</p>
        <p><strong>Entrada:</strong> {profile?.primary_entry_flow}</p>

        <button onClick={saveProfile} disabled={saving} style={{ padding: 12 }}>
          {saving ? 'Salvando...' : 'Salvar conta'}
        </button>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 20 }}>
        <h2>Perfil profissional</h2>

        {broker ? (
          <>
            <p><strong>Nome profissional:</strong> {broker.professional_name}</p>
            <p><strong>CRECI:</strong> {broker.creci_number} / {broker.creci_uf}</p>
            <p><strong>Status profissional:</strong> {broker.professional_status}</p>
            <p><strong>Verificacao:</strong> {broker.verification_status}</p>
            <p><strong>Visibilidade:</strong> {broker.public_visibility_status}</p>
          </>
        ) : (
          <p>Nenhum perfil profissional vinculado.</p>
        )}
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 20 }}>
        <h2>Cliente / Marketplace</h2>

        {clients.length ? (
          clients.map((client) => (
            <div key={client.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 12 }}>
              <p><strong>Nome:</strong> {client.display_name || '-'}</p>
              <p><strong>Tipo:</strong> {client.entity_type}</p>
              <p><strong>Status:</strong> {client.entity_status}</p>
              <p><strong>Verificacao:</strong> {client.verification_level}</p>
            </div>
          ))
        ) : (
          <p>Nenhuma entidade de cliente vinculada.</p>
        )}

        <h3>Contatos</h3>

        {contacts.length ? (
          contacts.map((contact) => (
            <div key={contact.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 8, marginBottom: 8 }}>
              <p><strong>Tipo:</strong> {contact.contact_type}</p>
              <p><strong>Contato:</strong> {contact.contact_value}</p>
              <p><strong>Principal:</strong> {contact.is_primary ? 'sim' : 'nao'}</p>
              <p><strong>Consentimento:</strong> {contact.consent_status}</p>
            </div>
          ))
        ) : (
          <p>Nenhum contato encontrado.</p>
        )}

        <h3>Relacionamentos</h3>

        {relationships.length ? (
          relationships.map((relationship) => (
            <div key={relationship.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 8, marginBottom: 8 }}>
              <p><strong>Contexto:</strong> {relationship.relationship_context}</p>
              <p><strong>Status:</strong> {relationship.relationship_status}</p>
              <p><strong>Observacao:</strong> {relationship.notes || '-'}</p>
            </div>
          ))
        ) : (
          <p>Nenhum relacionamento encontrado.</p>
        )}

        <h3>Papeis</h3>

        {relationshipRoles.length ? (
          <ul>
            {relationshipRoles.map((role) => (
              <li key={role.id}>
                {role.role_type} - {role.role_status}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum papel encontrado.</p>
        )}
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 20 }}>
        <h2>Organizacoes</h2>

        {memberships.length ? (
          <>
            {memberships.map((membership) => (
              <div key={membership.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 8, marginBottom: 8 }}>
                <p><strong>Organization ID:</strong> {membership.organization_id}</p>
                <p><strong>Papel:</strong> {membership.membership_role}</p>
                <p><strong>Status:</strong> {membership.membership_status}</p>
              </div>
            ))}

            {organizations.map((organization) => (
              <div key={organization.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 8, marginBottom: 8 }}>
                <p><strong>Nome:</strong> {organization.trade_name || organization.legal_name}</p>
                <p><strong>Tipo:</strong> {organization.organization_type}</p>
                <p><strong>Documento:</strong> {organization.document_number}</p>
              </div>
            ))}
          </>
        ) : (
          <p>Nenhum vinculo institucional encontrado.</p>
        )}
      </section>

      {!!status && <p>{status}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
