'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AgencyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const checkAccess = async () => {
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      router.push('/login')
      return
    }

    const { data: type } = await supabase.rpc('get_user_type')

    if (type !== 'agency') {
      router.push('/login')
      return
    }
  }

  useEffect(() => {
    const init = async () => {
      await checkAccess()
      setLoading(false)
    }

    init()
  }, [])

  if (loading) return <p>Carregando...</p>

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard - Imobiliária</h1>

      <p>Área da imobiliária (em construção)</p>
    </div>
  )
}