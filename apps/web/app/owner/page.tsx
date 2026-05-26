import Link from 'next/link'
import Image from 'next/image'
import { mockPet, mockRecords, mockSummary, mockScans } from '@/lib/mock-data'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vaccination: { label: 'Vaccine', color: '#1A7F37', bg: '#E8F8ED', icon: '💉' },
  exam:         { label: 'Exam',   color: '#0051A2', bg: '#E8F1FB', icon: '🩺' },
  prescription: { label: 'Rx',     color: '#6B3FBA', bg: '#F3EEFF', icon: '💊' },
  lab:          { label: 'Lab',    color: '#7D4800', bg: '#FFF3E0', icon: '🧪' },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
function age(dob: string) {
  return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs`
}

const Nav = () => (
  <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      <Image src="/logo.svg" alt="Honeybee" width={26} height={26} style={{ borderRadius: 6 }} />
      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Honeybee</span>
    </Link>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>John Smith</span>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>JS</div>
    </div>
  </nav>
)

export default function OwnerPortal() {
  const pet = mockPet
  const cfgFn = (t: string) => (typeConfig[t] ?? typeConfig['exam'])!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        <h1 className="fade-up" style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Pets</h1>

        {/* Top row */}
        <div className="fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Pet profile */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#FFF3CD,#FFD966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🐕</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{pet.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{pet.breed}</p>
                <span className="badge-green">✓ Chip registered</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 0', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {[['Age', age(pet.date_of_birth)], ['Weight', `${pet.weight_kg} kg`], ['Sex', pet.sex], ['Color', pet.color]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Veterinary Clinic</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{pet.vet_clinic}</div>
            </div>
          </div>

          {/* Chip card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Microchip</span>
              <span className="badge-green">● Active</span>
            </div>
            <div style={{ background: '#1D1D1F', borderRadius: 10, padding: '16px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,166,35,0.15)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Image src="/logo.svg" alt="Honeybee" width={18} height={18} style={{ borderRadius: 4 }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}>Honeybee</span>
              </div>
              <div style={{ fontFamily: 'monospace', color: 'white', fontSize: 13, letterSpacing: '0.12em', marginBottom: 8 }}>
                {pet.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>NFC + 134.2 kHz · ISO 11784/5</div>
            </div>
            {[['NFC UID', pet.nfc_uid], ['Emergency Contact', pet.owner_phone]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: l === 'NFC UID' ? 'monospace' : 'inherit' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Wallet passes */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Digital ID Pass</div>
              <button style={{ width: '100%', background: '#000', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}>
                <svg viewBox="0 0 814 1000" style={{ width: 18, height: 18, fill: 'white', flexShrink: 0 }}><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.5 269-317.5 69.7 0 127.5 45.8 170.9 45.8 42.2 0 109.1-47.1 190.5-47.1 65 0 124.5 24.2 168.2 65.2zm-180.5-52.1c-21.1 25.3-58.2 45.2-94.4 45.2-7 0-14.1-.5-21.1-1.6-5.4-1-10.9-1.6-16.4-1.6-15.4 0-29.7 5.2-40.3 13.8-2.1 1.7-4.5 3.4-7.6 3.4-3.5 0-5.3-2.2-5.3-5.7 0-54.6 55.4-131.4 131.8-131.4 36.4 0 64.9 17.9 85.2 42.8 2.4 2.9 3.5 6.1 3.5 9.4 0 8.7-5.6 15.7-14.6 21.3-.9.5-4.5 2.6-7.6 2.6-9.4 0-13.3-5.5-13.3-11.2 0-5.2 4.5-10.7 4.5-17.9 0-13.3-12.4-21.5-24.8-21.5z"/></svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1 }}>Add to</div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>Apple Wallet</div>
                </div>
              </button>
              <button style={{ width: '100%', background: '#1A73E8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg viewBox="0 0 192.756 192.756" style={{ width: 18, height: 18, fill: 'white', flexShrink: 0 }}><path d="M96.378 0C43.218 0 0 43.22 0 96.378c0 53.162 43.218 96.378 96.378 96.378 53.162 0 96.378-43.216 96.378-96.378C192.756 43.22 149.54 0 96.378 0zm46.165 130.885c-16.112 9.303-36.553 3.773-45.855-12.34l-5.146-8.918-5.15 8.918c-9.3 16.113-29.741 21.643-45.854 12.34-16.11-9.299-21.64-29.74-12.34-45.854L73.882 23.82h44.992l39.611 68.619h.002c9.299 16.113 3.769 36.553-12.344 45.446z"/></svg>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1 }}>Add to</div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>Google Wallet</div>
                </div>
              </button>
            </div>

            {/* Scan log */}
            <div className="card" style={{ padding: 18, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Recent Scans</div>
              {mockScans.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? 'var(--blue)' : 'var(--text-tertiary)', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.location}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmtDT(s.at)}</div>
                  </div>
                  {s.alerted && <span className="badge-amber" style={{ fontSize: 11 }}>Alert sent</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="card fade-up delay-2" style={{ padding: 20, marginBottom: 16, borderLeft: '3px solid var(--honey)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>AI Health Summary</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Generated from {mockRecords.length} records · May 2026</div>
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{mockSummary}</p>
        </div>

        {/* Records */}
        <div className="fade-up delay-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Medical Records</h2>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{mockRecords.length} records</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mockRecords.map(rec => {
              const cfg = cfgFn(rec.type)
              return (
                <div key={rec.id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, borderRadius: 100, padding: '2px 8px' }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmtDate(rec.date)}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{rec.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{rec.content}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>{rec.author} · {pet.vet_clinic}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
