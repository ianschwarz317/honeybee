'use client'
import Link from 'next/link'
import Image from 'next/image'
import { mockPet } from '@/lib/mock-data'

export default function ScanPage() {
  const pet = mockPet
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Scene label */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 16px', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34C759', display: 'inline-block', boxShadow: '0 0 8px #34C759' }} />
          NFC Chip Detected — Live Scan Simulation
        </div>
      </div>

      {/* Phone frame */}
      <div style={{ position: 'relative', width: 340, filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.6))' }}>
        {/* Phone outer shell */}
        <div style={{ background: '#1C1C1E', borderRadius: 52, padding: 12, border: '1px solid rgba(255,255,255,0.12)', position: 'relative' }}>
          {/* Side buttons */}
          <div style={{ position: 'absolute', left: -3, top: 100, width: 3, height: 32, background: '#3A3A3C', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', left: -3, top: 144, width: 3, height: 56, background: '#3A3A3C', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', left: -3, top: 210, width: 3, height: 56, background: '#3A3A3C', borderRadius: '2px 0 0 2px' }} />
          <div style={{ position: 'absolute', right: -3, top: 160, width: 3, height: 72, background: '#3A3A3C', borderRadius: '0 2px 2px 0' }} />

          {/* Screen */}
          <div style={{ background: '#F5F5F7', borderRadius: 42, overflow: 'hidden', minHeight: 660, position: 'relative' }}>
            {/* Dynamic Island */}
            <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 120, height: 34, background: '#1C1C1E', borderRadius: 20, zIndex: 10 }} />

            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px 0', paddingTop: 56 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>9:41</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#1D1D1F' }}>●●●</span>
                <span style={{ fontSize: 11, color: '#1D1D1F' }}>WiFi</span>
                <span style={{ fontSize: 11, color: '#1D1D1F' }}>🔋</span>
              </div>
            </div>

            {/* NFC scan animation ring */}
            <div style={{ textAlign: 'center', padding: '18px 0 12px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F8ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'relative', zIndex: 2 }}>📡</div>
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(52,199,89,0.3)', animation: 'ping 2s ease infinite' }} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1D1D1F', marginTop: 10, marginBottom: 2 }}>Pet Found!</div>
              <div style={{ fontSize: 13, color: '#6E6E73' }}>Honeybee chip scanned</div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 16px 24px' }}>
              {/* Pet card */}
              <div style={{ background: 'white', borderRadius: 18, padding: '16px', marginBottom: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#FFF3CD,#FFD966)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🐕</div>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: '#1D1D1F' }}>{pet.name}</div>
                    <div style={{ fontSize: 13, color: '#6E6E73' }}>{pet.breed}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E8F8ED', color: '#1A7F37', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 600, marginTop: 3 }}>✓ Registered</div>
                  </div>
                </div>
                <div style={{ background: '#F5F5F7', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#AEAEB2', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Owner</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>{pet.owner_name}</div>
                  <div style={{ fontSize: 13, color: '#6E6E73' }}>{pet.owner_phone}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, background: '#34C759', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    📞 Call Now
                  </button>
                  <button style={{ flex: 1, background: '#0071E3', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    💬 Message
                  </button>
                </div>
              </div>

              {/* Chip info */}
              <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#AEAEB2', fontWeight: 500 }}>CHIP ID</span>
                  <span style={{ fontSize: 12, color: '#6E6E73' }}>NFC + 134.2 kHz</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#1D1D1F', letterSpacing: '0.08em' }}>985 1410 0234 5678</div>
              </div>
            </div>

            {/* Home indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
              <div style={{ width: 120, height: 5, background: '#1D1D1F', borderRadius: 100, opacity: 0.2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '8px 16px' }}>
          <Image src="/logo.svg" alt="Honeybee" width={18} height={18} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Powered by Honeybee</span>
        </Link>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </main>
  )
}
