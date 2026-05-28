'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const recordTypeLabel: Record<string, string> = {
  vaccination: 'Vaccine',
  exam: 'Exam',
  prescription: 'Prescription',
  lab: 'Lab',
}

function RecordModal({ record, onClose }: { record: any; onClose: () => void }) {
  const label = recordTypeLabel[record.record_type] ?? 'Record'
  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'#FFFFFF', borderRadius:'8px 8px 0 0', padding:'32px 24px 48px', width:'100%', maxWidth:560, animation:'slideUp 0.15s ease-out both' }}
      >
        <div style={{ width:32, height:4, borderRadius:2, background:'#EBEBEB', margin:'0 auto 28px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:500 }}>{label}</span>
          <span style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(record.record_date)}</span>
        </div>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:12, letterSpacing:'-0.02em', color:'#0A0A0A' }}>{record.title}</h2>
        <p style={{ fontSize:15, color:'#6B7280', lineHeight:1.7, marginBottom:20 }}>{record.content}</p>
        {record.metadata && Object.keys(record.metadata).filter((k: string) => k !== 'author').length > 0 && (
          <div style={{ background:'#F4F4F5', borderRadius:8, padding:'14px 16px', marginBottom:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
            {Object.entries(record.metadata).filter(([k]) => k !== 'author').map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:11, color:'#6B7280', fontWeight:500, textTransform:'capitalize', marginBottom:2 }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:500, color:'#0A0A0A' }}>{String(v)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize:13, color:'#6B7280', marginBottom:24 }}>{record.metadata?.author || 'Summit Animal Hospital'}</div>
        <button
          onClick={onClose}
          style={{ width:'100%', height:44, background:'#F4F4F5', border:'none', borderRadius:8, fontSize:15, fontWeight:500, cursor:'pointer', color:'#0A0A0A', fontFamily:'inherit' }}
        >
          Close
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>
    </div>
  )
}

function Sidebar({ user }: { user: any }) {
  const router = useRouter()
  const initials = (user?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()

  const navItems = [
    { label: 'Overview', active: true },
    { label: 'Medical Records', active: false },
    { label: 'Scan History', active: false },
    { label: 'Wallet', active: false },
  ]

  return (
    <aside style={{ width:220, flexShrink:0, background:'#FFFFFF', borderRight:'1px solid #EBEBEB', display:'flex', flexDirection:'column', minHeight:'100vh', position:'sticky', top:0 }}>
      <div style={{ padding:'20px 16px', borderBottom:'1px solid #EBEBEB' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#E8820C"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:15, color:'#0A0A0A', letterSpacing:'-0.02em' }}>Honeybee</span>
        </Link>
      </div>
      <nav style={{ flex:1, padding:'8px' }}>
        {navItems.map(({ label, active }) => (
          <div
            key={label}
            style={{ display:'flex', alignItems:'center', padding:'8px 12px', paddingLeft: active ? '10px' : '12px', borderRadius:6, marginBottom:2, color: active ? '#0A0A0A' : '#6B7280', fontSize:14, fontWeight: active ? 500 : 400, cursor:'pointer', borderLeft: active ? '2px solid #E8820C' : '2px solid transparent', transition:'color 0.15s ease-out' }}
          >
            {label}
          </div>
        ))}
      </nav>
      <div style={{ padding:'16px', borderTop:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'white', flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.full_name || 'User'}</div>
          <div style={{ fontSize:11, color:'#6B7280' }}>Pet Owner</div>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))}
          title="Sign out"
          style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:14, padding:'4px', flexShrink:0, lineHeight:1, fontFamily:'inherit' }}
        >↪</button>
      </div>
    </aside>
  )
}

export default function OwnerPortal() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [pet, setPet] = useState<any>(null)
  const [chip, setChip] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [scans, setScans] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [walletLoading, setWalletLoading] = useState(false)
  const sessionTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
    if (!authLoading && user && (user.role === 'clinic_admin' || user.role === 'clinic_staff')) router.replace('/clinic')
  }, [user, authLoading, router])

  async function downloadAppleWallet() {
    const token = sessionTokenRef.current
    if (!token || walletLoading) return
    setWalletLoading(true)
    try {
      const res = await fetch('/api/wallet/apple', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 503) {
        alert('Apple Wallet is not yet configured. Check back soon!')
        return
      }
      if (!res.ok) throw new Error('Pass generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pet?.name ?? 'pet'}-pet-id.pkpass`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Apple Wallet error:', e)
      alert('Could not generate pass. Please try again.')
    } finally {
      setWalletLoading(false)
    }
  }

  async function fetchSummary(petId: string, token: string) {
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ petId }),
      })
      if (!res.ok) throw new Error('Summary request failed')
      const { summary } = await res.json()
      setAiSummary(summary)
    } catch (e) {
      console.error('AI summary error:', e)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    async function load() {
      setDataLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setDataLoading(false); return }
        const uid = session.user.id
        sessionTokenRef.current = session.access_token

        const { data: petsData } = await supabase
          .from('pets').select('*')
          .eq('owner_id', uid).eq('is_active', true)
          .order('created_at', { ascending: false }).limit(1)
        if (!petsData || petsData.length === 0) { setDataLoading(false); return }
        const p = petsData[0]
        setPet(p)
        fetchSummary(p.id, session.access_token)

        const { data: chipsData } = await supabase
          .from('chips').select('*').eq('pet_id', p.id).limit(1)
        const c = chipsData?.[0] ?? null
        setChip(c)

        const { data: recs } = await supabase
          .from('medical_records').select('*')
          .eq('pet_id', p.id).eq('is_visible_to_owner', true)
          .order('record_date', { ascending: false })
        setRecords(recs ?? [])

        if (c?.id) {
          const { data: scanData } = await supabase
            .from('scan_logs').select('*').eq('chip_id', c.id)
            .order('scanned_at', { ascending: false }).limit(5)
          setScans(scanData ?? [])
        }
      } catch (e) { console.error(e) }
      finally { setDataLoading(false) }
    }
    load()
  }, [user])

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:40, textAlign:'center' }}>
        <h2 style={{ fontSize:22, fontWeight:700 }}>No pet found</h2>
        <p style={{ color:'#6B7280', fontSize:15, maxWidth:280 }}>No pets are linked to this account yet.</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))} className="btn-secondary" style={{ marginTop:8 }}>Sign out</button>
      </div>
    )
  }

  const chipNum = chip?.chip_number || ''
  const chipFormatted = chipNum.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  const petAge = new Date().getFullYear() - new Date(pet.date_of_birth).getFullYear()

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      {selectedRecord && <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <Sidebar user={user} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'auto' }}>
        <main style={{ padding:'40px 40px 80px', maxWidth:720, width:'100%' }}>

          {/* Pet header */}
          <div className="fade-up" style={{ marginBottom:32 }}>
            <h1 style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom:6 }}>{pet.name}</h1>
            <p style={{ fontSize:15, color:'#6B7280' }}>{pet.breed} &middot; {pet.color} &middot; {petAge} yrs</p>
          </div>

          {/* Stats row */}
          <div className="fade-up delay-1" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
            {[
              { label:'Records', value:records.length },
              { label:'Scans', value:scans.length },
              { label:'Years old', value:petAge },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:8, padding:'20px' }}>
                <div style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.02em', color:'#0A0A0A', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:13, color:'#6B7280', marginTop:8, fontWeight:500 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Chip card */}
          <div className="fade-up delay-2" style={{ background:'#0A0A0A', borderRadius:8, padding:'24px', marginBottom:32 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Microchip</div>
                <div style={{ fontSize:18, fontWeight:600, color:'white', letterSpacing:'-0.01em' }}>{pet.name}</div>
              </div>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.1)', borderRadius:4, padding:'3px 8px', fontWeight:500 }}>Active</span>
            </div>
            <div style={{ fontFamily:"'SF Mono', 'Fira Code', monospace", fontSize:18, color:'white', letterSpacing:'0.1em', marginBottom:24, fontWeight:400 }}>
              {chipFormatted || '— — — —'}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>NFC · 134.2 kHz · ISO 11784/5</div>
          </div>

          {/* Emergency contact */}
          <div className="fade-up delay-2" style={{ background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:8, padding:'18px 20px', marginBottom:32, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div className="section-label" style={{ marginBottom:4 }}>Emergency Contact</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#0A0A0A' }}>{chip?.emergency_contact?.name || user?.full_name || 'Ian Schwarz'}</div>
              <div style={{ fontSize:14, color:'#6B7280', marginTop:2 }}>{chip?.emergency_contact?.phone || '(801) 555-0192'}</div>
            </div>
            <a
              href={`tel:${(chip?.emergency_contact?.phone || '8015550192').replace(/\D/g,'')}`}
              style={{ height:36, padding:'0 16px', border:'1px solid #EBEBEB', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:'#0A0A0A', textDecoration:'none', flexShrink:0, transition:'border-color 0.15s ease-out' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB' }}
            >
              Call
            </a>
          </div>

          {/* AI summary */}
          <div className="fade-up delay-3" style={{ borderTop:'1px solid #EBEBEB', borderRight:'1px solid #EBEBEB', borderBottom:'1px solid #EBEBEB', borderLeft:'3px solid #E8820C', borderRadius:8, padding:'20px 24px', marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div className="section-label" style={{ marginBottom:0 }}>Health Summary</div>
              <button
                onClick={() => pet && sessionTokenRef.current && fetchSummary(pet.id, sessionTokenRef.current)}
                disabled={summaryLoading}
                style={{ fontSize:12, color:'#6B7280', background:'none', border:'none', cursor: summaryLoading ? 'default' : 'pointer', padding:'2px 0', fontFamily:'inherit' }}
              >
                {summaryLoading ? 'Generating…' : 'Regenerate'}
              </button>
            </div>
            {summaryLoading && !aiSummary ? (
              <p style={{ fontSize:15, color:'#6B7280', lineHeight:1.75, fontStyle:'italic' }}>Generating health brief…</p>
            ) : aiSummary ? (
              <p style={{ fontSize:15, color:'#6B7280', lineHeight:1.75 }}>{aiSummary}</p>
            ) : (
              <p style={{ fontSize:15, color:'#6B7280', lineHeight:1.75, fontStyle:'italic' }}>Health summary unavailable.</p>
            )}
          </div>

          {/* Medical records */}
          <div className="fade-up delay-4" style={{ marginBottom:40 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div className="section-label" style={{ marginBottom:0 }}>Medical Records</div>
              <span style={{ fontSize:13, color:'#6B7280' }}>{records.length} total</span>
            </div>
            <div>
              {records.map((rec: any) => {
                const label = recordTypeLabel[rec.record_type] ?? 'Record'
                return (
                  <div key={rec.id} className="record-row" onClick={() => setSelectedRecord(rec)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1, minWidth:0, paddingRight:16 }}>
                        <div style={{ marginBottom:6 }}>
                          <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:500 }}>{label}</span>
                        </div>
                        <div style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.01em', marginBottom:4, color:'#0A0A0A' }}>{rec.title}</div>
                        <div style={{ fontSize:14, color:'#6B7280', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{rec.content}</div>
                      </div>
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <div style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(rec.record_date)}</div>
                        <div style={{ fontSize:18, color:'#D1D5DB', marginTop:6 }}>›</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scan log */}
          {scans.length > 0 && (
            <div className="fade-up delay-4" style={{ marginBottom:40 }}>
              <div className="section-label">Scan History</div>
              <div style={{ border:'1px solid #EBEBEB', borderRadius:8, overflow:'hidden' }}>
                {scans.map((s: any, i: number) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom: i < scans.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                    <span style={{ fontSize:14, color:'#0A0A0A', fontWeight:500 }}>{s.location?.label || s.location?.city || 'Unknown location'}</span>
                    <span style={{ fontSize:13, color:'#6B7280' }}>{fmtDT(s.scanned_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet */}
          <div className="fade-up delay-5" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button
              onClick={downloadAppleWallet}
              disabled={walletLoading}
              style={{ width:'100%', background:'#000000', borderRadius:8, border:'none', cursor: walletLoading ? 'default' : 'pointer', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span style={{ color: walletLoading ? 'rgba(255,255,255,0.5)' : 'white', fontSize:15, fontWeight:600, fontFamily:'inherit' }}>
                {walletLoading ? 'Generating…' : 'Add to Apple Wallet'}
              </span>
            </button>
            <button
              disabled
              style={{ width:'100%', background:'#FFFFFF', borderRadius:8, border:'1px solid #EBEBEB', cursor:'not-allowed', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#D1D5DB">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              <span style={{ color:'#D1D5DB', fontSize:15, fontWeight:600, fontFamily:'inherit' }}>
                Google Wallet — Coming Soon
              </span>
            </button>
          </div>

        </main>
      </div>
    </div>
  )
}
