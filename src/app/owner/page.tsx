'use client'

/*
=========================================
HURBY — OWNER AREA
LOCAL:
src/app/owner/page.tsx

STATUS:
OWNER_STABILIZED

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function OwnerPage() {
  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState<any>(null)

  const [users, setUsers] = useState<any[]>(
    []
  )

  const [selectedUser, setSelectedUser] =
    useState('')

  const [amount, setAmount] =
    useState(0)

  const [status, setStatus] =
    useState('')

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setStatus('')

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        )

        // -------------------------------------
        // AUTH
        // -------------------------------------

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser()

        let authUser = currentUser

        if (userError || !currentUser) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          )

          const retry =
            await supabase.auth.getUser()

          authUser = retry.data.user

          if (!authUser) {
            window.location.href = '/login'
            return
          }
        }

        // -------------------------------------
        // PROFILE
        // -------------------------------------

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from('users_profile')
          .select('user_type')
          .eq('id', authUser!.id)
          .maybeSingle()

        if (profileError) {
          console.error(
            'OWNER PROFILE ERROR:',
            profileError
          )

          setStatus(
            'Erro ao carregar perfil.'
          )

          setLoading(false)

          return
        }

        // -------------------------------------
        // ROLE PROTECTION
        // -------------------------------------

        if (
          !profile ||
          profile.user_type !== 'owner'
        ) {
          window.location.href = '/login'
          return
        }

        // -------------------------------------
        // USER
        // -------------------------------------

        if (!mounted) return

        setUser(authUser)

        // -------------------------------------
        // USERS
        // -------------------------------------

        const {
          data,
          error: usersError,
        } = await supabase
          .from('users_profile')
          .select('id, name')
          .order('name', {
            ascending: true,
          })

        if (usersError) {
          console.error(
            'OWNER USERS ERROR:',
            usersError
          )

          setStatus(
            'Erro ao carregar usuários.'
          )
        }

        if (mounted && data) {
          setUsers(data)
        }

        if (!mounted) return

        setLoading(false)
      } catch (error) {
        console.error(
          'OWNER INIT ERROR:',
          error
        )

        setStatus(
          'Erro interno owner.'
        )

        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  // -------------------------------------
  // ADD CREDIT
  // -------------------------------------

  const handleAddCredit = async () => {
    if (!selectedUser || amount <= 0) {
      setStatus(
        'Informe usuário e valor válido.'
      )

      return
    }

    try {
      setStatus(
        'Processando crédito...'
      )

      const { error } = await supabase.rpc(
        'credit_credits',
        {
          p_user_id: selectedUser,
          p_amount: amount,
          p_reason: 'admin_bonus',
        }
      )

      if (error) {
        console.error(
          'OWNER CREDIT ERROR:',
          JSON.stringify(
            error,
            null,
            2
          )
        )

        setStatus(
          error?.message ||
            'Erro ao adicionar crédito.'
        )

        return
      }

      setStatus('Crédito adicionado')
    } catch (error) {
      console.error(
        'OWNER CREDIT FAILURE:',
        error
      )

      setStatus(
        'Erro ao adicionar crédito.'
      )
    }
  }

  // -------------------------------------
  // LOGOUT
  // -------------------------------------

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error(
        'OWNER LOGOUT ERROR:',
        error
      )
    }

    window.location.href = '/login'
  }

  // -------------------------------------
  // LOADING
  // -------------------------------------

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p>Carregando...</p>
      </div>
    )
  }

  // -------------------------------------
  // PAGE
  // -------------------------------------

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Owner</h1>

      <p>
        <strong>Usuário:</strong>{' '}
        {user?.email}
      </p>

      <br />

      <h3>Adicionar Crédito</h3>

      <select
        value={selectedUser}
        onChange={(e) =>
          setSelectedUser(e.target.value)
        }
      >
        <option value="">
          Selecione usuário
        </option>

        {users.map((u) => (
          <option
            key={u.id}
            value={u.id}
          >
            {u.name} ({u.id})
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="number"
        placeholder="Quantidade"
        value={amount}
        onChange={(e) =>
          setAmount(Number(e.target.value))
        }
      />

      <br />
      <br />

      <button onClick={handleAddCredit}>
        Adicionar Crédito
      </button>

      <br />
      <br />

      {status && (
        <p style={{ color: '#666' }}>
          {status}
        </p>
      )}

      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}