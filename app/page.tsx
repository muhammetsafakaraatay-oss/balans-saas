'use client'

import { useRouter } from 'next/navigation'

export default function Landing() {
  const router = useRouter()

  const features = [
    { icon: '👥', title: 'Üye Yönetimi', desc: 'Üye ekle, bakiye yükle, geçmişi takip et.' },
    { icon: '🛒', title: 'Hızlı Satış', desc: 'Ürün seç, üye seç, satışı tamamla. Saniyeler içinde.' },
    { icon: '📈', title: 'Anlık Raporlar', desc: 'Aylık satış, yükleme ve bakiye raporları.' },
    { icon: '🔒', title: 'Güvenli', desc: 'Verileriniz şifreli ve sadece size özel.' },
    { icon: '📱', title: 'Her Cihazda', desc: 'Telefon, tablet veya bilgisayardan kullanın.' },
    { icon: '⚡', title: 'Hızlı Kurulum', desc: 'Kayıt ol, hemen kullanmaya başla.' },
  ]

  const planFeatures = ['Sınırsız üye', 'Sınırsız işlem', 'Tüm raporlar', 'Üye paneli', '7/24 erişim']

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-[#2a2a2a]">
        <div className="text-[#c8f542] font-bold text-2xl tracking-widest">BALANS</div>
        <div className="flex gap-4">
          <button onClick={() => router.push('/login')} className="text-[#666] hover:text-white transition-all text-sm">
            Giriş Yap
          </button>
          <button onClick={() => router.push('/register')} className="bg-[#c8f542] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#d6ff55] transition-all text-sm">
            Ücretsiz Başla
          </button>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-block bg-[#c8f542]/10 text-[#c8f542] text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest">
          ÜYE & BAKİYE YÖNETİMİ
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          İşletmenizi dijitale taşıyın
        </h1>
        <p className="text-[#666] text-lg mb-12 max-w-2xl mx-auto">
          Üye bakiyelerini takip edin, satışları yönetin, raporları anında görün.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push('/register')} className="bg-[#c8f542] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#d6ff55] transition-all text-base">
            Ücretsiz Başla
          </button>
          <button onClick={() => router.push('/demo')} className="border border-[#2a2a2a] px-8 py-4 rounded-xl hover:border-[#c8f542] hover:text-[#c8f542] transition-all text-base">
            Demo Dene
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-center text-3xl font-bold mb-12">Her şey tek yerde</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-[#666] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-8 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Basit fiyatlandırma</h2>
        <p className="text-[#666] mb-12">Gizli ücret yok.</p>
        <div className="bg-[#161616] border border-[#c8f542]/30 rounded-2xl p-10">
          <div className="text-[#666] text-sm uppercase tracking-widest mb-2">Aylık</div>
          <div className="text-6xl font-bold text-[#c8f542] mb-2">₺500</div>
          <div className="text-[#666] text-sm mb-8">/ ay</div>
          <ul className="text-left space-y-3 mb-8">
            {planFeatures.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <span className="text-[#c8f542]">✓</span> {f}
              </li>
            ))}
          </ul>
          <button onClick={() => router.push('/register')} className="w-full bg-[#c8f542] text-black font-bold py-4 rounded-xl hover:bg-[#d6ff55] transition-all">
            Hemen Başla
          </button>
        </div>
      </section>

      <footer className="border-t border-[#2a2a2a] px-8 py-8 text-center text-[#666] text-sm">
        2026 Balans. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}