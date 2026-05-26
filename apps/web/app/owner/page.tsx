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

// ---- Wallet Pass Preview ----
function ApplePassPreview({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 320 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 14, fontWeight: 500 }}>Apple Wallet Pass Preview</div>
        {/* Apple Wallet pass */}
        <div style={{ background: '#1D1D1F', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          {/* Pass header strip */}
          <div style={{ background: 'linear-gradient(135deg, #F5A623, #E8900A)', padding: '16px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/logo.svg" alt="Honeybee" width={22} height={22} style={{ borderRadius: 5 }} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Honeybee</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500 }}>PET ID</span>
          </div>
          {/* Pass body */}
          <div style={{ padding: '20px 20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Pet Name</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Biscuit</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Golden Retriever · Male</div>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#FFF3CD,#FFD966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🐕</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: 16 }}>
              {[['Owner', 'John & Lisa Smith'], ['Phone', '(801) 555-0192'], ['Clinic', 'Summit Animal Hospital'], ['Chip ID', '985...678']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Barcode area */}
            <div style={{ background: 'white', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#1D1D1F', letterSpacing: '0.15em', marginBottom: 6 }}>▌▌ ▌▌▌ ▌ ▌▌▌▌ ▌ ▌▌▌ ▌▌</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6E6E73', letterSpacing: '0.1em' }}>985141002345678</div>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px', color: 'white', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Close Preview</button>
      </div>
    </div>
  )
}

function GooglePassPreview({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 320 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 14, fontWeight: 500 }}>Google Wallet Pass Preview</div>
        {/* Google Wallet card */}
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #4285F4, #1A73E8)', padding: '20px 20px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Honeybee Pet ID</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>Biscuit</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Golden Retriever</div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🐕</div>
          </div>
          {/* Body */}
          <div style={{ padding: '18px 20px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 16 }}>
              {[['Owner', 'John & Lisa Smith'], ['Contact', '(801) 555-0192'], ['Veterinary Clinic', 'Summit Animal Hospital'], ['Chip Status', '✓ Active']].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 10, color: '#AEAEB2', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 13, color: '#1D1D1F', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#F5F5F7', borderRadius: 10, padding: '12px', textAlign: 'center', borderTop: '1px solid #EBEBEB' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#1D1D1F', letterSpacing: '0.15em', marginBottom: 4 }}>▌▌ ▌▌▌ ▌ ▌▌▌▌ ▌▌▌ ▌▌</div>
              <div style={{ fontSize: 11, color: '#6E6E73', fontFamily: 'monospace' }}>985141002345678</div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <Image src="/logo.svg" alt="Honeybee" width={14} height={14} style={{ borderRadius: 3 }} />
              <span style={{ fontSize: 11, color: '#AEAEB2' }}>Powered by Honeybee · seehoneybee.com</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: '100%', marginTop: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px', color: 'white', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Close Preview</button>
      </div>
    </div>
  )
}

// ---- Record Detail Modal ----
function RecordModal({ record, onClose }: { record: typeof mockRecords[0]; onClose: () => void }) {
  const cfg = (typeConfig[record.type] ?? typeConfig['exam'])!
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, padding: '28px 28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{cfg.icon}</div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, borderRadius: 100, padding: '2px 8px' }}>{cfg.label}</span>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>{fmtDate(record.date)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>{record.title}</h2>
        <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65 }}>{record.content}</div>
        </div>
        {Object.keys(record.meta).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
              {Object.entries(record.meta).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'capitalize', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
          {record.author} · Summit Animal Hospital
        </div>
      </div>
    </div>
  )
}

// ---- Update Chip Modal ----
function UpdateChipModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Update Chip Information</h2>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Show address on scan page</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Yes', 'No'].map((v, i) => (
                <button key={v} style={{ flex: 1, border: `1px solid ${i === 1 ? 'var(--blue)' : 'var(--border-strong)'}`, borderRadius: 9, padding: '10px', fontSize: 14, background: i === 1 ? 'var(--blue-light)' : 'var(--surface)', color: i === 1 ? 'var(--blue)' : 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: i === 1 ? 600 : 400 }}>{v}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', fontSize: 15, padding: '13px', marginTop: 4 }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

export default function OwnerPortal() {
  const [walletModal, setWalletModal] = useState<null | 'apple' | 'google'>(null)
  const [selectedRecord, setSelectedRecord] = useState<typeof mockRecords[0] | null>(null)
  const [showUpdateChip, setShowUpdateChip] = useState(false)
  const pet = mockPet
  const cfgFn = (t: string) => (typeConfig[t] ?? typeConfig['exam'])!

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Modals */}
      {walletModal === 'apple' && <ApplePassPreview onClose={() => setWalletModal(null)} />}
      {walletModal === 'google' && <GooglePassPreview onClose={() => setWalletModal(null)} />}
      {selectedRecord && <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
      {showUpdateChip && <UpdateChipModal onClose={() => setShowUpdateChip(false)} />}

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

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Pets</h1>

        {/* Top cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

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
            <button onClick={() => setShowUpdateChip(true)} style={{ width: '100%', marginTop: 10, border: '1px solid var(--border-strong)', borderRadius: 9, padding: '9px', fontSize: 13, background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
              ✏️ Update Information
            </button>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Wallet passes */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Digital ID Pass</div>
              <div style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => setWalletModal('apple')}>
                <Image src="/apple-wallet.png" alt="Add to Apple Wallet" width={280} height={84} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => setWalletModal('google')}>
                <Image src="/google-wallet.png" alt="Add to Google Wallet" width={280} height={84} style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
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
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{mockSummary}</p>
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
