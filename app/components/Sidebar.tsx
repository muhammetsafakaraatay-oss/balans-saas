'use client'

import { useEffect, useState } from 'react'
import { useTheme } from './ThemeProvider'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [gymName, setGymName] = useState<string | null>(null)

  useEffect(() => {
    async function gymGetir() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('gyms')
        .select('logo_url, ad')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setLogoUrl(data.logo_url || null)
        setGymName(data.ad || null)
      }
    }
    gymGetir()
  }, [])

  async function doLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const items = [
    { label: 'Panel',    icon: '📊', href: '/dashboard' },
    { label: 'Üyeler',  icon: '👥', href: '/dashboard/members' },
    { label: 'Satış Yap', icon: '🛒', href: '/dashboard/sales' },
    { label: 'Ürünler', icon: '🥤', href: '/dashboard/products' },
    { label: 'Raporlar', icon: '📈', href: '/dashboard/reports' },
    { label: 'Ayarlar', icon: '⚙️', href: '/dashboard/ayarlar' },
  ]

  return (
    <aside className="w-56 min-h-screen bg-[#161616] border-r border-[#2a2a2a] flex flex-col">
      {/* Logo / İşletme Adı */}
      <div className="px-6 py-6 border-b border-[#2a2a2a]">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div className="text-[#c8f542] font-bold text-2xl tracking-widest">
            {gymName || 'BALANS'}
          </div>
        )}
        <div className="text-[#666] text-xs mt-1">{gymName || "Yönetim Paneli"}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {items.map(item => (
          <div
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`flex items-center gap-3 px-6 py-3 cursor-pointer text-sm font-medium transition-all border-l-2 ${
              pathname === item.href
                ? 'text-[#c8f542] border-[#c8f542] bg-[#c8f542]/5'
                : 'text-[#666] border-transparent hover:text-white hover:bg-[#1e1e1e]'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Çıkış */}
      <div className="px-6 py-4 border-t border-[#2a2a2a]">
        <button
          onClick={toggle}
          className="w-full text-left text-sm text-[#666] hover:text-white transition-all flex items-center gap-3 mb-3"
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}</span>
        </button>
        <button
          onClick={doLogout}
          className="w-full text-left text-sm text-[#666] hover:text-red-400 transition-all flex items-center gap-3"
        >
          <span>🚪</span>
          <span>Çıkış</span>
        </button>
      </div>
    </aside>
  )
}