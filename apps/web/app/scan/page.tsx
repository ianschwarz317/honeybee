import Link from 'next/link'
import Image from 'next/image'
import { mockPet } from '@/lib/mock-data'

export default function ScanPage() {
  const pet = mockPet
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Top bar */}
      <div className="fade-up" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(245,245,247,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 100 }}>
        <Image src="/logo.svg" alt="Honeybee" width={28} height={28} style={{ borderRadius: 6 }} />
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Honeybee</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-secondary)' }}>Lost Pet Recovery</span>
      </div>

      <div style={{ marginTop: 60, maxWidth: 400, width: '100%' }}>

        {/* Scan badge */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 100, padding: '6px 14px', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <span>📡</span> NFC Chip Scanned
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>This pet has been found!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Please contact the owner using the information below.</p>
        </div>

        {/* Pet card */}
        <div className="card fade-up delay-1" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #FFF3CD, #FFD966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🐕</div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{pet.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{pet.breed} · {pet.sex} · {pet.color}</p>
              <span className="badge-green" style={{ marginTop: 6 }}>✓ Registered Chip</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
            {[
              { label: 'Chip Number', value: pet.chip_number },
              { label: 'Registered Clinic', value: pet.vet_clinic },
            ].map(({ label, value }) => (
              <div key={label} style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, fontFamily: label === 'Chip Number' ? 'monospace' : 'inherit' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Emergency contact */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Owner</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{pet.owner_name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{pet.owner_phone}</div>
          </div>

          <a href={`tel:${pet.owner_phone}`} style={{ textDecoration: 'none', display: 'block' }}>
            <button className="btn-primary" style={{ width: '100%', fontSize: 16, padding: '14px', borderRadius: 12 }}>
              📞 Call Owner Now
            </button>
          </a>
        </div>

        {/* Powered by */}
        <div className="fade-up delay-2" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>Powered by</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <Image src="/logo.svg" alt="Honeybee" width={18} height={18} style={{ borderRadius: 4 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Honeybee</span>
          </Link>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>Smart microchip platform for pet owners &amp; veterinarians</p>
        </div>
      </div>
    </main>
  )
}
