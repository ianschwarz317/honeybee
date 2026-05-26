'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { mockPet, mockRecords, mockSummary, mockScans } from '@/lib/mock-data'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vaccination: { label: 'Vaccine',      color: '#1A7F37', bg: '#E8F8ED', icon: '💉' },
  exam:         { label: 'Exam',         color: '#0051A2', bg: '#E8F1FB', icon: '🩺' },
  prescription: { label: 'Rx',           color: '#6B3FBA', bg: '#F3EEFF', icon: '💊' },
  lab:          { label: 'Lab',          color: '#7D4800', bg: '#FFF3E0', icon: '🧪' },
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
function fmtDT(d: string)   { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
function age(dob: string)   { return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs` }

// ---- Record Detail Modal ----
function RecordModal({ record, onClose }: { record: typeof mockRecords[0]; onClose: () => void }) {
  const cfg = (typeConfig[record.type] ?? typeConfig['exam'])!
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{cfg.icon}</div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, borderRadius: 100, padding: '2px 8px' }}>{cfg.label}</span>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>{fmtDate(record.date)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{record.title}</h2>
        <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{record.content}</p>
        </div>
        {Object.keys(record.meta).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
              {Object.entries(record.meta).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'capitalize', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>{record.author} · Summit Animal Hospital</div>
      </div>
    </div>
  )
}

// ---- Update Chip Modal ----
function UpdateChipModal({ onClose, anonymous, setAnonymous }: { onClose: () => void; anonymous: boolean; setAnonymous: (v: boolean) => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Update Chip Information</h2>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Emergency Contact Name', value: 'John & Lisa Smith', type: 'text' },
            { label: 'Emergency Phone', value: '(801) 555-0192', type: 'tel' },
            { label: 'Emergency Email', value: 'john.smith@email.com', type: 'email' },
            { label: 'Alternate Contact', value: '', type: 'text' },
          ].map(({ label, value, type }) => (
            <div key={label}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
              <input defaultValue={value} type={type} style={{ width: '100%', border: '1px solid var(--border-strong)', borderRadius: 9, padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          {/* Anonymize toggle */}
          <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Anonymize personal info on scan</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>When on, only pet name and breed are shown to strangers. Contact info is hidden.</div>
              </div>
              <button
                onClick={() => setAnonymous(!anonymous)}
                style={{ flexShrink: 0, marginLeft: 16, width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', background: anonymous ? 'var(--blue)' : '#D1D1D6', position: 'relative', transition: 'background 0.2s' }}
              >
                <div style={{ position: 'absolute', top: 3, left: anonymous ? 24 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: anonymous ? 'var(--blue)' : 'var(--text-tertiary)', marginTop: 6 }}>
              {anonymous ? 'ℹ️ Personal info hidden from public scans' : 'Personal info visible on public scans'}
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', fontSize: 15, padding: '13px', borderRadius: 10 }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ---- Pet Health Pass (matches example design) ----
function PetHealthPass() {
  const vaccines = [
    { icon: '🛡️', color: '#2D6A4F', bg: '#D8F3DC', label: 'RABIES VACCINE CONFIRMED', status: 'Good Through', detail: '04/22/2029', check: '#2D6A4F' },
    { icon: '📋', color: '#1D3557', bg: '#E0F0FF', label: 'HEALTH CERTIFICATE', status: 'Valid', detail: '', check: '#1D3557' },
    { icon: '🐾', color: '#5A189A', bg: '#EDE7F6', label: 'BORDATELLA VACCINE', status: 'Up to Date', detail: '', check: '#5A189A' },
    { icon: '🐾', color: '#E65100', bg: '#FFF3E0', label: 'DHPP VACCINATION', status: 'Up to Date', detail: '', check: '#E65100' },
  ]
  return (
    <div style={{ background: 'linear-gradient(160deg, #FFFBEE 0%, #FFF3C4 100%)', borderRadius: 16, overflow: 'hidden', border: '1px solid #F5D87A', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image src="/logo.svg" alt="Honeybee" width={24} height={24} style={{ borderRadius: 6 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#2D4A1E', letterSpacing: '0.04em', lineHeight: 1.1 }}>HONEYBEE</div>
            <div style={{ fontSize: 10, color: '#6B8C3E', fontWeight: 500 }}>Pet Health Pass</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(45,106,79,0.1)', borderRadius: 100, padding: '4px 10px', border: '1px solid rgba(45,106,79,0.2)' }}>
          <div style={{ fontSize: 11, color: '#2D6A4F' }}>🛡️</div>
          <span style={{ fontSize: 11, color: '#2D6A4F', fontWeight: 600 }}>Vet Verified</span>
        </div>
      </div>

      {/* Pet info */}
      <div style={{ padding: '6px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: '#8B7355', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Pet Name</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#2D4A1E', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>Biscuit</div>
          <div style={{ fontSize: 10, color: '#8B7355', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Pet Age</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2D4A1E' }}>6 years</div>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #FFF3CD, #FFD966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>🐕</div>
      </div>

      {/* Vaccine records */}
      <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {vaccines.map(({ icon, color, bg, label, status, detail, check }) => (
          <div key={label} style={{ background: 'white', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1C1C1E', letterSpacing: '0.02em' }}>{label}</div>
              <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 1 }}>{status}{detail ? ` ${detail}` : ''}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: check, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 9, height: 6, borderLeft: '1.5px solid white', borderBottom: '1.5px solid white', transform: 'rotate(-45deg) translate(0.5px,-0.5px)' }} />
              </div>
              <span style={{ fontSize: 11, color: '#8E8E93' }}>Details ›</span>
            </div>
          </div>
        ))}
      </div>

      {/* QR code area */}
      <div style={{ padding: '10px 16px 14px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 10, padding: '10px', display: 'inline-block', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          {/* SVG QR-like pattern */}
          <svg width="70" height="70" viewBox="0 0 70 70" style={{ display: 'block' }}>
            <rect width="70" height="70" fill="white"/>
            {/* Corner squares */}
            <rect x="2" y="2" width="20" height="20" fill="#1C1C1E"/><rect x="4" y="4" width="16" height="16" fill="white"/><rect x="6" y="6" width="12" height="12" fill="#1C1C1E"/>
            <rect x="48" y="2" width="20" height="20" fill="#1C1C1E"/><rect x="50" y="4" width="16" height="16" fill="white"/><rect x="52" y="6" width="12" height="12" fill="#1C1C1E"/>
            <rect x="2" y="48" width="20" height="20" fill="#1C1C1E"/><rect x="4" y="50" width="16" height="16" fill="white"/><rect x="6" y="52" width="12" height="12" fill="#1C1C1E"/>
            {/* Data cells */}
            <rect x="24" y="2" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="2" width="4" height="4" fill="#1C1C1E"/><rect x="36" y="2" width="4" height="4" fill="#1C1C1E"/>
            <rect x="24" y="8" width="4" height="4" fill="#1C1C1E"/><rect x="36" y="8" width="4" height="4" fill="#1C1C1E"/>
            <rect x="24" y="14" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="14" width="4" height="4" fill="#1C1C1E"/>
            <rect x="2" y="24" width="4" height="4" fill="#1C1C1E"/><rect x="8" y="24" width="4" height="4" fill="#1C1C1E"/>
            <rect x="2" y="30" width="4" height="4" fill="#1C1C1E"/><rect x="14" y="30" width="4" height="4" fill="#1C1C1E"/>
            <rect x="2" y="36" width="4" height="4" fill="#1C1C1E"/><rect x="8" y="36" width="4" height="4" fill="#1C1C1E"/><rect x="20" y="36" width="4" height="4" fill="#1C1C1E"/>
            <rect x="2" y="42" width="4" height="4" fill="#1C1C1E"/><rect x="14" y="42" width="4" height="4" fill="#1C1C1E"/>
            <rect x="24" y="24" width="22" height="22" fill="#F5A623"/><rect x="28" y="28" width="14" height="14" fill="white"/><rect x="30" y="30" width="10" height="10" fill="#F5A623"/>
            <rect x="48" y="24" width="4" height="4" fill="#1C1C1E"/><rect x="54" y="24" width="4" height="4" fill="#1C1C1E"/>
            <rect x="48" y="30" width="4" height="4" fill="#1C1C1E"/><rect x="60" y="30" width="4" height="4" fill="#1C1C1E"/>
            <rect x="48" y="36" width="4" height="4" fill="#1C1C1E"/><rect x="54" y="36" width="4" height="4" fill="#1C1C1E"/>
            <rect x="24" y="48" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="48" width="4" height="4" fill="#1C1C1E"/><rect x="36" y="48" width="4" height="4" fill="#1C1C1E"/>
            <rect x="24" y="54" width="4" height="4" fill="#1C1C1E"/><rect x="42" y="54" width="4" height="4" fill="#1C1C1E"/>
            <rect x="24" y="60" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="60" width="4" height="4" fill="#1C1C1E"/><rect x="42" y="60" width="4" height="4" fill="#1C1C1E"/>
            <rect x="48" y="48" width="4" height="4" fill="#1C1C1E"/><rect x="60" y="48" width="4" height="4" fill="#1C1C1E"/>
            <rect x="54" y="54" width="4" height="4" fill="#1C1C1E"/><rect x="60" y="54" width="4" height="4" fill="#1C1C1E"/>
            <rect x="48" y="60" width="4" height="4" fill="#1C1C1E"/><rect x="54" y="60" width="4" height="4" fill="#1C1C1E"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function OwnerPortal() {
  const [selectedRecord, setSelectedRecord] = useState<typeof mockRecords[0] | null>(null)
  const [showUpdateChip, setShowUpdateChip] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const pet = mockPet
  const cfgFn = (t: string) => (typeConfig[t] ?? typeConfig['exam'])!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {selectedRecord && <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
      {showUpdateChip && <UpdateChipModal onClose={() => setShowUpdateChip(false)} anonymous={anonymous} setAnonymous={setAnonymous} />}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,245,247,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <Image src="/logo.svg" alt="Honeybee" width={26} height={26} style={{ borderRadius: 6 }} />
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Honeybee</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>John Smith</span>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>JS</div>
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '20px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Pets</h1>

        {/* Top cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Pet profile */}
          <div className="card" style={{ padding: 14 }}>
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
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Microchip</span>
              <span className="badge-green">● Active</span>
            </div>
            <div style={{ background: '#1D1D1F', borderRadius: 10, padding: '16px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,166,35,0.15)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative' }}>
                <Image src="/logo.svg" alt="Honeybee" width={18} height={18} style={{ borderRadius: 4 }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}>Honeybee</span>
              </div>
              <div style={{ fontFamily: 'monospace', color: 'white', fontSize: 13, letterSpacing: '0.12em', marginBottom: 8, position: 'relative' }}>
                {pet.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', position: 'relative' }}>NFC + 134.2 kHz · ISO 11784/5</div>
            </div>

            {[['NFC UID', pet.nfc_uid], ['Emergency Contact', pet.owner_phone]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: l === 'NFC UID' ? 'monospace' : 'inherit' }}>{v}</span>
              </div>
            ))}

            {/* Anonymize toggle */}
            <div style={{ background: 'var(--surface-2)', borderRadius: 9, padding: '10px 12px', marginTop: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 1 }}>Anonymize on scan</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Hide personal info from public</div>
                </div>
                <button
                  onClick={() => setAnonymous(!anonymous)}
                  style={{ width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: anonymous ? 'var(--blue)' : '#D1D1D6', position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 12 }}
                >
                  <div style={{ position: 'absolute', top: 3, left: anonymous ? 20 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>

            <button onClick={() => setShowUpdateChip(true)} style={{ width: '100%', border: '1px solid var(--border-strong)', borderRadius: 9, padding: '9px', fontSize: 13, background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
              ✏️ Update Information
            </button>
          </div>

          {/* Right column: wallet pass + scan log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Wallet pass - shown inline */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Digital ID Pass</div>
              <PetHealthPass />
              {/* Official wallet buttons - transparent containers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <div style={{ cursor: 'pointer', display: 'block' }}>
                  <Image src="/apple-wallet.png" alt="Add to Apple Wallet" width={280} height={84} style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }} />
                </div>
                <div style={{ cursor: 'pointer', display: 'block' }}>
                  <Image src="/google-wallet.png" alt="Add to Google Wallet" width={280} height={84} style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }} />
                </div>
              </div>
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
        <div className="card" style={{ padding: 20, marginBottom: 16, borderLeft: '3px solid var(--honey)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>AI Health Summary</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Generated from {mockRecords.length} records · May 2026</div>
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-line', margin: 0 }}>{mockSummary}</p>
        </div>

        {/* Records */}
        <div>
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
                  <button onClick={() => setSelectedRecord(rec)} style={{ flexShrink: 0, border: '1px solid var(--border-strong)', borderRadius: 8, padding: '6px 14px', fontSize: 13, background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    View →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
