'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const run = async () => {
      // limpa sessão
      await supabase.auth.signOut()

      // LOGIN
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: 'test2@hurby.com',
          password: '123456',
        })

      if (loginError || !loginData?.session) {
        setResult({ loginError })
        return
      }

      // 🔴 FORÇA A SESSÃO NO CLIENTE
      await supabase.auth.setSession(loginData.session)

      // 🔴 AGUARDA PROPAGAÇÃO DO TOKEN
      await new Promise((r) => setTimeout(r, 500))

      // 🔴 AGORA SIM: RPC
      const { error: creditError } = await supabase.rpc('add_credit', {
        p_amount: 10,
        p_origin: 'rpc_test',
      })

      const { data } = await supabase
        .from('user_wallet_balances')
        .select('*')

      setResult({
        creditError,
        data,
      })
    }

    run()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>RPC Final Test</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}