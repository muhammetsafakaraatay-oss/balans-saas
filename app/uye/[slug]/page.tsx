'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function UyePanel({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState<'login' | 'panel'>('login')
  const [phone, setPhone] = useState('')
  const [member, setMember] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [gym, setGym] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadGym()
  }, [])

  async function loadGym() {
    const { data } = await supabase.from('gyms').select('*').eq('slug', params.slug).single()
    setGym(data)
  }

  async function doLogin() {
    setError('')
    if (phone.length < 10) { setError('Geçerli telefon numarası girin!'); return }
    setLoading(true)
    const raw = phone.replace(/\D/g, '')
    const { data } = await supabase
      .from('uyeler')
      .select('*')
      .eq('gym_id', gym?.user_id)
      .ilike('telefon', `%${raw.slice(-10)}%`)
      .single()

    if (!data) { setError('Bu numaraya kayıtlı üye bulunamadı!'); setLoading(false); return }

    const { data: txs } = await supabase
      .from('islemler')
      .select('*')
      .eq('uye_id', data.id)
      .order('id', { ascending: false })
      .limit(20)

    setMember(data)
    setTransactions(txs || [])
    setStep('panel')
    setLoading(false)
  }

  if (!gym) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-[#666]">Yükleniyor...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6">
      {step === 'login' && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-10 w-full max-w-sm">
          <h1 className="text-[#c8f542] font-bold text-3xl text-center mb-2 tracking-widest">
            {gym.ad}
          </h1>
          <p className="text-[#666] text-sm text-center mb-8">Bakiyeni görüntüle</p>
          <input
            type="tel"
            placeholder="Telefon numaranı gir"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white mb-4 outline-none focus:border-[#c8f542] text-center text-lg tracking-widest"
          />
          {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
          <button onClick={doLogin} disabled={loading}
            className="w-full bg-[#c8f542] text-black font-bold py-3 rounded-lg hover:bg-[#d6ff55] transition-all disabled:opacity-50">
            {loading ? 'Aranıyor...' : 'Bakiyemi Gör'}
          </button>
          <p className="text-[#666] text-xs text-center mt-4">Powered by Balans</p>
        </div>
      )}

      {step === 'panel' && member && (
        <div className="w-full max-w-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[#c8f542] font-bold text-xl tracking-widest">{gym.ad}</h1>
            <button onClick={() => { setStep('login'); setMember(null); setPhone('') }}
              className="text-[#666] border border-[#2a2a2a] px-3 py-1 rounded-lg text-xs hover:border-red-500 hover:text-red-400 transition-all">
              Çıkış
            </button>
          </div>

          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6 mb-4">
            <p className="text-[#666] text-sm mb-1">Merhaba, {member.ad_soyad.split(' ')[0]}! 👋</p>
            <p className="text-xs text-[#666] uppercase tracking-widest mb-4">Mevcut Bakiye</p>
            <div className={`text-5xl font-bold mb-2 ${Number(member.bakiye) >= 0 ? 'text-[#c8f542]' : 'text-red-400'}`}>
              {Number(member.bakiye) >= 0 ? '+' : ''}{Number(member.bakiye).toFixed(0)}₺
            </div>
            <p className={`text-sm ${Number(member.bakiye) < 0 ? 'text-red-400' : 'text-[#666]'}`}>
              {Number(member.bakiye) < 0 ? '⚠️ Bakiyeniz ekside' : '✅ Aktif üye'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-[#666] text-xs uppercase tracking-widest mb-1">Bu Ay</p>
              <p className="font-mono font-bold text-orange-400">
                ₺{transactions.filter(t => t.tur === 'satis' && String(t.tarih).slice(0, 7) === new Date().toISOString().slice(0, 7)).reduce((s, t) => s + Number(t.tutar), 0)}
              </p>
            </div>
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-[#666] text-xs uppercase tracking-widest mb-1">İşlem</p>
              <p className="font-mono font-bold">{transactions.length}</p>
            </div>
          </div>

          <h3 className="text-xs text-[#666] uppercase tracking-widest mb-3">Son İşlemler</h3>
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{t.aciklama || (t.tur === 'yukleme' ? 'Bakiye Yükleme' : 'Alışveriş')}</p>
                  <p className="text-xs text-[#666]">{t.tarih}</p>
                </div>
                <span className={`font-mono text-sm font-bold ${t.tur === 'satis' ? 'text-red-400' : 'text-[#c8f542]'}`}>
                  {t.tur === 'satis' ? '-' : '+'}₺{t.tutar}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[#666] text-xs text-center mt-6">Powered by Balans</p>
        </div>
      )}
    </div>
  )
}