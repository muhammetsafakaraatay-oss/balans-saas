'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Members() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [balance, setBalance] = useState('')
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [balanceMemberId, setBalanceMemberId] = useState<number | null>(null)
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceNote, setBalanceNote] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadMembers()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/')
  }

  async function loadMembers() {
    const { data } = await supabase.from('uyeler').select('*').order('ad_soyad')
    setMembers(data || [])
    setLoading(false)
  }

  async function saveMember() {
    if (!name.trim()) return alert('Ad zorunlu!')
    const bal = parseFloat(balance) || 0
    if (editingId) {
      await supabase.rpc('uye_bakiye_duzelt', {
        p_uye_id: editingId,
        p_yeni_bakiye: bal,
        p_ad: name,
        p_telefon: phone,
        p_tarih: new Date().toISOString().slice(0, 10)
      })
    } else {
      const { data } = await supabase.from('uyeler').insert({ ad_soyad: name, telefon: phone, bakiye: bal, kayit_tarihi: new Date().toISOString().slice(0, 10), gym_id: (await supabase.auth.getUser()).data.user?.id }).select().single()
      if (bal !== 0 && data) {
        await supabase.from('islemler').insert({ uye_id: data.id, tur: 'yukleme', tutar: Math.abs(bal), tarih: new Date().toISOString().slice(0, 10), aciklama: 'Başlangıç bakiyesi' })
      }
    }
    setShowModal(false)
    setName(''); setPhone(''); setBalance(''); setEditingId(null)
    loadMembers()
  }

  async function saveBalance() {
    const amount = parseFloat(balanceAmount)
    if (isNaN(amount) || amount === 0) return alert('Geçerli miktar girin!')
    await supabase.rpc('bakiye_yukle', {
      p_uye_id: balanceMemberId,
      p_tutar: amount,
      p_aciklama: balanceNote || 'Bakiye yükleme',
      p_tarih: new Date().toISOString().slice(0, 10)
    })
    setShowBalanceModal(false)
    setBalanceAmount(''); setBalanceNote('')
    loadMembers()
  }

  async function deleteMember(id: number) {
    if (!confirm('Üyeyi silmek istediğinizden emin misiniz?')) return
    await supabase.from('islemler').delete().eq('uye_id', id)
    await supabase.from('uyeler').delete().eq('id', id)
    loadMembers()
  }

  function openEdit(m: any) {
    setEditingId(m.id); setName(m.ad_soyad); setPhone(m.telefon || ''); setBalance(m.bakiye); setShowModal(true)
  }

  function openBalance(id: number) {
    setBalanceMemberId(id); setShowBalanceModal(true)
  }

  const filtered = members.filter(m =>
    m.ad_soyad.toLowerCase().includes(search.toLowerCase()) ||
    (m.telefon && m.telefon.includes(search))
  )

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
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide">ÜYELER</h2>
            <p className="text-[#666] text-sm mt-1">Üye bakiye yönetimi</p>
          </div>
          <button onClick={() => { setEditingId(null); setName(''); setPhone(''); setBalance(''); setShowModal(true) }}
            className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#d6ff55] transition-all text-sm">
            + Üye Ekle
          </button>
        </div>

        <div className="mb-4">
          <input
            placeholder="İsim veya telefon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#c8f542] text-sm w-64"
          />
        </div>

        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[#666] text-xs uppercase tracking-widest border-b border-[#2a2a2a]">
                <th className="text-left p-4">Ad Soyad</th>
                <th className="text-left p-4">Telefon</th>
                <th className="text-left p-4">Bakiye</th>
                <th className="text-left p-4">Durum</th>
                <th className="text-left p-4">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                  <td className="p-4 font-medium"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0" style={{backgroundColor: `hsl(${m.ad_soyad.charCodeAt(0) * 137 % 360}, 70%, 60%)`}}>{m.ad_soyad.charAt(0).toUpperCase()}</div><span>{m.ad_soyad}</span></div></td>
                  <td className="p-4 text-[#666] text-sm">{m.telefon || '—'}</td>
                  <td className="p-4 font-mono text-sm font-bold">
                    <span className={Number(m.bakiye) >= 0 ? 'text-[#c8f542]' : 'text-red-400'}>
                      {Number(m.bakiye) >= 0 ? '+' : ''}{Number(m.bakiye).toFixed(2)}₺
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${Number(m.bakiye) < 0 ? 'bg-red-500/10 text-red-400' : 'bg-[#c8f542]/10 text-[#c8f542]'}`}>
                      {Number(m.bakiye) < 0 ? '⚠️ Ekside' : 'Aktif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/dashboard/sales?member=${m.id}`)} className="text-xs bg-[#c8f542]/10 border border-[#c8f542]/30 text-[#c8f542] px-3 py-1 rounded-lg hover:bg-[#c8f542]/20 transition-all">⚡ Satış</button>
                      <button onClick={() => router.push(`/dashboard/sales?member=${m.id}`)} className="text-xs bg-[#c8f542]/10 border border-[#c8f542]/30 text-[#c8f542] px-3 py-1 rounded-lg hover:bg-[#c8f542]/20 transition-all">⚡ Satış</button>
                      <button onClick={() => openBalance(m.id)} className="text-xs border border-[#2a2a2a] px-3 py-1 rounded-lg hover:border-[#c8f542] hover:text-[#c8f542] transition-all">+ Bakiye</button>
                      <button onClick={() => openEdit(m)} className="text-xs border border-[#2a2a2a] px-3 py-1 rounded-lg hover:border-[#c8f542] hover:text-[#c8f542] transition-all">✏️</button>
                      <button onClick={() => deleteMember(m.id)} className="text-xs border border-red-500/30 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Üye Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-[#c8f542] font-bold text-xl tracking-wide mb-6">{editingId ? 'ÜYEYİ DÜZENLE' : 'YENİ ÜYE'}</h3>
            <input placeholder="Ad Soyad *" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm" />
            <input placeholder="Telefon" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm" />
            <input placeholder="Başlangıç Bakiyesi" value={balance} onChange={e => setBalance(e.target.value)}
              disabled={!!editingId}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-6 outline-none focus:border-[#c8f542] text-sm disabled:opacity-40" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="border border-[#2a2a2a] px-4 py-2 rounded-lg text-sm hover:border-[#666] transition-all">İptal</button>
              <button onClick={saveMember} className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Bakiye Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-[#c8f542] font-bold text-xl tracking-wide mb-6">BAKİYE EKLE</h3>
            <input placeholder="Miktar (₺)" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-3 outline-none focus:border-[#c8f542] text-sm" />
            <input placeholder="Not (opsiyonel)" value={balanceNote} onChange={e => setBalanceNote(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-6 outline-none focus:border-[#c8f542] text-sm" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowBalanceModal(false)} className="border border-[#2a2a2a] px-4 py-2 rounded-lg text-sm hover:border-[#666] transition-all">İptal</button>
              <button onClick={saveBalance} className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#d6ff55] transition-all">Yükle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}