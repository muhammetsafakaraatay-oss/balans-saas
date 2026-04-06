import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  try {
    const { email, gymId } = await req.json()

    const bugun = new Date().toISOString().slice(0, 10)

    const { data: islemler } = await supabase
      .from('islemler')
      .select('*, uyeler(ad_soyad)')
      .eq('tarih', bugun)

    const satislar = islemler?.filter(t => t.tur === 'satis') || []
    const yuklemeler = islemler?.filter(t => t.tur === 'yukleme') || []
    const toplamCiro = satislar.reduce((s, t) => s + Number(t.tutar), 0)
    const toplamYukleme = yuklemeler.reduce((s, t) => s + Number(t.tutar), 0)

    await resend.emails.send({
      from: 'Balans <onboarding@resend.dev>',
      to: email,
      subject: `📊 Günlük Rapor — ${bugun}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0d0d0d;color:#fff;padding:32px;border-radius:16px">
          <h1 style="color:#c8f542;margin-bottom:4px">Günlük Kapanış Raporu</h1>
          <p style="color:#666;margin-bottom:24px">${bugun}</p>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
            <div style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:16px">
              <p style="color:#666;font-size:12px;margin:0 0 4px">Toplam Satış</p>
              <p style="color:#c8f542;font-size:24px;font-weight:bold;margin:0">${satislar.length} adet</p>
            </div>
            <div style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:16px">
              <p style="color:#666;font-size:12px;margin:0 0 4px">Günlük Ciro</p>
              <p style="color:#c8f542;font-size:24px;font-weight:bold;margin:0">₺${toplamCiro.toFixed(0)}</p>
            </div>
            <div style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:16px">
              <p style="color:#666;font-size:12px;margin:0 0 4px">Yükleme Adedi</p>
              <p style="color:#c8f542;font-size:24px;font-weight:bold;margin:0">${yuklemeler.length} adet</p>
            </div>
            <div style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:16px">
              <p style="color:#666;font-size:12px;margin:0 0 4px">Toplam Yükleme</p>
              <p style="color:#c8f542;font-size:24px;font-weight:bold;margin:0">₺${toplamYukleme.toFixed(0)}</p>
            </div>
          </div>

          ${satislar.length > 0 ? `
          <h3 style="color:#fff;margin-bottom:12px">Bugünün Satışları</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr style="color:#666;font-size:12px">
              <th style="text-align:left;padding:8px 0">Üye</th>
              <th style="text-align:left;padding:8px 0">Tutar</th>
            </tr>
            ${satislar.map(t => `
            <tr style="border-top:1px solid #2a2a2a">
              <td style="padding:8px 0;font-size:14px">${t.uyeler?.ad_soyad || '—'}</td>
              <td style="padding:8px 0;font-size:14px;color:#c8f542">₺${t.tutar}</td>
            </tr>`).join('')}
          </table>` : '<p style="color:#666">Bugün satış yapılmadı.</p>'}

          <p style="color:#444;font-size:12px;margin-top:24px;text-align:center">Powered by Balans</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Email gönderilemedi' }, { status: 500 })
  }
}
