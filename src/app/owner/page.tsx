'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function OwnerPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState(5)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data: type } = await supabase.rpc('get_user_type')

      if (type !== 'owner') {
        router.push('/dashboard')
        return
      }

      setAllowed(true)
      setLoading(false)
    }

    init()
  }, [])

  const handleAddCredit = async () => {
    const { error } = await supabase.rpc('admin_add_credit', {
      p_user_id: userId,
      p_amount: amount,
      p_origin: 'admin_bonus'
    })

    if (error) {
      setStatus(error.message)
    } else {
      setStatus('Crédito adicionado')
    }
  }

  if (loading) return <p>Carregando...</p>
  if (!allowed) return null

  return (
    <div style={{ padding: 40 }}>
      <h1>Owner</h1>

      <input
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <button onClick={handleAddCredit}>
        Adicionar crédito
      </button>

      <p>{status}</p>
    </div>
  )
}