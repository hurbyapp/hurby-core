'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const [balance, setBalance] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState('')

  const inactivityTimer = useRef<any>(null)

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const resetTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)

    inactivityTimer.current = setTimeout(() => {
      alert('Sessão encerrada por inatividade')
      logout()
    }, 50 * 60 * 1000)
  }

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const user = userData.user

      const { data: type } = await supabase.rpc('get_user_type')

      if (type !== 'broker') {
        router.push('/login')
        return
      }

      setAllowed(true)

      setUserEmail(user.email || '')
      setUserId(user.id)

      const { data } = await supabase.rpc('get_user_balance', {
        p_user_id: user.id
      })

      setBalance(data || 0)
      setLoading(false)
    }

    init()

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)

    resetTimer()

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [])

  const handleUseCredit = async () => {
    setStatus('Processando...')

    const { error } = await supabase.rpc('use_credit', {
      p_amount: 1,
      p_origin: 'unlock_lead'
    })

    if (error) {
      setStatus(error.message)
    } else {
      setStatus('Lead desbloqueado')
      window.location.reload()
    }
  }

  const copyUserId = () => {
    navigator.clipboard.writeText(userId)
    setStatus('User ID copiado')
  }

  if (loading) return <p>Carregando...</p>
  if (!allowed) return null

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard - Corretor</h1>

      <p><strong>Usuário:</strong> {userEmail}</p>

      <p>
        <strong>User ID:</strong> {userId}
        <button onClick={copyUserId} style={{ marginLeft: 10 }}>
          Copiar
        </button>
      </p>

      <p><strong>Saldo:</strong> {balance}</p>

      <button onClick={handleUseCredit}>
        Desbloquear Lead (-1 crédito)
      </button>

      <button
        onClick={() => router.push('/statement')}
        style={{ marginLeft: 10 }}
      >
        Ver Extrato
      </button>

      <p style={{ marginTop: 20 }}>{status}</p>

      <button onClick={logout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  )
}