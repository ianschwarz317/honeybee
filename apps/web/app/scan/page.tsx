'use client'
import Link from 'next/link'
import Image from 'next/image'
import { mockPet } from '@/lib/mock-data'

// Realistic iOS screen content - looks like Safari on iPhone
function iOSScreen({ pet }: { pet: typeof mockPet }) {
  return (
    <div style={{ background: '#F2F2F7', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>

      {/* Safari URL bar area */}
      <div style={{ background: '#F2F2F7', padding: '6px 10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, background: 'rgba(142,142,147,0.18)', borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34C759', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#3A3A3C', flex: 1, textAlign: 'center', fontWeight: 400, letterSpacing: 0 }}>scan.seehoneybee.com</span>
          <div style={{ width: 10, height: 10, flexShrink: 0 }} />
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: '0 12px 20px' }}>

        {/* NFC confirmation banner */}
        <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E8F8ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📡</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', marginBottom: 1 }}>Honeybee Pet ID Detected</div>
            <div style={{ fontSize: 11, color: '#8E8E93' }}>NFC · 134.2 kHz chip scan</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 8, height: 6, borderLeft: '1.5px solid white', borderBottom: '1.5px solid white', transform: 'rotate(-45deg) translate(1px, -1px)' }} />
          </div>
        </div>

        {/* Pet card */}
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {/* Top strip */}
          <div style={{ background: 'linear-gradient(135deg, #F5A623, #E8900A)', height: 4 }} />
          <div style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #FFF3CD, #FFD966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>🐕</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.02em', marginBottom: 2 }}>{pet.name}</div>
                <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 8 }}>{pet.breed} · {pet.sex}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E8F8ED', borderRadius: 100, padding: '3px 8px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34C759' }} />
                  <span style={{ fontSize: 11, color: '#1A7F37', fontWeight: 600 }}>Registered Chip</span>
                </div>
              </div>
            </div>

            {/* Owner section */}
            <div style={{ background: '#F2F2F7', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Owner Contact</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', marginBottom: 2 }}>{pet.owner_name}</div>
                  <div style={{ fontSize: 13, color: '#3C3C43' }}>{pet.owner_phone}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[{ icon: '📞', bg: '#34C759' }, { icon: '💬', bg: '#007AFF' }].map(({ icon, bg }) => (
                    <div key={bg} style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }}>{icon}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chip info */}
        <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chip Details</div>
            <div style={{ fontSize: 10, color: '#8E8E93' }}>ISO 11784/5</div>
          </div>
          {[
            ['Chip ID', pet.chip_number, true],
            ['Registered at', pet.vet_clinic, false],
          ].map(([label, value, mono]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#8E8E93' }}>{label}</span>
              <span style={{ fontSize: 12, color: '#1C1C1E', fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.04em' : 0 }}>{String(value)}</span>
            </div>
          ))}
        </div>

        {/* Report safe */}
        <div style={{ background: '#007AFF', borderRadius: 12, padding: '14px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,122,255,0.3)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Report Pet Safe</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Notify owner this pet has been found</div>
        </div>
      </div>

      {/* Powered by footer */}
      <div style={{ padding: '0 12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Image src="/logo.svg" alt="Honeybee" width={14} height={14} style={{ borderRadius: 3, opacity: 0.5 }} />
        <span style={{ fontSize: 11, color: '#AEAEB2' }}>Powered by Honeybee · seehoneybee.com</span>
      </div>
    </div>
  )
}

export default function ScanPage() {
  const pet = mockPet

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1a2a4a 0%, #0d1117 60%, #000 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {/* Label */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '7px 16px', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759', display: 'inline-block', boxShadow: '0 0 6px #34C759' }} />
          NFC Chip Scan — Lost Pet Recovery
        </div>
      </div>

      {/* iPhone shell */}
      <div style={{ position: 'relative', filter: 'drop-shadow(0 50px 100px rgba(0,0,0,0.7))' }}>
        {/* Physical buttons */}
        <div style={{ position: 'absolute', left: -4, top: 88, width: 4, height: 28, background: '#2A2A2A', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', left: -4, top: 128, width: 4, height: 52, background: '#2A2A2A', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', left: -4, top: 192, width: 4, height: 52, background: '#2A2A2A', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', right: -4, top: 148, width: 4, height: 68, background: '#2A2A2A', borderRadius: '0 3px 3px 0' }} />

        {/* Phone body */}
        <div style={{
          width: 320,
          background: '#1C1C1E',
          borderRadius: 50,
          padding: '14px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Screen */}
          <div style={{
            background: '#F2F2F7',
            borderRadius: 38,
            overflow: 'hidden',
            position: 'relative',
            height: 620,
            overflowY: 'auto',
          }}>
            {/* Dynamic Island */}
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: '#F2F2F7',
              paddingBottom: 4,
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 2 }}>
                <div style={{ width: 110, height: 32, background: '#1C1C1E', borderRadius: 20 }} />
              </div>
              {/* Status bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 22px 0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.02em' }}>9:41</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="#1C1C1E"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4.5" y="2" width="3" height="10" rx="1"/><rect x="9" y="0.5" width="3" height="11.5" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" opacity="0.3"/></svg>
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="#1C1C1E"><path d="M7.5 2.5C9.5 2.5 11.3 3.3 12.6 4.6L14 3.2C12.3 1.5 10 0.5 7.5 0.5C5 0.5 2.7 1.5 1 3.2L2.4 4.6C3.7 3.3 5.5 2.5 7.5 2.5Z"/><path d="M7.5 5.5C8.8 5.5 10 6 10.9 6.9L12.3 5.5C11 4.2 9.3 3.5 7.5 3.5C5.7 3.5 4 4.2 2.7 5.5L4.1 6.9C5 6 6.2 5.5 7.5 5.5Z"/><circle cx="7.5" cy="9.5" r="1.5"/></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#1C1C1E" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="17" height="9" rx="2" fill="#1C1C1E"/><path d="M23 4v4a2 2 0 000-4z" fill="#1C1C1E" fillOpacity="0.4"/></svg>
                </div>
              </div>
            </div>

            {/* iOS page content */}
            <iOSScreen pet={pet} />
          </div>
        </div>

        {/* Home indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 100, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 100 }} />
        </div>
      </div>

      {/* Back link */}
      <div style={{ marginTop: 28 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 18px' }}>
          <Image src="/logo.svg" alt="Honeybee" width={16} height={16} style={{ borderRadius: 3, opacity: 0.7 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Powered by Honeybee</span>
        </Link>
      </div>
    </main>
  )
}
