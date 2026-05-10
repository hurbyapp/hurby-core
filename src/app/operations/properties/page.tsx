'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTIES INDEX PAGE
LOCAL:
src/app/operations/properties/page.tsx
=========================================================

FOUNDATION PAGE

Esta página pertence ao núcleo operacional de imóveis
do ecossistema Hurby.

NÃO:
- misturar lógica financeira
- misturar leads
- misturar IA
- misturar assinatura
- misturar dashboards globais

ARQUITETURA OFICIAL:
- portfolio
- portfolio_item
- property_asset
- property_listing
- operational_origin
- visibility_scope

IMPORTANTE:
listing ≠ asset

=========================================================
*/

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PropertiesHomePage() {
  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    const validateAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      setLoading(false)
    }

    validateAuth()
  }, [])

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Core Imobiliário Operacional</h1>

      <p>
        Foundation operacional de imóveis do
        ecossistema Hurby.
      </p>

      <p>
        Este núcleo trabalha com carteira operacional,
        origem, ativo, anúncio e vínculo de portfolio.
      </p>

      <ul>
        <li>
          <a href="/operations/properties/new">
            Cadastrar novo imóvel
          </a>
        </li>
        <li>
          <a href="/operations/properties/list">
            Listar imóveis
          </a>
        </li>
      </ul>

      <br />

      <p>
        Fluxo esperado:
      </p>

      <pre>
        profile → portfolio → portfolio_item → asset/listing
      </pre>
    </main>
  )
}