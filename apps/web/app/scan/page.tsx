'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type ScanState = 'idle' | 'scanning' | 'error' | 'manual'

export default function ScanPage() {
  const router = useRouter()
  const [state, setState] = useState<ScanState>('idle')
  const [error, setError] = useState('')
  const [manualChip, setManualChip] = useState('')
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)
    setNfcSupported(!ios && 'NDEFReader' in window)
  }, [])

  async function startScan() {
    setState('scanning')
    setError('')
    try {
      // @ts-expect-error - Web NFC API not in TS types yet
      const ndef = new NDEFReader()
      await ndef.scan()
      // @ts-expect-error
      ndef.onreading = ({ message, serialNumber }: { message: unknown; serialNumber: string }) => {
        // Try to extract chip number from serial or NDEF records
        let chipId = ''

        // Check NDEF records first
        // @ts-expect-error
        for (const record of message.records) {
          if (record.recordType === 'url') {
            const decoder = new TextDecoder()
            const url = decoder.decode(record.data)
            const match = url.match(/\/scan\/(\d{15})/) || url.match(/chip=(\d{15})/)
            if (match) { chipId = match[1]; break }
          }
          if (record.recordType === 'text') {
            const decoder = new TextDecoder()
            const text = decoder.decode(record.data)
            if (/^\d{15}$/.test(text.trim())) { chipId = text.trim(); break }
          }
        }

        // Fallback to NFC serial number (strip colons, take digits)
        if (!chipId && serialNumber) {
          chipId = serialNumber.replace(/[^0-9A-Fa-f]/g, '')
        }

        if (chipId) {
          router.push(`/scan/${chipId}`)
        } else {
          setError('Could not read chip ID. Try entering it manually.')
          setState('error')
        }
      }
      // @ts-expect-error
      ndef.onreadingerror = () => {
        setError('Error reading chip. Please try again.')
        setState('error')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Scan failed'
      if (msg.includes('denied') || msg.includes('permission')) {
        setError('NFC permission denied. Please allow NFC access and try again.')
      } else {
        setError(msg)
      }
      setState('error')
    }
  }

  function submitManual() {
    const chip = manualChip.replace(/\s/g, '')
    if (chip.length < 9) { setError('Please enter a valid chip number'); return }
    router.push(`/scan/${chip}`)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 20%, #1a2a4a 0%, #0d1117 60%, #000 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/logo.svg" alt="Honeybee" width={48} height={48} style={{ borderRadius: 12, marginBottom: 12 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4, letterSpacing: '-0.02em' }}>Honeybee Chip Scanner</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Scan or enter a chip to look up a pet</p>
        </div>

        {/* Main card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>

          {/* iOS instructions */}
          {isIOS && (
            <div style={{ background: 'rgba(0,122,255,0.15)', border: '1px solid rgba(0,122,255,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#60A5FA', marginBottom: 4 }}>📱 iPhone NFC</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Hold the top of your iPhone near the Honeybee chip. iOS will automatically open the chip&apos;s page. Or enter the chip number below.
              </div>
            </div>
          )}

          {/* Android NFC button */}
          {!isIOS && nfcSupported !== false && (
            <div style={{ marginBottom: 20 }}>
              {state === 'idle' && (
                <button onClick={startScan} style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: 12, padding: '16px', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>📡</span> Scan NFC Chip
                </button>
              )}
              {state === 'scanning' && (
                <div style={{ width: '100%', background: 'rgba(0,113,227,0.2)', border: '2px solid #0071E3', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📡</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>Ready to scan</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Hold your device near the Honeybee chip</div>
                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071E3', animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              {state === 'error' && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, color: '#FF6B6B' }}>{error}</div>
                  </div>
                  <button onClick={startScan} style={{ width: '100%', background: '#0071E3', border: 'none', borderRadius: 12, padding: '14px', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {!isIOS && nfcSupported !== false && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>or enter manually</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            </div>
          )}

          {/* Manual entry */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 8 }}>Chip number</label>
            <input
              value={manualChip}
              onChange={e => setManualChip(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitManual()}
              placeholder="e.g. 985141002345678"
              maxLength={20}
              style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: 15, fontFamily: 'monospace', color: 'white', outline: 'none', boxSizing: 'border-box', letterSpacing: '0.04em' }}
            />
            {error && state !== 'scanning' && (
              <div style={{ fontSize: 12, color: '#FF6B6B', marginTop: 6 }}>{error}</div>
            )}
            <button onClick={submitManual} style={{ width: '100%', marginTop: 10, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px', color: 'white', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Look up chip →
            </button>
          </div>

          {/* Demo shortcut */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Demo</div>
            <button onClick={() => router.push('/scan/985141002345678')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}>
              View demo chip scan →
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>← Back to portal</Link>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
    </main>
  )
}
