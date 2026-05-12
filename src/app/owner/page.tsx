'use client'

/*
=========================================
HURBY â€” OWNER VALIDATION DASHBOARD
LOCAL:
src/app/owner/page.tsx

STATUS:
OWNER_VALIDATION_DASHBOARD

OBJETIVO:
Ambiente Owner temporario para validar:
- usuarios
- imoveis
- saldos AXE
- distribuicao de AXE

IMPORTANTE:
Nao representa Core Owner/Admin definitivo.
Futuro Core Owner deve ter governanca, auditoria, logs,
permissoes administrativas e trilha financeira formal.
=========================================
*/

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type OwnerUser = {
  profile_id: string
  display_name: string | null
  email: string | null
  primary_entry_flow: string | null
  registration_status: string | null
  account_status: string | null
  property_count: number
  axe_balance: number
}

type OwnerProperty = {
  listing_id: string
  title: string | null
  price: number | null
  created_by_profile_id: string | null
  created_by_email: string | null
  created_by_name: string | null
  visibility_scope: string | null
  source: string | null
  origin_label: string | null
  created_at: string | null
}

export default function OwnerPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<OwnerUser[]>([])
  const [properties, setProperties] = useState<OwnerProperty[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('10')
  const [status, setStatus] = useState('')

  useEffect(() => {
    loadOwnerData()
  }, [])

  const stats = useMemo(() => {
    const totalUsers = users.length
    const marketplace = users.filter((item) =>
      ['seeker', 'property_provider', 'marketplace_common'].includes(
        item.primary_entry_flow || ''
      )
    ).length
    const brokers = users.filter(
      (item) => item.primary_entry_flow === 'broker_professional'
    ).length
    const agencies = users.filter(
      (item) => item.primary_entry_flow === 'agency_owner'
    ).length
    const owners = users.filter(
      (item) => item.primary_entry_flow === 'platform_owner'
    ).length

    const totalProperties = properties.length
    const marketplaceProperties = properties.filter(
      (item) => item.source === 'marketplace_user_listing'
    ).length
    const operationalProperties = properties.filter(
      (item) => item.source !== 'marketplace_user_listing'
    ).length

    return {
      totalUsers,
      marketplace,
      brokers,
      agencies,
      owners,
      totalProperties,
      marketplaceProperties,
      operationalProperties,
    }
  }, [users, properties])

  const loadOwnerData = async () => {
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

      const { data: isOwner, error: ownerError } = await supabase.rpc(
        'is_platform_owner'
      )

      if (ownerError) {
        console.error('OWNER CHECK ERROR:', ownerError)
        setStatus('Erro ao validar Owner.')
        setLoading(false)
        return
      }

      if (!isOwner) {
        const { data: profile } = await supabase
          .from('users_profile')
          .select('primary_entry_flow, account_status')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (
          profile?.account_status === 'active' &&
          profile?.primary_entry_flow === 'agency_owner'
        ) {
          window.location.href = '/agency'
          return
        }

        if (
          profile?.account_status === 'active' &&
          profile?.primary_entry_flow === 'broker_professional'
        ) {
          window.location.href = '/broker'
          return
        }

        const { data: activeMembership } = await supabase
          .from('organization_memberships')
          .select('id, membership_role, membership_status')
          .eq('profile_id', currentUser.id)
          .eq('membership_status', 'active')
          .in('membership_role', ['owner', 'manager'])
          .limit(1)
          .maybeSingle()

        if (activeMembership) {
          window.location.href = '/agency'
          return
        }

        const { data: brokerProfile } = await supabase
          .from('broker_profiles')
          .select('id, professional_status')
          .eq('profile_id', currentUser.id)
          .neq('professional_status', 'suspended')
          .limit(1)
          .maybeSingle()

        if (brokerProfile) {
          window.location.href = '/broker'
          return
        }

        window.location.href = '/account'
        return
      }

      const { data: usersData, error: usersError } = await supabase.rpc(
        'owner_validation_users'
      )

      if (usersError) {
        console.error('OWNER USERS ERROR:', usersError)
        setStatus('Erro ao carregar usuarios.')
      }

      const { data: propertiesData, error: propertiesError } =
        await supabase.rpc('owner_validation_properties')

      if (propertiesError) {
        console.error('OWNER PROPERTIES ERROR:', propertiesError)
        setStatus('Erro ao carregar imoveis.')
      }

      setUsers(usersData || [])
      setProperties(propertiesData || [])
    } catch (error) {
      console.error('OWNER LOAD FAILURE:', error)
      setStatus('Erro inesperado ao carregar Owner.')
    } finally {
      setLoading(false)
    }
  }

  const addAxe = async (targetUserId?: string) => {
    const userId = targetUserId || selectedUserId
    const value = Number(amount)

    if (!userId) {
      setStatus('Selecione um usuario.')
      return
    }

    if (!value || value <= 0) {
      setStatus('Informe uma quantidade valida de AXE.')
      return
    }

    try {
      setStatus('Distribuindo AXE...')

      const { error } = await supabase.rpc('owner_add_axe', {
        p_user_id: userId,
        p_amount: value,
        p_description: 'Credito Owner temporario',
      })

      if (error) {
        console.error('OWNER ADD AXE ERROR:', error)
        setStatus(error.message || 'Erro ao adicionar AXE.')
        return
      }

      setStatus('AXE adicionado.')
      await loadOwnerData()
    } catch (error) {
      console.error('OWNER ADD AXE FAILURE:', error)
      setStatus('Erro inesperado ao adicionar AXE.')
    }
  }

  const handleLogout = async () => {
    setStatus('Saindo...')
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const profileLabel = (flow: string | null) => {
    if (flow === 'platform_owner') return 'Owner'
    if (flow === 'agency_owner') return 'Agency'
    if (flow === 'broker_professional') return 'Broker'
    if (flow === 'seeker') return 'MP'
    if (flow === 'property_provider') return 'MP Anunciante'
    if (flow === 'marketplace_common') return 'MP'
    return flow || '-'
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Carregando Owner...</main>
  }

  return (
    <main style={{ padding: 32 }}>
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
        <Link href="/owner">Owner</Link>
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/broker">Broker</Link>
        <Link href="/agency">Agency</Link>
        <Link href="/operations/properties">Imoveis</Link>
        <Link href="/operations/properties/new">Cadastrar imovel</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
        <Link href="/statement">Extrato AXE</Link>
      </nav>

      <h1>Owner temporario de validacao</h1>

      <p>
        <strong>Usuario:</strong> {user?.email}
      </p>

      <p style={{ color: '#666' }}>
        Este ambiente e temporario. O Core Owner/Admin definitivo sera criado
        futuramente com governanca, auditoria e regras administrativas reais.
      </p>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Usuarios</strong>
          <p>{stats.totalUsers}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>MP</strong>
          <p>{stats.marketplace}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Broker</strong>
          <p>{stats.brokers}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Agency</strong>
          <p>{stats.agencies}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Owner</strong>
          <p>{stats.owners}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Imoveis total</strong>
          <p>{stats.totalProperties}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Cad. MP</strong>
          <p>{stats.marketplaceProperties}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <strong>Operacionais</strong>
          <p>{stats.operationalProperties}</p>
        </div>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 24 }}>
        <h2>Distribuir AXE</h2>

        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{ padding: 10, marginRight: 8, minWidth: 260 }}
        >
          <option value="">Selecionar usuario</option>
          {users.map((item) => (
            <option key={item.profile_id} value={item.profile_id}>
              {item.display_name || item.email} - {profileLabel(item.primary_entry_flow)}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: 10, marginRight: 8, width: 100 }}
        />

        <button onClick={() => addAxe()}>Adicionar AXE</button>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 24 }}>
        <h2>Usuarios</h2>

        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Profile</th>
              <th>Qtd imoveis</th>
              <th>AXE</th>
              <th>Acao</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.profile_id}>
                <td>{item.profile_id.slice(0, 8)}</td>
                <td>{item.display_name || '-'}</td>
                <td>{item.email || '-'}</td>
                <td>{profileLabel(item.primary_entry_flow)}</td>
                <td>{item.property_count}</td>
                <td>{item.axe_balance}</td>
                <td>
                  <button onClick={() => addAxe(item.profile_id)}>
                    +{amount || 0} AXE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, marginBottom: 24 }}>
        <h2>Imoveis</h2>

        <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Titulo</th>
              <th>Valor</th>
              <th>Usuario</th>
              <th>Origem</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((item) => (
              <tr key={item.listing_id}>
                <td>{item.listing_id.slice(0, 8)}</td>
                <td>{item.title || '-'}</td>
                <td>{item.price ?? '-'}</td>
                <td>{item.created_by_name || item.created_by_email || '-'}</td>
                <td>{item.origin_label || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {!!status && <p>{status}</p>}

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}

