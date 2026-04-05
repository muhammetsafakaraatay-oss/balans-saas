'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [members, setMembers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [gym, setGym] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    loadData(session.user.id)
  }

  async function loadData(userId: string) {
    const { data: m } = await supabase.from('uyeler').select('*')
    const { data: t } = await supabase
      .from('islemler')
      .select('*, uyeler(ad_soyad)')
      .order('id', { ascending: false })
      .limit(10)
    const { data: g } = await supabase.from('gyms').select('*').eq('user_id', userId).single()
    const { data: p } = await supabase.from('urunler').select('*')
    setProducts(p || [])
    setMembers(m || [])
    setTransactions(t || [])
    setGym(g)
    setLoading(false)
  }

  async function handleUpgrade() {
    setUpgrading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/paddle/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email, userId: session.user.id })
    })
    const { checkoutUrl } = await res.json()
    if (checkoutUrl) window.location.href = checkoutUrl
    else { alert('Ödeme sayfası açılamadı.'); setUpgrading(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-[#c8f542]">Yükleniyor...</div>
    </div>
  )

  const totalBalance = members.reduce((s, m: any) => s + Number(m.bakiye), 0)
  const negCount = members.filter((m: any) => Number(m.bakiye) < 0).length

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide">PANEL</h2>
          <p className="text-[#666] text-sm mt-1">Genel bakış</p>
        </div>

        {members.length === 0 && products.length === 0 && (
          <div className="bg-[#161616] border border-[#c8f542]/30 rounded-xl p-6 mb-6">
            <h3 className="text-[#c8f542] font-bold mb-1">Hoş geldiniz! 👋</h3>
            <p className="text-[#666] text-sm mb-4">Başlamak için 3 adımı tamamlayın</p>
            <div className="flex gap-4">
              <div onClick={() => router.push('/dashboard/products')} className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#c8f542] transition-all">
                <div className="text-2xl mb-2">🥤</div>
                <div className="text-sm font-bold mb-1">Ürün Ekle</div>
                <div className="text-xs text-[#666]">Satacağınız ürünleri tanımlayın</div>
              </div>
              <div onClick={() => router.push('/dashboard/members')} className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#c8f542] transition-all">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-bold mb-1">Üye Ekle</div>
                <div className="text-xs text-[#666]">İlk üyenizi kaydedin</div>
              </div>
              <div onClick={() => router.push('/dashboard/sales')} className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#c8f542] transition-all">
                <div className="text-2xl mb-2">🛒</div>
                <div className="text-sm font-bold mb-1">Satış Yap</div>
                <div className="text-xs text-[#666]">İlk satışınızı gerçekleştirin</div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Toplam Üye</div>
            <div className="text-3xl font-bold text-white">{members.length}</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Ekside Olan</div>
            <div className="text-3xl font-bold text-red-400">{negCount}</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Toplam Bakiye</div>
            <div className="text-3xl font-bold text-[#c8f542]">₺{totalBalance.toFixed(0)}</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Son İşlemler</div>
            <div className="text-3xl font-bold text-white">{transactions.length}</div>
          </div>
        </div>

        {gym?.plan === 'free' && (
          <div className="bg-[#161616] border border-orange-500/30 rounded-xl p-5 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium mb-1 text-orange-400">Ücretsiz Plan</p>
              <p className="text-[#666] text-xs">₺500/ay ile tüm özelliklere erişin.</p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all disabled:opacity-50">
              {upgrading ? 'Yönlendiriliyor...' : 'Planı Yükselt'}
            </button>
          </div>
        )}

        {gym?.slug && (
          <div className="bg-[#161616] border border-[#c8f542]/30 rounded-xl p-5 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium mb-1">Üye Paneli Linki</p>
              <p className="text-[#666] text-xs font-mono">balans-eta.vercel.app/uye/{gym.slug}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`https://balans-eta.vercel.app/uye/${gym.slug}`)}
              className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all">
              Kopyala
            </button>
          </div>
        )}

                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4">Bu Ay Günlük Satışlar</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={(() => {
              const days: Record<string, number> = {}
              transactions.filter(t => t.tur === 'satis').forEach(t => {
                const gun = t.tarih?.slice(0, 10) || ''
                days[gun] = (days[gun] || 0) + Number(t.tutar)
              })
              return Object.entries(days).sort().map(([tarih, tutar]) => ({
                tarih: new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                tutar
              }))
            })()}>
              <XAxis dataKey="tarih" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="tutar" stroke="#c8f542" fill="#c8f542" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#2a2a2a]">
            <h3 className="font-semibold">Son İşlemler</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[#666] text-xs uppercase tracking-widest">
                <th className="text-left p-4">Üye</th>
                <th className="text-left p-4">Tür</th>
                <th className="text-left p-4">Tutar</th>
                <th className="text-left p-4">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr key={t.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                  <td className="p-4 text-sm">{t.uyeler?.ad_soyad || '—'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      t.tur === 'satis' ? 'bg-red-500/10 text-red-400' :
                      t.tur === 'yukleme' ? 'bg-[#c8f542]/10 text-[#c8f542]' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {t.tur === 'yukleme' ? 'Yükleme' : t.tur === 'satis' ? 'Satış' : t.tur === 'iptal' ? 'İptal' : t.tur}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-mono">₺{t.tutar}</td>
                  <td className="p-4 text-sm text-[#666]">{new Date(t.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
