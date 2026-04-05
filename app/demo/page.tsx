'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'

const DEMO_MEMBERS = [
  { id: 1, ad_soyad: 'Ahmet Yılmaz', telefon: '0532 111 22 33', bakiye: 450 },
  { id: 2, ad_soyad: 'Ayşe Kaya', telefon: '0533 222 33 44', bakiye: -50 },
  { id: 3, ad_soyad: 'Mehmet Demir', telefon: '0534 333 44 55', bakiye: 200 },
  { id: 4, ad_soyad: 'Fatma Çelik', telefon: '0535 444 55 66', bakiye: 750 },
  { id: 5, ad_soyad: 'Ali Şahin', telefon: '0536 555 66 77', bakiye: 0 },
]

const DEMO_PRODUCTS = [
  { id: 1, emoji: '☕', ad: 'Kahve', fiyat: 30, kategori: 'İçecek' },
  { id: 2, emoji: '🥤', ad: 'Smoothie', fiyat: 50, kategori: 'İçecek' },
  { id: 3, emoji: '🍌', ad: 'Muz', fiyat: 15, kategori: 'Yiyecek' },
  { id: 4, emoji: '💊', ad: 'Protein', fiyat: 120, kategori: 'Supplement' },
]

const DEMO_TRANSACTIONS = [
  { id: 1, uye_id: 1, tur: 'yukleme', tutar: 500, tarih: '2026-04-01', aciklama: 'Bakiye yükleme' },
  { id: 2, uye_id: 1, tur: 'satis', tutar: 50, tarih: '2026-04-01', aciklama: '☕Kahve x2' },
  { id: 3, uye_id: 2, tur: 'yukleme', tutar: 200, tarih: '2026-03-28', aciklama: 'Bakiye yükleme' },
  { id: 4, uye_id: 2, tur: 'satis', tutar: 250, tarih: '2026-03-30', aciklama: '💊Protein x2' },
  { id: 5, uye_id: 3, tur: 'yukleme', tutar: 300, tarih: '2026-04-02', aciklama: 'Bakiye yükleme' },
  { id: 6, uye_id: 3, tur: 'satis', tutar: 100, tarih: '2026-04-02', aciklama: '🥤Smoothie x2' },
]

export default function Demo() {
  const [page, setPage] = useState('dashboard')
  const [members, setMembers] = useState(DEMO_MEMBERS)
  const [transactions, setTransactions] = useState(DEMO_TRANSACTIONS)
  const [cart, setCart] = useState<any[]>([])
  const [selectedMember, setSelectedMember] = useState('')
  const router = useRouter()

  const totalBalance = members.reduce((s, m) => s + m.bakiye, 0)
  const negCount = members.filter(m => m.bakiye < 0).length

  function addToCart(p: any) {
    const ex = cart.find(c => c.id === p.id)
    if (ex) setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c))
    else setCart([...cart, { ...p, qty: 1 }])
  }

  function completeSale() {
    if (!selectedMember || cart.length === 0) return
    const memberId = parseInt(selectedMember)
    const total = cart.reduce((s, c) => s + c.fiyat * c.qty, 0)
    const aciklama = cart.map(c => `${c.emoji}${c.ad}${c.qty > 1 ? ' x' + c.qty : ''}`).join(', ')
    setMembers(members.map(m => m.id === memberId ? { ...m, bakiye: m.bakiye - total } : m))
    setTransactions([{ id: Date.now(), uye_id: memberId, tur: 'satis', tutar: total, tarih: '2026-04-02', aciklama }, ...transactions])
    setCart([])
    setSelectedMember('')
    alert(`Satış tamamlandı ✓ — ₺${total}`)
  }

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Panel' },
    { id: 'members', icon: '👥', label: 'Üyeler' },
    { id: 'sales', icon: '🛒', label: 'Satış Yap' },
    { id: 'products', icon: '🥤', label: 'Ürünler' },
    { id: 'reports', icon: '📈', label: 'Raporlar' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-[#161616] border-r border-[#2a2a2a] flex flex-col">
        <div className="px-6 py-6 border-b border-[#2a2a2a]">
          <div className="text-[#c8f542] font-bold text-2xl tracking-widest">BALANS</div>
          <div className="text-orange-400 text-xs mt-1">🎯 Demo Modu</div>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <div key={item.id} onClick={() => setPage(item.id)}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer text-sm font-medium transition-all border-l-2 ${
                page === item.id ? 'text-[#c8f542] border-[#c8f542] bg-[#c8f542]/5' : 'text-[#666] border-transparent hover:text-white hover:bg-[#1e1e1e]'
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-[#2a2a2a]">
          <button onClick={() => router.push('/register')}
            className="w-full bg-[#c8f542] text-black font-bold py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all">
            Gerçek Hesap Aç
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* DEMO BANNER */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <span className="text-orange-400 font-bold text-sm">🎯 Demo Modu</span>
            <span className="text-[#666] text-sm ml-3">Gerçek veri yok, özgürce dene!</span>
          </div>
          <button onClick={() => router.push('/register')} className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all">
            Ücretsiz Başla →
          </button>
        </div>

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide mb-2">PANEL</h2>
            <p className="text-[#666] text-sm mb-8">Genel bakış</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Toplam Üye</div>
                <div className="text-3xl font-bold">{members.length}</div>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Ekside Olan</div>
                <div className="text-3xl font-bold text-red-400">{negCount}</div>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Toplam Bakiye</div>
                <div className="text-3xl font-bold text-[#c8f542]">₺{totalBalance}</div>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">İşlem Sayısı</div>
                <div className="text-3xl font-bold">{transactions.length}</div>
              </div>
            </div>
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="p-5 border-b border-[#2a2a2a]"><h3 className="font-semibold">Son İşlemler</h3></div>
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
                  {transactions.slice(0, 5).map(t => {
                    const m = members.find(x => x.id === t.uye_id)
                    return (
                      <tr key={t.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                        <td className="p-4 text-sm">{m?.ad_soyad || '—'}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${t.tur === 'satis' ? 'bg-red-500/10 text-red-400' : 'bg-[#c8f542]/10 text-[#c8f542]'}`}>{t.tur}</span>
                        </td>
                        <td className="p-4 text-sm font-mono">₺{t.tutar}</td>
                        <td className="p-4 text-sm text-[#666]">{t.tarih}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MEMBERS */}
        {page === 'members' && (
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide mb-2">ÜYELER</h2>
            <p className="text-[#666] text-sm mb-8">Üye bakiye yönetimi</p>
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[#666] text-xs uppercase tracking-widest border-b border-[#2a2a2a]">
                    <th className="text-left p-4">Ad Soyad</th>
                    <th className="text-left p-4">Telefon</th>
                    <th className="text-left p-4">Bakiye</th>
                    <th className="text-left p-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                      <td className="p-4 font-medium">{m.ad_soyad}</td>
                      <td className="p-4 text-[#666] text-sm">{m.telefon}</td>
                      <td className="p-4 font-mono text-sm font-bold">
                        <span className={m.bakiye >= 0 ? 'text-[#c8f542]' : 'text-red-400'}>
                          {m.bakiye >= 0 ? '+' : ''}{m.bakiye}₺
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${m.bakiye < 0 ? 'bg-red-500/10 text-red-400' : 'bg-[#c8f542]/10 text-[#c8f542]'}`}>
                          {m.bakiye < 0 ? '⚠️ Ekside' : 'Aktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SALES */}
        {page === 'sales' && (
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide mb-2">SATIŞ YAP</h2>
            <p className="text-[#666] text-sm mb-8">Ürün seç → Üye seç → Tamamla</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-[#666]">Üye Seç</h3>
                  <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white outline-none text-sm">
                    <option value="">— Üye seçin —</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.ad_soyad} ({m.bakiye >= 0 ? '+' : ''}{m.bakiye}₺)</option>
                    ))}
                  </select>
                </div>
                <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-[#666]">Ürünler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DEMO_PRODUCTS.map(p => (
                      <div key={p.id} onClick={() => addToCart(p)}
                        className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#c8f542] transition-all text-center">
                        <div className="text-3xl mb-2">{p.emoji}</div>
                        <div className="font-semibold text-sm mb-1">{p.ad}</div>
                        <div className="text-[#c8f542] font-mono text-sm">₺{p.fiyat}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 h-fit">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-[#666]">🛒 Sepet</h3>
                {cart.length === 0 ? <p className="text-[#666] text-sm text-center py-8">Sepet boş</p> : (
                  <>
                    {cart.map(c => (
                      <div key={c.id} className="flex justify-between items-center py-2 border-b border-[#2a2a2a] text-sm">
                        <span>{c.emoji} {c.ad} x{c.qty}</span>
                        <span className="font-mono">₺{c.fiyat * c.qty}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-4 pt-2">
                      <span>Toplam</span>
                      <span className="text-[#c8f542] font-mono">₺{cart.reduce((s, c) => s + c.fiyat * c.qty, 0)}</span>
                    </div>
                  </>
                )}
                <button onClick={completeSale} disabled={cart.length === 0 || !selectedMember}
                  className="w-full bg-[#c8f542] text-black font-bold py-3 rounded-lg mt-4 hover:bg-[#d6ff55] transition-all disabled:opacity-40 text-sm">
                  ✓ Satışı Tamamla
                </button>
                <button onClick={() => setCart([])}
                  className="w-full border border-[#2a2a2a] text-[#666] py-2 rounded-lg mt-2 text-sm">
                  Sepeti Temizle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {page === 'products' && (
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide mb-2">ÜRÜNLER</h2>
            <p className="text-[#666] text-sm mb-8">Menü yönetimi</p>
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[#666] text-xs uppercase tracking-widest border-b border-[#2a2a2a]">
                    <th className="text-left p-4">Emoji</th>
                    <th className="text-left p-4">Ürün</th>
                    <th className="text-left p-4">Fiyat</th>
                    <th className="text-left p-4">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_PRODUCTS.map(p => (
                    <tr key={p.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                      <td className="p-4 text-2xl">{p.emoji}</td>
                      <td className="p-4 font-medium">{p.ad}</td>
                      <td className="p-4 font-mono text-[#c8f542]">₺{p.fiyat}</td>
                      <td className="p-4"><span className="text-xs bg-[#c8f542]/10 text-[#c8f542] px-2 py-1 rounded-full">{p.kategori}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORTS */}
        {page === 'reports' && (
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide mb-2">RAPORLAR</h2>
            <p className="text-[#666] text-sm mb-8">Aylık özet</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Toplam Satış</div>
                <div className="text-3xl font-bold text-orange-400">₺{transactions.filter(t => t.tur === 'satis').reduce((s, t) => s + t.tutar, 0)}</div>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Yüklenen</div>
                <div className="text-3xl font-bold text-[#c8f542]">₺{transactions.filter(t => t.tur === 'yukleme').reduce((s, t) => s + t.tutar, 0)}</div>
              </div>
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
                <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Aktif Üye</div>
                <div className="text-3xl font-bold text-white">{members.filter(m => m.bakiye > 0).length}</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}