'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function StatementPage() {
  const router = useRouter()

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        router.push('/login')
        return
      }

      const user = sessionData.session.user

      const { data } = await supabase.rpc('get_user_statement', {
        p_user_id: user.id
      })

      setData(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p>Carregando...</p>

  return (
    <div style={{ padding: 40 }}>
      <h1>Extrato de Créditos (30 dias)</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Origem</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{new Date(item.created_at).toLocaleString()}</td>
              <td>{item.type}</td>
              <td>{item.type === 'debit' ? '-' : '+'}{item.amount}</td>
              <td>{item.origin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}