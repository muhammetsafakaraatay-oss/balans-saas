'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [emoji, setEmoji] = useState('')
  const [category, setCategory] = useState('İçecek')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadProducts()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/')
  }

  async function loadProducts() {
    const { data } = await supabase.from('urunler').select('*').order('ad')
    setProducts(data || [])
    setLoading(false)
  }

  async function saveProduct() {
    if (!name.trim() || !price) return alert('Ad ve fiyat zorunlu!')
    const data = { ad: name, fiyat: parseFloat(price), emoji: emoji || '🛒', kategori: category }
    if (editingId) {
      await supabase.from('urunler').update(data).eq('id', editingId)
    } else {
      const user = await supabase.auth.getUser(); await supabase.from('urunler').insert({...data, gym_id: user.data.user?.id})
    }
    setShowModal(false)
    setName(''); setPrice(''); setEmoji(''); setCategory('İçecek'); setEditingId(null)
    loadProducts()
  }

  async function deleteProduct(id: number) {
    if (!confirm('Ürünü silmek istediğinizden emin misiniz?')) return
    await supabase.from('urunler').delete().eq('id', id)
    loadProducts()
  }

  function openEdit(p: any) {
    setEditingId(p.id); setName(p.ad); setPrice(p.fiyat); setEmoji(p.emoji || ''); setCategory(p.kategori || 'İçecek'); setShowModal(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-[#c8f542]">Yükleniyor...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide">ÜRÜNLER</h2>
            <p className="text-[#666] text-sm mt-1">Menü yönetimi</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setName(''); setPrice(''); setEmoji(''); setCategory('İçecek'); setShowModal(true) }}
            className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#d6ff55] transition-all text-sm"
          >
            + Ürün Ekle
          </button>
        </div>

        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[#666] text-xs uppercase tracking-widest border-b border-[#2a2a2a]">
                <th className="text-left p-4">Emoji</th>
                <th className="text-left p-4">Ürün Adı</th>
                <th className="text-left p-4">Fiyat</th>
                <th className="text-left p-4">Kategori</th>
                <th className="text-left p-4">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                  <td className="p-4 text-2xl">{p.emoji || '🛒'}</td>
                  <td className="p-4 font-medium">{p.ad}</td>
                  <td className="p-4 font-mono text-[#c8f542]">₺{p.fiyat}</td>
                  <td className="p-4">
                    <span className="text-xs bg-[#c8f542]/10 text-[#c8f542] px-2 py-1 rounded-full">{p.kategori || '—'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs border border-[#2a2a2a] px-3 py-1 rounded-lg hover:border-[#c8f542] hover:text-[#c8f542] transition-all">✏️</button>
                      <button onClick={() => deleteProduct(p.id)} className="text-xs border border-red-500/30 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-[#c8f542] font-bold text-xl tracking-wide mb-6">{editingId ? 'ÜRÜNÜ DÜZENLE' : 'YENİ ÜRÜN'}</h3>
            <input placeholder="Emoji" value={emoji} onChange={e => setEmoji(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm" />
            <input placeholder="Ürün Adı *" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm" />
            <input placeholder="Fiyat (₺) *" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm" />
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-6 outline-none focus:border-[#c8f542] text-sm">
              <option>İçecek</option>
              <option>Yiyecek</option>
              <option>Supplement</option>
              <option>Diğer</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="border border-[#2a2a2a] px-4 py-2 rounded-lg text-sm hover:border-[#666] transition-all">İptal</button>
              <button onClick={saveProduct} className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}