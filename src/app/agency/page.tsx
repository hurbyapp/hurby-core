'use client'

/*
=========================================
HURBY — AGENCY AREA
LOCAL:
src/app/agency/page.tsx

STATUS:
AGENCY_STABILIZED

=========================================
*/

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AgencyPage() {
  const router = useRouter()

  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState<any>(null)

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
          .eq('id', authUser.id)
          .maybeSingle()

        if (profileError) {
          console.error(
            'AGENCY PROFILE ERROR:',
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
          profile.user_type !== 'agency'
        ) {
          window.location.href = '/login'
          return
        }

        // -------------------------------------
        // USER
        // -------------------------------------

        if (!mounted) return

        setUser(authUser)

        setLoading(false)
      } catch (error) {
        console.error(
          'AGENCY INIT ERROR:',
          error
        )

        setStatus(
          'Erro interno agency.'
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
  // LOGOUT
  // -------------------------------------

  const handleLogout = async () => {
    setStatus('Saindo...')

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error(
        'AGENCY LOGOUT ERROR:',
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
      <h1>Dashboard Agência</h1>

      <p>
        <strong>Usuário:</strong>{' '}
        {user?.email}
      </p>

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