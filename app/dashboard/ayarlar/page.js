'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function AyarlarPage() {
  const [gym, setGym] = useState(null)
  const [isimLoading, setIsimLoading] = useState(false)
  const [logoLoading, setLogoLoading] = useState(false)
  const [mesaj, setMesaj] = useState(null)
  const [isim, setIsim] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    gymGetir()
  }, [])

  async function gymGetir() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('gyms')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setGym(data)
      setIsim(data.name || '')
      setPreviewUrl(data.logo_url || null)
    }
  }

  async function isimGuncelle() {
    if (!isim.trim()) return
    setIsimLoading(true)
    setMesaj(null)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('gyms')
      .update({ name: isim })
      .eq('user_id', user.id)
    if (error) {
      setMesaj({ tip: 'hata', metin: 'Güncelleme başarısız.' })
    } else {
      setMesaj({ tip: 'basari', metin: 'İşletme adı güncellendi.' })
    }
    setIsimLoading(false)
  }

  async function logoYukle(e) {
    const dosya = e.target.files[0]
    if (!dosya) return
    if (dosya.size > 2 * 1024 * 1024) {
      setMesaj({ tip: 'hata', metin: "Logo 2MB'dan küçük olmalı." })
      return
    }
    setLogoLoading(true)
    setMesaj(null)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target.result)
    reader.readAsDataURL(dosya)
    const { data: { user } } = await supabase.auth.getUser()
    const dosyaYolu = `${user.id}/logo.${dosya.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage
      .from('Logos')
      .upload(dosyaYolu, dosya, { upsert: true })
    if (uploadError) {
      setMesaj({ tip: 'hata', metin: 'Logo yüklenemedi.' })
      setLogoLoading(false)
      return
    }
    const { data: urlData } = supabase.storage
      .from('Logos')
      .getPublicUrl(dosyaYolu)
    const { error: updateError } = await supabase
      .from('gyms')
      .update({ logo_url: urlData.publicUrl })
      .eq('user_id', user.id)
    if (updateError) {
      setMesaj({ tip: 'hata', metin: 'Logo kaydedilemedi.' })
    } else {
      setMesaj({ tip: 'basari', metin: 'Logo güncellendi! ✓' })
    }
    setLogoLoading(false)
  }

  async function logoSil() {
    if (!confirm('Logoyu silmek istediğinize emin misiniz?')) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('gyms')
      .update({ logo_url: null })
      .eq('user_id', user.id)
    setPreviewUrl(null)
    setMesaj({ tip: 'basari', metin: 'Logo silindi.' })
  }

  return (
    <div style={{ padding: '32px', maxWidth: '600px' }}>
      <h1 style={{ color: '#CCFF00', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
        AYARLAR
      </h1>
      <p style={{ color: '#888', marginBottom: '32px' }}>İşletme bilgilerinizi yönetin</p>

      {mesaj && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: mesaj.tip === 'basari' ? '#1a2e00' : '#2e0000',
          border: `1px solid ${mesaj.tip === 'basari' ? '#CCFF00' : '#ff4444'}`,
          color: mesaj.tip === 'basari' ? '#CCFF00' : '#ff4444',
        }}>
          {mesaj.metin}
        </div>
      )}

      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>İşletme Logosu</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '12px', backgroundColor: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed #444' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ color: '#555', fontSize: '13px', textAlign: 'center', padding: '8px' }}>Logo yok</span>
            )}
          </div>
          <div>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>PNG, JPG veya SVG · Max 2MB</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoLoading}
                style={{ backgroundColor: '#CCFF00', color: '#000', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: logoLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '13px', opacity: logoLoading ? 0.7 : 1 }}
              >
                {logoLoading ? 'Yükleniyor...' : 'Logo Yükle'}
              </button>
              {previewUrl && (
                <button
                  onClick={logoSil}
                  style={{ backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Sil
                </button>
              )}
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={logoYukle} style={{ display: 'none' }} />
      </div>

      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>İşletme Adı</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={isim}
            onChange={(e) => setIsim(e.target.value)}
            placeholder="İşletme adı..."
            style={{ flex: 1, backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <button
            onClick={isimGuncelle}
            disabled={isimLoading}
            style={{ backgroundColor: '#CCFF00', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: isimLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: isimLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}
          >
            {isimLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>Üye Paneli Linki</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#2a2a2a', borderRadius: '8px', padding: '10px 14px' }}>
          <span style={{ color: '#888', fontSize: '13px', flex: 1 }}>
            {gym ? `${window.location.origin}/uye/${gym.slug || gym.id}` : '...'}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/uye/${gym?.slug || gym?.id}`)
              setMesaj({ tip: 'basari', metin: 'Link kopyalandı!' })
            }}
            style={{ backgroundColor: '#CCFF00', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            Kopyala
          </button>
        </div>
      </div>
    </div>
  )
}
