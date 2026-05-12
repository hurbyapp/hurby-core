'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTY FOUNDATION PAGE
LOCAL:
src/app/operations/properties/page.tsx

REGRA:
Acesso permitido somente para contexto profissional:
- broker_profile ativo
- organization_membership owner/manager ativo

Usuario comum do marketplace nao acessa este modulo.
=========================================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { requireProfessionalAccess } from '@/lib/services/accessService'
import { supabase } from '@/lib/supabaseClient'

export default function PropertiesHomePage() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const validateAccess = async () => {
      const result = await requireProfessionalAccess()

      if (!result.allowed) {
        return
      }

      setLoading(false)
    }

    validateAccess()
  }, [])

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('PROPERTIES LOGOUT ERROR:', error)
    }

    window.location.href = '/login'
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Validando acesso profissional...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <nav
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/broker">Broker</Link>
        <Link href="/agency">Agency</Link>
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/operations/properties">Imoveis</Link>
        <Link href="/operations/properties/new">Cadastrar imovel</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
        <Link href="/statement">Extrato AXE</Link>
      </nav>

      <h1>Core Imobiliario Operacional</h1>

      <p>
        Foundation operacional de imoveis do ecossistema Hurby.
      </p>

      <p>
        Este nucleo trabalha com carteira operacional, origem, ativo, anuncio
        e vinculo de portfolio.
      </p>

      <ul>
        <li>
          <Link href="/operations/properties/new">Cadastrar novo imovel</Link>
        </li>

        <li>
          <Link href="/operations/properties/list">Listar imoveis</Link>
        </li>
      </ul>

      <br />

      <p>Fluxo esperado:</p>

      <pre>profile → portfolio → portfolio_item → asset/listing</pre>

      {status && <p>{status}</p>}

      <br />

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}
