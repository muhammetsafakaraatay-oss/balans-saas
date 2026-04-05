'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

export default function Reports() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadData()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/')
  }

  async function loadData() {
    const { data: t } = await supabase.from('islemler').select('*').order('id', { ascending: false })
    const { data: m } = await supabase.from('uyeler').select('*')
    setTransactions(t || [])
    setMembers(m || [])
    setLoading(false)
  }

  async function cancelTransaction(t: any) {
    const m = members.find(x => x.id === t.uye_id)
    if (!m) return alert('Üye bulunamadı!')
    if (!confirm(`${m.ad_soyad} için ${t.tutar}₺ tutarındaki satış iptal edilsin mi?`)) return
    await supabase.rpc('satis_iptal', {
      p_islem_id: t.id,
      p_uye_id: t.uye_id,
      p_tutar: Number(t.tutar),
      p_aciklama: `İptal edildi — ${t.aciklama || ''}`
    })
    loadData()
  }

  function exportCSV() {
    const txs = transactions.filter(t => String(t.tarih).slice(0, 7) === month)
    const rows = [['Üye', 'Tür', 'Tutar', 'Tarih', 'Not']]
    txs.forEach(t => {
      const m = members.find(x => x.id === t.uye_id)
      rows.push([m ? m.ad_soyad : '?', t.tur, t.tutar, t.tarih, t.aciklama || ''])
    })
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csv)
    a.download = `balans-${month}.csv`
    a.click()
  }

  const filtered = transactions.filter(t => String(t.tarih).slice(0, 7) === month)
  const totalSales = filtered.filter(t => t.tur === 'satis').reduce((s, t) => s + Number(t.tutar), 0)
  const totalLoads = filtered.filter(t => t.tur === 'yukleme').reduce((s, t) => s + Number(t.tutar), 0)
  const totalCancels = filtered.filter(t => t.tur === 'iptal').reduce((s, t) => s + Number(t.tutar), 0)

  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toISOString().slice(0, 7)
  })

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-[#c8f542]">Yükleniyor...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#c8f542] tracking-wide">RAPORLAR</h2>
            <p className="text-[#666] text-sm mt-1">Aylık satış ve üye özeti</p>
          </div>
          <div className="flex gap-3">
            <select value={month} onChange={e => setMonth(e.target.value)}
              className="bg-[#161616] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#c8f542] text-sm">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button onClick={exportCSV}
              className="bg-[#161616] border border-[#2a2a2a] px-4 py-2 rounded-lg text-sm hover:border-[#c8f542] hover:text-[#c8f542] transition-all">
              CSV İndir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Toplam Satış</div>
            <div className="text-3xl font-bold text-orange-400">₺{totalSales.toFixed(0)}</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">Yüklenen Bakiye</div>
            <div className="text-3xl font-bold text-[#c8f542]">₺{totalLoads.toFixed(0)}</div>
          </div>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-2">İptal Edilen</div>
            <div className="text-3xl font-bold text-red-400">₺{totalCancels.toFixed(0)}</div>
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#2a2a2a]">
            <h3 className="font-semibold">Tüm İşlemler</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[#666] text-xs uppercase tracking-widest border-b border-[#2a2a2a]">
                <th className="text-left p-4">Üye</th>
                <th className="text-left p-4">Tür</th>
                <th className="text-left p-4">Tutar</th>
                <th className="text-left p-4">Tarih</th>
                <th className="text-left p-4">Not</th>
                <th className="text-left p-4">İptal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const m = members.find(x => x.id === t.uye_id)
                const neg = t.tur === 'satis'
                return (
                  <tr key={t.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                    <td className="p-4 text-sm">{m ? m.ad_soyad : '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        t.tur === 'satis' ? 'bg-red-500/10 text-red-400' :
                        t.tur === 'yukleme' ? 'bg-[#c8f542]/10 text-[#c8f542]' :
                        t.tur === 'iptal' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>{t.tur}</span>
                    </td>
                    <td className="p-4 font-mono text-sm">
                      <span className={neg ? 'text-red-400' : 'text-[#c8f542]'}>
                        {neg ? '-' : '+'}₺{t.tutar}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[#666]">{t.tarih}</td>
                    <td className="p-4 text-sm text-[#666]">{t.aciklama || '—'}</td>
                    <td className="p-4">
                      {t.tur === 'satis' ? (
                        <button onClick={() => cancelTransaction(t)}
                          className="text-xs border border-red-500/30 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/10 transition-all">
                          İptal
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}