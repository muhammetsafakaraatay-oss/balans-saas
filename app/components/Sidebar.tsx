'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  async function doLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const items = [
    { label: 'Panel', icon: '📊', href: '/dashboard' },
    { label: 'Üyeler', icon: '👥', href: '/dashboard/members' },
    { label: 'Satış Yap', icon: '🛒', href: '/dashboard/sales' },
    { label: 'Ürünler', icon: '🥤', href: '/dashboard/products' },
    { label: 'Raporlar', icon: '📈', href: '/dashboard/reports' },
  ]

  return (
    <aside className="w-56 min-h-screen bg-[#161616] border-r border-[#2a2a2a] flex flex-col">
      <div className="px-6 py-6 border-b border-[#2a2a2a]">
        <div className="text-[#c8f542] font-bold text-2xl tracking-widest">BALANS</div>
        <div className="text-[#666] text-xs mt-1">Yönetim Paneli</div>
      </div>
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
      <div className="px-6 py-4 border-t border-[#2a2a2a]">
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