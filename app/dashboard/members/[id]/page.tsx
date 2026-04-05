'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function MemberProfile({ params }: { params: { id: string } }) {
  const [member, setMember] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadMember()
  }, [])

  async function loadMember() {
    const { data: m } = await supabase.from('uyeler').select('*').eq('id', params.id).single()
    const { data: t } = await supabase
      .from('islemler')
      .select('*')
      .eq('uye_id', params.id)
      .order('id', { ascending: false })
    setMember(m)
    setTransactions(t || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><div className="text-[#c8f542]">Yükleniyor...</div></div>
  if (!member) return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><div className="text-red-400">Üye bulunamadı</div></div>

  const toplamHarcama = transactions.filter(t => t.tur === 'satis').reduce((s, t) => s + Number(t.tutar), 0)
  const toplamYukleme = transactions.filter(t => t.tur === 'yukleme').reduce((s, t) => s + Number(t.tutar), 0)
  const buAyHarcama = transactions.filter(t => t.tur === 'satis' && String(t.tarih).slice(0, 7) === new Date().toISOString().slice(0, 7)).reduce((s, t) => s + Number(t.tutar), 0)

  // Ürün bazlı harcama
  const urunSayac: Record<string, number> = {}
  transactions.filter(t => t.tur === 'satis').forEach(t => {
    const urun = t.aciklama || 'Diğer'
    urunSayac[urun] = (urunSayac[urun] || 0) + 1
  })
  const enCokAlinan = Object.entries(urunSayac).sort((a, b) => b[1] - a[1])[0]

  // Grafik verisi
  const gunlukData: Record<string, number> = {}
  transactions.filter(t => t.tur === 'satis').forEach(t => {
    const gun = String(t.tarih).slice(0, 10)
    gunlukData[gun] = (gunlukData[gun] || 0) + Number(t.tutar)
  })
  const chartData = Object.entries(gunlukData).sort().slice(-14).map(([tarih, tutar]) => ({
    tarih: new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    tutar
  }))

  const initials = member.ad_soyad.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarColor = `hsl(${member.ad_soyad.charCodeAt(0) * 137 % 360}, 70%, 60%)`

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-8 max-w-3xl">
      {/* Geri */}
      <button onClick={() => router.back()} className="text-[#666] hover:text-white text-sm mb-6 flex items-center gap-2 transition-all">
        ← Geri
      </button>

      {/* Üye başlık */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-black flex-shrink-0"
          style={{ backgroundColor: avatarColor }}>
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{member.ad_soyad}</h1>
          <p className="text-[#666] text-sm">{member.telefon || 'Telefon yok'} · Kayıt: {new Date(member.kayit_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-3xl font-bold ${Number(member.bakiye) >= 0 ? 'text-[#c8f542]' : 'text-red-400'}`}>
            {Number(member.bakiye) >= 0 ? '+' : ''}{Number(member.bakiye).toFixed(0)}₺
          </div>
          <p className="text-[#666] text-xs">Mevcut Bakiye</p>
        </div>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[#666] text-xs uppercase tracking-widest mb-1">Toplam Harcama</p>
          <p className="text-xl font-bold text-red-400">₺{toplamHarcama.toFixed(0)}</p>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[#666] text-xs uppercase tracking-widest mb-1">Toplam Yükleme</p>
          <p className="text-xl font-bold text-[#c8f542]">₺{toplamYukleme.toFixed(0)}</p>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[#666] text-xs uppercase tracking-widest mb-1">Bu Ay</p>
          <p className="text-xl font-bold text-orange-400">₺{buAyHarcama.toFixed(0)}</p>
        </div>
      </div>

      {/* En çok alınan */}
      {enCokAlinan && (
        <div className="bg-[#161616] border border-[#c8f542]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-[#666] uppercase tracking-widest">En Çok Alınan</p>
            <p className="font-bold">{enCokAlinan[0]} <span className="text-[#666] font-normal text-sm">({enCokAlinan[1]} kez)</span></p>
          </div>
        </div>
      )}

      {/* Grafik */}
      {chartData.length > 0 && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-4 text-sm">Son 14 Gün Harcama</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <XAxis dataKey="tarih" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="tutar" stroke="#c8f542" fill="#c8f542" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* İşlem geçmişi */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2a2a2a]">
          <h3 className="font-semibold text-sm">Tüm İşlemler</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[#666] text-xs uppercase tracking-widest">
              <th className="text-left p-4">Tür</th>
              <th className="text-left p-4">Açıklama</th>
              <th className="text-left p-4">Tutar</th>
              <th className="text-left p-4">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-t border-[#2a2a2a] hover:bg-[#1e1e1e]">
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    t.tur === 'satis' ? 'bg-red-500/10 text-red-400' :
                    t.tur === 'yukleme' ? 'bg-[#c8f542]/10 text-[#c8f542]' :
                    'bg-orange-500/10 text-orange-400'
                  }`}>
                    {t.tur === 'yukleme' ? 'Yükleme' : t.tur === 'satis' ? 'Satış' : 'İptal'}
                  </span>
                </td>
                <td className="p-4 text-sm text-[#666]">{t.aciklama || '—'}</td>
                <td className="p-4 text-sm font-mono font-bold">
                  <span className={t.tur === 'satis' ? 'text-red-400' : 'text-[#c8f542]'}>
                    {t.tur === 'satis' ? '-' : '+'}₺{t.tutar}
                  </span>
                </td>
                <td className="p-4 text-sm text-[#666]">
                  {new Date(t.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
