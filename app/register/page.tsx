'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function doRegister() {
    setError('')
    if (!businessName.trim()) { setError('İşletme adı zorunlu!'); return }
    if (!email.trim()) { setError('E-posta zorunlu!'); return }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı!'); return }
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
      const slug = businessName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-' + Math.random().toString(36).slice(2, 6)
      await supabase.from('gyms').insert({
        user_id: data.user.id,
        ad: businessName,
        email: email,
        plan: 'free',
        slug: slug,
        olusturma_tarihi: new Date().toISOString().slice(0, 10)
      })
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
          Ücretsiz hesap oluştur
        </p>
        <input
          placeholder="İşletme Adı *"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm"
        />
        <input
          type="email"
          placeholder="E-posta *"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm"
        />
        <input
          type="password"
          placeholder="Şifre * (min 6 karakter)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doRegister()}
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-4 outline-none focus:border-[#c8f542] text-sm"
        />
        {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
        <button
          onClick={doRegister}
          disabled={loading}
          className="w-full bg-[#c8f542] text-black font-bold py-3 rounded-lg hover:bg-[#d6ff55] transition-all disabled:opacity-50 text-sm"
        >
          {loading ? 'Hesap oluşturuluyor...' : 'Ücretsiz Başla'}
        </button>
        <p className="text-[#666] text-xs text-center mt-6">
          Zaten hesabın var mı?{' '}
          <span onClick={() => router.push('/login')} className="text-[#c8f542] cursor-pointer hover:underline">
            Giriş Yap
          </span>
        </p>
      </div>
    </div>
  )
}