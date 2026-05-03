'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleLogin = async () => {
    setStatus('Processando...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setStatus(error.message)
      return
    }

    // 🔹 espera sessão estabilizar
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 🔹 pega tipo
    const { data: type, error: typeError } = await supabase.rpc('get_user_type')

    console.log('TIPO USUARIO:', type)

    if (typeError) {
      setStatus('Erro ao identificar perfil')
      return
    }

    if (type === 'owner') {
      router.push('/owner')
    } else if (type === 'agency') {
      router.push('/agency')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Entrar
      </button>

      <p>{status}</p>
    </div>
  )
}