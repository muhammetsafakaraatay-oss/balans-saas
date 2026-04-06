'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SalesContent() {
  const [members, setMembers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    checkAuth()
    loadData()
    const memberId = searchParams.get('member')
    if (memberId) setSelectedMember(memberId)
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/')
  }

  async function loadData() {
    const { data: m } = await supabase.from('uyeler').select('*').order('ad_soyad')
    const { data: p } = await supabase.from('urunler').select('*').order('ad')
    setMembers(m || [])
    setProducts(p || [])
  }

  function addToCart(product: any) {
    const existing = cart.find(c => c.id === product.id)
    if (existing) {
      setCart(cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  function removeFromCart(id: number) {
    setCart(cart.filter(c => c.id !== id))
  }

  const total = cart.reduce((s, c) => s + c.fiyat * c.qty, 0)

  async function completeSale() {
    if (!selectedMember) return alert('Üye seçin!')
    if (cart.length === 0) return alert('Sepet boş!')
    setLoading(true)
    const aciklama = cart.map(c => `${c.emoji || ''}${c.ad}${c.qty > 1 ? ' x' + c.qty : ''}`).join(', ')
    const user = await supabase.auth.getUser(); await supabase.rpc('satis_yap', {
      p_uye_id: parseInt(selectedMember),
      p_tutar: total,
      p_aciklama: aciklama,
      p_tarih: new Date().toISOString().slice(0, 10)
    })
    setCart([])
    setSelectedMember('')
    setSearch('')
    setLoading(false)
    alert('Satış tamamlandı ✓')
    loadData()
  }

  const filteredMembers = members.filter(m =>
    m.ad_soyad.toLowerCase().includes(search.toLowerCase()) ||
    (m.telefon && m.telefon.includes(search))
  )

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide">SATIŞ YAP</h2>
          <p className="text-[#666] text-sm mt-1">Ürün seç → Üye seç → Tamamla</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol: Üye + Ürünler */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Üye Seç */}
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-[#666]">Üye Seç</h3>
              <input
                placeholder="İsim veya telefon ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white mb-3 outline-none focus:border-[#c8f542] text-sm"
              />
              <select
                value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#c8f542] text-sm"
              >
                <option value="">— Üye seçin —</option>
                {filteredMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.ad_soyad} ({Number(m.bakiye) >= 0 ? '+' : ''}{Number(m.bakiye).toFixed(0)}₺)
                  </option>
                ))}
              </select>
            </div>

            {/* Ürünler */}
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-[#666]">Ürünler</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map(p => (
                  <div
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#c8f542] hover:translate-y-[-2px] transition-all text-center"
                  >
                    <div className="text-3xl mb-2">{p.emoji || '🛒'}</div>
                    <div className="font-semibold text-sm mb-1">{p.ad}</div>
                    <div className="text-[#c8f542] font-mono text-sm">₺{p.fiyat}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ: Sepet */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 h-fit sticky top-8">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-[#666]">🛒 Sepet</h3>
            {cart.length === 0 ? (
              <p className="text-[#666] text-sm text-center py-8">Sepet boş</p>
            ) : (
              <>
                {cart.map(c => (
                  <div key={c.id} className="flex justify-between items-center py-2 border-b border-[#2a2a2a]">
                    <span className="text-sm">{c.emoji} {c.ad} x{c.qty}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">₺{(c.fiyat * c.qty).toFixed(0)}</span>
                      <button onClick={() => removeFromCart(c.id)} className="text-[#666] hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-4 pt-2">
                  <span>Toplam</span>
                  <span className="text-[#c8f542] font-mono">₺{total.toFixed(0)}</span>
                </div>
              </>
            )}
            <button
              onClick={completeSale}
              disabled={loading || cart.length === 0 || !selectedMember}
              className="w-full bg-[#c8f542] text-black font-bold py-3 rounded-lg mt-4 hover:bg-[#d6ff55] transition-all disabled:opacity-40 text-sm"
            >
              {loading ? 'İşleniyor...' : '✓ Satışı Tamamla'}
            </button>
            <button
              onClick={() => setCart([])}
              className="w-full border border-[#2a2a2a] text-[#666] py-2 rounded-lg mt-2 hover:border-[#666] transition-all text-sm"
            >
              Sepeti Temizle
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
export default function Sales() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><div className="text-[#c8f542]">Yükleniyor...</div></div>}>
      <SalesContent />
    </Suspense>
  )
}
