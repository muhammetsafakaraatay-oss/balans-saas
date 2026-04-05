'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function doLogin() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-posta veya şifre hatalı!')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-sm">
        <h1 className="text-[#c8f542] font-bold text-4xl text-center mb-2 tracking-widest">
          BALANS
        </h1>
        <p className="text-[#666] text-sm text-center mb-8">
          Üye & Bakiye Yönetimi
        </p>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doLogin()}
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542]"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doLogin()}
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-4 outline-none focus:border-[#c8f542]"
        />
        {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
        <button
          onClick={doLogin}
          disabled={loading}
          className="w-full bg-[#c8f542] text-black font-bold py-3 rounded-lg hover:bg-[#d6ff55] transition-all disabled:opacity-50"
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
        <p className="text-[#666] text-xs text-center mt-6">
          Hesabın yok mu?{' '}
          <span onClick={() => router.push('/register')} className="text-[#c8f542] cursor-pointer hover:underline">
            Ücretsiz başla
          </span>
        </p>
      </div>
    </div>
  )
}