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

function NavIcon({ name, color }: { name: string; color: string }) {
  const s = { width:20, height:20, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:'1.5', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name === 'home')   return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (name === 'file')   return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (name === 'clock')  return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  if (name === 'wallet') return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  return null
}

function RecordModal({ record, onClose }: { record: any; onClose: () => void }) {
  const label = recordTypeLabel[record.record_type] ?? 'Record'
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#FFFFFF', borderRadius:'8px 8px 0 0', padding:'32px 24px 48px', width:'100%', maxWidth:560, animation:'slideUp 0.15s ease-out both' }}>
        <div style={{ width:32, height:4, borderRadius:2, background:'#EBEBEB', margin:'0 auto 28px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:500 }}>{label}</span>
          <span style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(record.record_date)}</span>
        </div>
        <h2 style={{ fontSize:20, fontWeight:600, marginBottom:12, letterSpacing:'-0.02em', color:'#0A0A0A' }}>{record.title}</h2>
        <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.7, marginBottom:20 }}>{record.content}</p>
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
        <button onClick={onClose} style={{ width:'100%', height:44, background:'#F4F4F5', border:'none', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', color:'#0A0A0A', fontFamily:'inherit' }}>Close</button>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>
    </div>
  )
}

function Sidebar({ user }: { user: any }) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const initials = (user?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const nav = [
    { label:'Overview',        icon:'home'   },
    { label:'Medical Records', icon:'file'   },
    { label:'Scan History',    icon:'clock'  },
    { label:'Wallet',          icon:'wallet' },
  ]
  return (
    <aside style={{ width:240, flexShrink:0, background:'#FFFFFF', borderRight:'1px solid #EBEBEB', display:'flex', flexDirection:'column', minHeight:'100vh', position:'sticky', top:0 }}>
      <div style={{ padding:'20px 20px 18px', borderBottom:'1px solid #EBEBEB' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#E8820C"/></svg>
          <span style={{ fontWeight:700, fontSize:14, color:'#0A0A0A', letterSpacing:'-0.02em' }}>Honeybee</span>
        </Link>
      </div>
      <nav style={{ flex:1, padding:'8px 12px' }}>
        {nav.map(({ label, icon }, i) => {
          const active = i === 0
          return (
            <div key={label} onMouseEnter={() => setHovered(label)} onMouseLeave={() => setHovered(null)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', paddingLeft: active ? '14px' : '16px', borderRadius:8, marginBottom:2, color: active ? '#0A0A0A' : '#6B7280', fontSize:14, fontWeight: active ? 500 : 400, cursor:'pointer', borderLeft: active ? '2px solid #E8820C' : '2px solid transparent', background: !active && hovered === label ? '#F4F4F5' : 'transparent', transition:'background 0.15s ease-out' }}>
              <NavIcon name={icon} color={active ? '#0A0A0A' : '#9CA3AF'} />
              <span>{label}</span>
            </div>
          )
        })}
      </nav>
      <div style={{ padding:'16px', borderTop:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'white', flexShrink:0 }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.full_name || 'User'}</div>
          <div style={{ fontSize:11, color:'#6B7280' }}>Pet Owner</div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))} title="Sign out" style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:14, padding:'4px', flexShrink:0, lineHeight:1, fontFamily:'inherit' }}>↪</button>
      </div>
    </aside>
  )
}

type OwnerTab = 'overview' | 'records' | 'scans'

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
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview')
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
      const res = await fetch('/api/wallet/apple', { method:'POST', headers:{ Authorization:`Bearer ${token}` } })
      if (res.status === 503) { alert('Apple Wallet is not yet configured. Check back soon!'); return }
      if (!res.ok) throw new Error('Pass generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${pet?.name ?? 'pet'}-pet-id.pkpass`; a.click()
      URL.revokeObjectURL(url)
    } catch (e) { console.error(e); alert('Could not generate pass. Please try again.') }
    finally { setWalletLoading(false) }
  }

  async function fetchSummary(petId: string, token: string) {
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/summarize', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify({ petId }) })
      if (!res.ok) throw new Error('Summary failed')
      const { summary } = await res.json()
      setAiSummary(summary)
    } catch (e) { console.error(e) }
    finally { setSummaryLoading(false) }
  }

  useEffect(() => {
    if (!user) return
    async function load() {
      setDataLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setDataLoading(false); return }
        sessionTokenRef.current = session.access_token
        const { data: petsData } = await supabase.from('pets').select('*').eq('owner_id', session.user.id).eq('is_active', true).order('created_at', { ascending:false }).limit(1)
        if (!petsData?.length) { setDataLoading(false); return }
        const p = petsData[0]; setPet(p)
        fetchSummary(p.id, session.access_token)
        const { data: chipsData } = await supabase.from('chips').select('*').eq('pet_id', p.id).limit(1)
        setChip(chipsData?.[0] ?? null)
        const { data: recs } = await supabase.from('medical_records').select('*').eq('pet_id', p.id).eq('is_visible_to_owner', true).order('record_date', { ascending:false })
        setRecords(recs ?? [])
        if (chipsData?.[0]?.id) {
          const { data: scanData } = await supabase.from('scan_logs').select('*').eq('chip_id', chipsData[0].id).order('scanned_at', { ascending:false }).limit(10)
          setScans(scanData ?? [])
        }
      } catch (e) { console.error(e) }
      finally { setDataLoading(false) }
    }
    load()
  }, [user])

  if (authLoading || dataLoading) {
    return <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" /></div>
  }

  if (!pet) {
    return (
      <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, padding:40, textAlign:'center' }}>
        <h2 style={{ fontSize:22, fontWeight:600 }}>No pet found</h2>
        <p style={{ color:'#6B7280', fontSize:14, maxWidth:280 }}>No pets are linked to this account yet.</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))} className="btn-secondary" style={{ marginTop:8 }}>Sign out</button>
      </div>
    )
  }

  const chipNum = chip?.chip_number || ''
  const chipFormatted = chipNum.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  const petAge = new Date().getFullYear() - new Date(pet.date_of_birth).getFullYear()
  const tabs: { id: OwnerTab; label: string }[] = [
    { id:'overview', label:'Overview' },
    { id:'records',  label:`Records${records.length ? ` · ${records.length}` : ''}` },
    { id:'scans',    label:`Scans${scans.length ? ` · ${scans.length}` : ''}` },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      {selectedRecord && <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
      <Sidebar user={user} />

      <div style={{ flex:1, minWidth:0, overflow:'auto' }}>
        <main style={{ padding:'40px 48px 80px' }}>

          {/* Page title row */}
          <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom:4 }}>{pet.name}</h1>
              <p style={{ fontSize:14, color:'#6B7280' }}>{pet.breed} &middot; {pet.color} &middot; {petAge} yrs old</p>
            </div>
            <button onClick={downloadAppleWallet} disabled={walletLoading} className="btn-primary" style={{ flexShrink:0, marginTop:2 }}>
              {walletLoading ? 'Generating…' : 'Add to Wallet'}
            </button>
          </div>

          {/* Tab row */}
          <div className="fade-up" style={{ display:'flex', borderBottom:'1px solid #EBEBEB', marginTop:28, marginBottom:32 }}>
            {tabs.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ background:'none', border:'none', padding:'0 0 12px', marginRight:24, marginBottom:-1, fontSize:14, fontFamily:'inherit', cursor:'pointer', fontWeight: activeTab === id ? 500 : 400, color: activeTab === id ? '#0A0A0A' : '#6B7280', borderBottom: activeTab === id ? '2px solid #E8820C' : '2px solid transparent', transition:'color 0.15s ease-out' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="fade-up">
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Records', value:records.length },
                  { label:'Scans',   value:scans.length   },
                  { label:'Age',     value:`${petAge}y`   },
                ].map(({ label, value }) => (
                  <div key={label} style={{ border:'1px solid #EBEBEB', borderRadius:8, padding:'24px' }}>
                    <div style={{ fontSize:28, fontWeight:600, letterSpacing:'-0.03em', color:'#0A0A0A', lineHeight:1 }}>{value}</div>
                    <div style={{ fontSize:13, color:'#6B7280', marginTop:8 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Chip card */}
              <div style={{ background:'#0A0A0A', borderRadius:8, padding:'24px', marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Microchip</div>
                    <div style={{ fontSize:16, fontWeight:600, color:'white', letterSpacing:'-0.01em' }}>{pet.name}</div>
                  </div>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.1)', borderRadius:4, padding:'3px 8px', fontWeight:500 }}>Active</span>
                </div>
                <div style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:16, color:'white', letterSpacing:'0.1em', marginBottom:24, fontWeight:400 }}>
                  {chipFormatted || '— — — —'}
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>NFC · 134.2 kHz · ISO 11784/5</div>
              </div>

              {/* Emergency contact */}
              <div style={{ border:'1px solid #EBEBEB', borderRadius:8, padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div className="section-label" style={{ marginBottom:4 }}>Emergency Contact</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>{chip?.emergency_contact?.name || user?.full_name || 'Ian Schwarz'}</div>
                  <div style={{ fontSize:14, color:'#6B7280', marginTop:2 }}>{chip?.emergency_contact?.phone || '(801) 555-0192'}</div>
                </div>
                <a href={`tel:${(chip?.emergency_contact?.phone || '8015550192').replace(/\D/g,'')}`}
                  style={{ height:36, padding:'0 16px', border:'1px solid #EBEBEB', borderRadius:8, display:'flex', alignItems:'center', fontSize:13, fontWeight:500, color:'#0A0A0A', textDecoration:'none', flexShrink:0, transition:'border-color 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB' }}>
                  Call
                </a>
              </div>

              {/* AI summary */}
              <div style={{ borderTop:'1px solid #EBEBEB', borderRight:'1px solid #EBEBEB', borderBottom:'1px solid #EBEBEB', borderLeft:'3px solid #E8820C', borderRadius:8, padding:'20px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div className="section-label" style={{ marginBottom:0 }}>Health Summary</div>
                  <button onClick={() => pet && sessionTokenRef.current && fetchSummary(pet.id, sessionTokenRef.current)} disabled={summaryLoading}
                    style={{ fontSize:12, color:'#6B7280', background:'none', border:'none', cursor: summaryLoading ? 'default' : 'pointer', padding:'2px 0', fontFamily:'inherit' }}>
                    {summaryLoading ? 'Generating…' : 'Regenerate'}
                  </button>
                </div>
                {summaryLoading && !aiSummary
                  ? <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.75, fontStyle:'italic' }}>Generating health brief…</p>
                  : aiSummary
                    ? <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.75 }}>{aiSummary}</p>
                    : <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.75, fontStyle:'italic' }}>Health summary unavailable.</p>
                }
              </div>
            </div>
          )}

          {/* Records tab */}
          {activeTab === 'records' && (
            <div className="fade-up">
              <div style={{ border:'1px solid #EBEBEB', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>Medical Records</span>
                  <span style={{ fontSize:13, color:'#6B7280' }}>{records.length} total</span>
                </div>
                {records.length === 0 ? (
                  <div style={{ padding:'48px 20px', textAlign:'center', color:'#6B7280', fontSize:14 }}>No records yet</div>
                ) : records.map((rec: any) => {
                  const label = recordTypeLabel[rec.record_type] ?? 'Record'
                  return (
                    <div key={rec.id} onClick={() => setSelectedRecord(rec)}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'16px 20px', borderBottom:'1px solid #EBEBEB', cursor:'pointer', transition:'background 0.15s ease-out' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
                      <div style={{ flex:1, minWidth:0, paddingRight:16 }}>
                        <div style={{ marginBottom:5 }}>
                          <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:500 }}>{label}</span>
                        </div>
                        <div style={{ fontSize:14, fontWeight:600, letterSpacing:'-0.01em', marginBottom:3, color:'#0A0A0A' }}>{rec.title}</div>
                        <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{rec.content}</div>
                      </div>
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <div style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(rec.record_date)}</div>
                        <div style={{ fontSize:18, color:'#D1D5DB', marginTop:4 }}>›</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Scans tab */}
          {activeTab === 'scans' && (
            <div className="fade-up">
              <div style={{ border:'1px solid #EBEBEB', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>Scan History</span>
                  <span style={{ fontSize:13, color:'#6B7280' }}>{scans.length} total</span>
                </div>
                {scans.length === 0 ? (
                  <div style={{ padding:'48px 20px', textAlign:'center', color:'#6B7280', fontSize:14 }}>No scans recorded yet</div>
                ) : scans.map((s: any, i: number) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderBottom: i < scans.length - 1 ? '1px solid #EBEBEB' : 'none', transition:'background 0.15s ease-out' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
                    <span style={{ fontSize:14, color:'#0A0A0A', fontWeight:500 }}>{s.location?.label || s.location?.city || 'Unknown location'}</span>
                    <span style={{ fontSize:13, color:'#6B7280' }}>{fmtDT(s.scanned_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
