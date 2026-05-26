'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { mockClinic } from '@/lib/mock-data'

const pimsPartners = [
  { name: 'Avimark', desc: 'Most widely used PIMS in U.S. general practice', color: '#0071E3' },
  { name: 'Cornerstone', desc: 'IDEXX flagship clinic management system', color: '#34C759' },
  { name: 'ezyVet', desc: 'Cloud-based, popular with modern practices', color: '#FF9F0A' },
  { name: 'Shepherd', desc: 'Next-gen PIMS for high-volume clinics', color: '#AF52DE' },
  { name: 'ImproMed', desc: 'Enterprise solution for multi-location groups', color: '#FF3B30' },
  { name: 'VetPace', desc: 'Cloud PIMS with growing U.S. footprint', color: '#5856D6' },
]

const Sidebar = () => (
  <aside style={{ width: 220, flexShrink: 0, background: '#1D1D1F', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
        <Image src="/logo.svg" alt="Honeybee" width={24} height={24} style={{ borderRadius: 5 }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Honeybee</span>
      </Link>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 32 }}>{mockClinic.name}</div>
    </div>
    <nav style={{ flex: 1, padding: '10px 8px' }}>
      {[
        { label: 'Dashboard', icon: '⊞', href: '/clinic' },
        { label: 'Patients', icon: '🐾', href: '/clinic' },
        { label: 'Records', icon: '📋', href: '/clinic' },
        { label: 'Chip Registration', icon: '📡', href: '/clinic' },
        { label: 'AI Summaries', icon: '✨', href: '/clinic' },
        { label: 'PIMS Integrations', icon: '🔗', href: '/clinic/integrations', active: true, badge: 'New' },
        { label: 'Reports', icon: '📊', href: '/clinic' },
        { label: 'Settings', icon: '⚙️', href: '/clinic' },
      ].map(({ label, icon, href, active, badge }) => (
        <Link key={label} href={href} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: active ? 500 : 400 }}>
            <span style={{ width: 18, textAlign: 'center' }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span style={{ fontSize: 10, background: 'var(--blue)', color: 'white', borderRadius: 100, padding: '2px 6px', fontWeight: 600 }}>{badge}</span>}
          </div>
        </Link>
      ))}
    </nav>
    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>{mockClinic.initials}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{mockClinic.doctor}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Clinic Admin</div>
      </div>
    </div>
  </aside>
)

type SyncState = 'idle' | 'syncing' | 'done'

export default function IntegrationsPage() {
  const [syncChip, setSyncChip] = useState<SyncState>('idle')
  const [syncPims, setSyncPims] = useState<SyncState>('idle')

  function handleSync(type: 'chip' | 'pims') {
    if (type === 'chip') {
      setSyncChip('syncing')
      setTimeout(() => setSyncChip('done'), 2000)
    } else {
      setSyncPims('syncing')
      setTimeout(() => setSyncPims('done'), 2200)
    }
  }

  const SyncBtn = ({ type, state }: { type: 'chip' | 'pims'; state: SyncState }) => {
    const isChip = type === 'chip'
    return (
      <button
        onClick={() => state === 'idle' && handleSync(type)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: state === 'done' ? '#E8F8ED' : isChip ? '#1D1D1F' : 'var(--blue)',
          color: state === 'done' ? '#1A7F37' : 'white',
          border: 'none', borderRadius: 10, padding: '11px 20px',
          fontSize: 14, fontWeight: 600, cursor: state === 'idle' ? 'pointer' : 'default',
          fontFamily: 'inherit', transition: 'all 0.2s', minWidth: 190,
        }}
      >
        <span>{state === 'syncing' ? '⏳' : state === 'done' ? '✓' : isChip ? '📡' : '🔄'}</span>
        {state === 'syncing' ? 'Syncing…' : state === 'done' ? 'Synced Successfully' : isChip ? 'Sync Records to Chip' : 'Sync Records to PIMS'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>PIMS Integrations</h1>
            <span className="badge-blue">Seeking Design Partners</span>
          </div>
          {/* Sync buttons in header */}
          <div style={{ display: 'flex', gap: 10 }}>
            <SyncBtn type="chip" state={syncChip} />
            <SyncBtn type="pims" state={syncPims} />
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>

          {/* Architecture */}
          <div className="card" style={{ padding: '28px 32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>How Honeybee fits into your workflow</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
              Honeybee acts as a middleware layer between chip scanning hardware and your existing practice management software. Your team keeps using the tools they know — Honeybee handles identity, records sync, and owner notifications in the background.
            </p>

            {/* Flow diagram */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28, flexWrap: 'wrap' }}>
              {[
                { icon: '📱', label: 'Scanner / Phone', sub: 'NFC tap or ISO 11784/5 reader', bg: 'var(--surface-2)', border: 'var(--border-strong)', color: 'var(--text-primary)' },
              ].map(({ icon, label, sub, bg, border, color }) => (
                <div key={label} style={{ textAlign: 'center', width: 130 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: bg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 10px' }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, color }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{sub}</div>
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
                <div style={{ height: 2, width: 60, background: 'var(--border-strong)', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -5, top: -4, fontSize: 10, color: 'var(--text-tertiary)' }}>▶</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>chip scan</div>
              </div>

              <div style={{ textAlign: 'center', width: 150 }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: '#1D1D1F', border: '2px solid var(--honey)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 0 0 4px rgba(245,166,35,0.15)' }}>
                  <Image src="/logo.svg" alt="Honeybee" width={40} height={40} style={{ borderRadius: 8 }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Honeybee</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Identity, records &amp; routing layer</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 80, alignItems: 'center' }}>
                {['records sync', 'owner alerts'].map(label => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: 2, width: 60, background: 'var(--border-strong)', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: -5, top: -4, fontSize: 10, color: 'var(--text-tertiary)' }}>▶</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', width: 130 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--blue-light)', border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 10px' }}>🏥</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Your PIMS</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Avimark, Cornerstone, ezyVet, etc.</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
                <div style={{ height: 2, width: 60, background: 'var(--border-strong)', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -5, top: -4, fontSize: 10, color: 'var(--text-tertiary)' }}>▶</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>cloud records</div>
              </div>

              <div style={{ textAlign: 'center', width: 120 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FFF3E0', border: '2px solid var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 10px' }}>🐾</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Pet Owner</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>Mobile app &amp; wallet pass</div>
              </div>
            </div>

            {/* Key capabilities */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { icon: '🔄', title: 'Bi-directional sync', desc: 'Records created in your PIMS automatically appear in Honeybee and the owner\'s app.' },
                { icon: '🔑', title: 'No PIMS login needed', desc: 'Honeybee reads chip data and surfaces patient context without requiring staff to switch systems.' },
                { icon: '📡', title: 'Hardware agnostic', desc: 'Works with existing 134.2 kHz scanners and any NFC-enabled smartphone.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PIMS widget mockup */}
          <div className="card" style={{ padding: '28px 32px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>What integration looks like inside your PIMS</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              The Honeybee panel surfaces directly within your existing clinic software — no workflow changes required. Use the sync buttons above to push records in either direction.
            </p>

            <div style={{ border: '1px solid var(--border-strong)', borderRadius: 12, overflow: 'hidden', background: '#F0F0F0' }}>
              <div style={{ background: '#2C3E50', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 5, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>Avimark Practice Management</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Patient Record — Biscuit (Smith)</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: 400 }}>
                {/* Fake PIMS */}
                <div style={{ padding: 20, background: 'white' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 14, background: '#E5E5E5', borderRadius: 4, width: '40%', marginBottom: 8 }} />
                    <div style={{ height: 10, background: '#F0F0F0', borderRadius: 4, width: '70%', marginBottom: 6 }} />
                    <div style={{ height: 10, background: '#F0F0F0', borderRadius: 4, width: '55%' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {[['Species','Canine'],['Breed','Golden Retriever'],['DOB','03/14/2020'],['Weight','32.5 kg'],['Sex','Male'],['Status','Active']].map(([l,v]) => (
                      <div key={l} style={{ background: '#F8F8F8', borderRadius: 6, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: '#999', marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 1, background: '#EAEAEA', marginBottom: 14 }} />
                  <div style={{ height: 14, background: '#E5E5E5', borderRadius: 4, width: '30%', marginBottom: 12 }} />
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height: 36, background: '#F8F8F8', borderRadius: 6, marginBottom: 6, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D0D0D0' }} />
                      <div style={{ height: 10, background: '#E5E5E5', borderRadius: 3, flex: 1 }} />
                      <div style={{ height: 10, background: '#E5E5E5', borderRadius: 3, width: 60 }} />
                    </div>
                  ))}
                </div>

                {/* Honeybee panel */}
                <div style={{ background: '#FAFAFA', borderLeft: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '12px 16px', background: '#1D1D1F', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Image src="/logo.svg" alt="Honeybee" width={18} height={18} style={{ borderRadius: 4 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Honeybee</span>
                    <span className="badge-green" style={{ marginLeft: 'auto', fontSize: 10 }}>● Live</span>
                  </div>
                  <div style={{ flex: 1, padding: '14px 14px 0' }}>
                    {/* Sync buttons inside panel */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      <button onClick={() => handleSync('chip')} style={{ flex: 1, background: syncChip === 'done' ? '#E8F8ED' : '#1D1D1F', color: syncChip === 'done' ? '#1A7F37' : 'white', border: 'none', borderRadius: 8, padding: '8px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {syncChip === 'done' ? '✓ Synced' : syncChip === 'syncing' ? '⏳' : '📡 → Chip'}
                      </button>
                      <button onClick={() => handleSync('pims')} style={{ flex: 1, background: syncPims === 'done' ? '#E8F8ED' : '#0071E3', color: syncPims === 'done' ? '#1A7F37' : 'white', border: 'none', borderRadius: 8, padding: '8px 6px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {syncPims === 'done' ? '✓ Synced' : syncPims === 'syncing' ? '⏳' : '🔄 → PIMS'}
                      </button>
                    </div>
                    <div style={{ background: 'white', borderRadius: 9, padding: 12, marginBottom: 10, border: '1px solid #EBEBEB' }}>
                      <div style={{ fontSize: 11, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Microchip</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#333' }}>985 1410 0234 5678</span>
                        <span className="badge-green" style={{ fontSize: 10 }}>✓</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#999' }}>NFC + 134.2 kHz · Registered</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: 9, padding: 12, marginBottom: 10, border: '1px solid #EBEBEB' }}>
                      <div style={{ fontSize: 11, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Owner</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1D1D1F', marginBottom: 2 }}>John &amp; Lisa Smith</div>
                      <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 8 }}>(801) 555-0192</div>
                      <button style={{ width: '100%', background: '#0071E3', color: 'white', border: 'none', borderRadius: 6, padding: '7px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Send Visit Summary</button>
                    </div>
                    <div style={{ background: 'white', borderRadius: 9, padding: 12, marginBottom: 10, border: '1px solid #EBEBEB' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 12 }}>✨</span>
                        <div style={{ fontSize: 11, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Summary</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>Healthy 6yr Golden Retriever. Vaccines current to Apr 2029. Dental cleaning recommended.</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: 9, padding: 12, border: '1px solid #EBEBEB', marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Sync Status</div>
                      {[['Last synced', syncPims === 'done' ? 'Just now' : '2 min ago'], ['Records synced', '4'], ['Owner notified', 'Yes']].map(([l,v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#6E6E73' }}>{l}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#1D1D1F' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #EBEBEB' }}>
                    <div style={{ fontSize: 11, color: '#AEAEB2', textAlign: 'center' }}>Powered by Honeybee · seehoneybee.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner grid */}
          <div className="card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Integration Partners</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.5 }}>We are actively seeking design partners across major PIMS platforms. Early partners will co-shape the integration specification and get preferred launch access.</p>
              </div>
              <button className="btn-primary" style={{ fontSize: 14, whiteSpace: 'nowrap', flexShrink: 0 }}>Become a Design Partner</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {pimsPartners.map(({ name, desc, color }) => (
                <div key={name} style={{ border: '1px solid var(--border-strong)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color }}>{name[0]}</div>
                    <span style={{ fontSize: 11, color, background: color + '12', borderRadius: 100, padding: '3px 10px', fontWeight: 600 }}>Design Partner Sought</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 12 }}>{desc}</div>
                  <button style={{ border: '1px solid var(--border-strong)', borderRadius: 7, padding: '8px 14px', fontSize: 13, background: 'var(--surface)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Express Interest →</button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
