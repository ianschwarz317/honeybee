'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface ChipData {
  found: boolean
  chip_id?: string
  pet_name?: string
  pet_species?: string
  pet_breed?: string
  pet_color?: string
  pet_photo_url?: string | null
  emergency_contact?: { name?: string; phone?: string; email?: string }
  chip_number?: string
}

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈' }

function NotFoundScreen({ chipNumber }: { chipNumber: string }) {
  return (
    <div style={{ background: '#F2F2F7', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>🐾</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#1C1C1E', marginBottom: 6, textAlign: 'center' }}>Chip Not Registered</div>
      <div style={{ fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 1.5, marginBottom: 20, maxWidth: 220 }}>
        This chip hasn't been linked to a pet profile yet.
      </div>
      <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', width: '100%', marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Chip ID</div>
        <div style={{ fontSize: 12, color: '#1C1C1E', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{chipNumber}</div>
      </div>
      <div style={{ background: '#C8832A', borderRadius: 12, padding: '13px 14px', textAlign: 'center', width: '100%', cursor: 'pointer' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Register with Honeybee</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Protect your pet today</div>
      </div>
    </div>
  )
}

function IOSScreen({ data, chipNumber }: { data: ChipData; chipNumber: string }) {
  const emoji = speciesEmoji[data.pet_species ?? ''] ?? '🐾'
  const contact = data.emergency_contact

  return (
    <div style={{ background: '#F2F2F7', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>

      {/* Safari URL bar */}
      <div style={{ background: '#F2F2F7', padding: '6px 10px 8px' }}>
        <div style={{ background: 'rgba(142,142,147,0.18)', borderRadius: 10, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34C759', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#3A3A3C', flex: 1, textAlign: 'center' }}>honeybee-web.vercel.app</span>
        </div>
      </div>

      <div style={{ padding: '0 12px 20px' }}>
        {/* Scan confirmed */}
        <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E8F8ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📡</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', marginBottom: 1 }}>Honeybee chip detected</div>
            <div style={{ fontSize: 11, color: '#8E8E93', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chipNumber}</div>
          </div>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 8, height: 5, borderLeft: '1.5px solid white', borderBottom: '1.5px solid white', transform: 'rotate(-45deg) translate(1px,-1px)' }} />
          </div>
        </div>

        {/* Pet card */}
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ background: 'linear-gradient(135deg, #C8832A, #9E6520)', height: 4 }} />
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
              {data.pet_photo_url ? (
                <Image
                  src={data.pet_photo_url}
                  alt={data.pet_name ?? 'Pet'}
                  width={56}
                  height={56}
                  style={{ borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#FBF3E8,#F5D49A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {emoji}
                </div>
              )}
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.02em', marginBottom: 2 }}>{data.pet_name}</div>
                <div style={{ fontSize: 13, color: '#8E8E93', marginBottom: 8 }}>
                  {[data.pet_breed, data.pet_color].filter(Boolean).join(' · ')}
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E8F8ED', borderRadius: 100, padding: '3px 8px' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34C759' }} />
                  <span style={{ fontSize: 11, color: '#1A7F37', fontWeight: 600 }}>Registered Chip</span>
                </span>
              </div>
            </div>

            {/* Emergency contact */}
            <div style={{ background: '#F2F2F7', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Owner Contact</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', marginBottom: 2 }}>{contact?.name ?? '—'}</div>
                  <div style={{ fontSize: 13, color: '#3C3C43' }}>{contact?.phone ?? '—'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {contact?.phone && (
                    <>
                      <a href={`tel:${contact.phone}`} style={{ textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📞</div>
                      </a>
                      <a href={`sms:${contact.phone}`} style={{ textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</div>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chip details */}
        <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Chip Details</div>
          {([['Chip ID', chipNumber, true], ['Technology', 'NFC · ISO 11784/5', false]] as const).map(([l, v, mono]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#8E8E93' }}>{l}</span>
              <span style={{ fontSize: 12, color: '#1C1C1E', fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Report safe */}
        <a
          href={contact?.phone ? `sms:${contact.phone}&body=Hi! I found your pet ${data.pet_name ?? 'your pet'} — they're safe. Scanned via Honeybee.` : undefined}
          style={{ display: 'block', textDecoration: 'none', background: '#007AFF', borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,122,255,0.3)' }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Report Pet Safe</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Notify owner this pet has been found</div>
        </a>
      </div>

      <div style={{ padding: '0 12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Image src="/logo.svg" alt="Honeybee" width={13} height={13} style={{ borderRadius: 3, opacity: 0.5 }} />
        <span style={{ fontSize: 11, color: '#AEAEB2' }}>Powered by Honeybee</span>
      </div>
    </div>
  )
}

export default function ChipLookupPage() {
  const params = useParams()
  const chipNumber = Array.isArray(params.chipNumber) ? params.chipNumber[0] : params.chipNumber
  const [data, setData] = useState<ChipData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function lookup() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key || !chipNumber) { setLoading(false); return }

      try {
        const res = await fetch(`${url}/rest/v1/rpc/public_chip_lookup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({ lookup_chip_number: chipNumber }),
        })
        if (!res.ok) throw new Error('Lookup failed')
        const result: ChipData = await res.json()
        setData(result)

        if (result.found && result.chip_id) {
          fetch(`${url}/rest/v1/scan_logs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': key,
              'Authorization': `Bearer ${key}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              chip_id: result.chip_id,
              scanned_at: new Date().toISOString(),
              scanner_info: { type: 'web' },
              notified_owner: false,
            }),
          }).catch(() => {})
        }
      } catch {
        setData({ found: false, chip_number: chipNumber })
      } finally {
        setLoading(false)
      }
    }
    lookup()
  }, [chipNumber])

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 20%, #1a2a4a 0%, #0d1117 60%, #000 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '7px 16px', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: loading ? '#F5A623' : data?.found ? '#34C759' : '#FF3B30', display: 'inline-block', boxShadow: loading ? '0 0 6px #F5A623' : data?.found ? '0 0 6px #34C759' : '0 0 6px #FF3B30' }} />
          {loading ? 'Looking up chip…' : data?.found ? 'Pet found — NFC Scan' : 'Chip not registered'}
        </div>
      </div>

      {/* iPhone shell */}
      <div style={{ position: 'relative', filter: 'drop-shadow(0 50px 100px rgba(0,0,0,0.7))' }}>
        <div style={{ position: 'absolute', left: -4, top: 88, width: 4, height: 28, background: '#2A2A2A', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', left: -4, top: 128, width: 4, height: 52, background: '#2A2A2A', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', left: -4, top: 192, width: 4, height: 52, background: '#2A2A2A', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', right: -4, top: 148, width: 4, height: 68, background: '#2A2A2A', borderRadius: '0 3px 3px 0' }} />

        <div style={{ width: 320, background: '#1C1C1E', borderRadius: 50, padding: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ background: '#F2F2F7', borderRadius: 38, overflow: 'hidden', height: 620, overflowY: loading ? 'hidden' : 'auto' }}>
            {/* Dynamic Island + status bar */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F2F2F7', paddingBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 2 }}>
                <div style={{ width: 110, height: 32, background: '#1C1C1E', borderRadius: 20 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 22px 0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.02em' }}>9:41</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="#1C1C1E"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4.5" y="2" width="3" height="10" rx="1"/><rect x="9" y="0.5" width="3" height="11.5" rx="1"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" opacity="0.3"/></svg>
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="#1C1C1E"><path d="M7.5 2.5C9.5 2.5 11.3 3.3 12.6 4.6L14 3.2C12.3 1.5 10 0.5 7.5 0.5C5 0.5 2.7 1.5 1 3.2L2.4 4.6C3.7 3.3 5.5 2.5 7.5 2.5Z"/><path d="M7.5 5.5C8.8 5.5 10 6 10.9 6.9L12.3 5.5C11 4.2 9.3 3.5 7.5 3.5C5.7 3.5 4 4.2 2.7 5.5L4.1 6.9C5 6 6.2 5.5 7.5 5.5Z"/><circle cx="7.5" cy="9.5" r="1.5"/></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#1C1C1E" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="17" height="9" rx="2" fill="#1C1C1E"/><path d="M23 4v4a2 2 0 000-4z" fill="#1C1C1E" fillOpacity="0.4"/></svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 480 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1E', marginBottom: 6 }}>Looking up chip…</div>
                <div style={{ fontSize: 12, color: '#8E8E93', fontFamily: 'monospace' }}>{chipNumber}</div>
              </div>
            ) : !data || !data.found ? (
              <NotFoundScreen chipNumber={chipNumber ?? ''} />
            ) : (
              <IOSScreen data={data} chipNumber={chipNumber ?? ''} />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 100, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 100 }} />
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
        <Link href="/scan" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Scan another chip</Link>
        <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
      </div>
    </main>
  )
}
