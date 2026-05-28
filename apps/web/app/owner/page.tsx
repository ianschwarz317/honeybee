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
  const s = { width:18, height:18, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:'1.75', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name === 'home')   return <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (name === 'file')   return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (name === 'clock')  return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  if (name === 'wallet') return <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  return null
}

function StatIcon({ name }: { name: string }) {
  const s = { width:15, height:15, viewBox:'0 0 24 24', fill:'none', stroke:'#E8820C', strokeWidth:'2', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name === 'file')     return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  if (name === 'search')   return <svg {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  if (name === 'calendar') return <svg {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  return null
}

function RecordModal({ record, onClose }: { record: any; onClose: () => void }) {
  const label = recordTypeLabel[record.record_type] ?? 'Record'
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#FFFFFF', borderRadius:'16px 16px 0 0', padding:'28px 24px 48px', width:'100%', maxWidth:560, animation:'slideUp 0.15s ease-out both' }}>
        <div style={{ width:36, height:4, borderRadius:999, background:'#E5E7EB', margin:'0 auto 28px' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:999, padding:'3px 10px', fontSize:12, fontWeight:500 }}>{label}</span>
          <span style={{ fontSize:13, color:'#9CA3AF' }}>{fmtDate(record.record_date)}</span>
        </div>
        <h2 style={{ fontSize:20, fontWeight:600, marginBottom:10, letterSpacing:'-0.02em', color:'#0A0A0A' }}>{record.title}</h2>
        <p style={{ fontSize:14, color:'#6B7280', lineHeight:1.75, marginBottom:20 }}>{record.content}</p>
        {record.metadata && Object.keys(record.metadata).filter((k: string) => k !== 'author').length > 0 && (
          <div style={{ background:'#F9FAFB', borderRadius:10, padding:'14px 16px', marginBottom:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 20px' }}>
            {Object.entries(record.metadata).filter(([k]) => k !== 'author').map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize:11, color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:500, color:'#0A0A0A' }}>{String(v)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize:13, color:'#9CA3AF', marginBottom:24 }}>{record.metadata?.author || 'Summit Animal Hospital'}</div>
        <button onClick={onClose} style={{ width:'100%', height:44, background:'#F4F4F5', border:'none', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', color:'#0A0A0A', fontFamily:'inherit', transition:'background 0.15s ease-out' }}>
          Close
        </button>
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
      <div style={{ padding:'20px 16px 18px' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20, lineHeight:1 }}>🐝</span>
          <span style={{ fontWeight:700, fontSize:15, color:'#E8820C', letterSpacing:'-0.02em' }}>honeybee</span>
        </Link>
      </div>
      <nav style={{ flex:1, padding:'4px 10px' }}>
        {nav.map(({ label, icon }, i) => {
          const active = i === 0
          const isHovered = hovered === label
          const iconColor = active ? '#E8820C' : isHovered ? '#0A0A0A' : '#9CA3AF'
          return (
            <div key={label}
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', borderRadius:10, marginBottom:2,
                color: active ? '#E8820C' : isHovered ? '#0A0A0A' : '#6B7280',
                fontSize:14, fontWeight: active ? 500 : 400, cursor:'pointer',
                background: active ? '#FEF3E2' : isHovered ? '#F4F4F5' : 'transparent',
                transition:'background 0.15s ease-out, color 0.15s ease-out',
              }}>
              <NavIcon name={icon} color={iconColor} />
              <span>{label}</span>
            </div>
          )
        })}
      </nav>
      <div style={{ padding:'14px 16px', borderTop:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'white', flexShrink:0 }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.full_name || 'User'}</div>
          <div style={{ fontSize:11, color:'#9CA3AF' }}>Pet Owner</div>
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
        <span style={{ fontSize:40 }}>🐾</span>
        <h2 style={{ fontSize:20, fontWeight:600, color:'#0A0A0A' }}>No pet found</h2>
        <p style={{ color:'#6B7280', fontSize:14, maxWidth:260 }}>No pets are linked to this account yet.</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))} className="btn-secondary" style={{ marginTop:8 }}>Sign out</button>
      </div>
    )
  }

  const chipNum = chip?.chip_number || ''
  const chipFormatted = chipNum.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
  const petAge = new Date().getFullYear() - new Date(pet.date_of_birth).getFullYear()
  const petEmoji = pet.species === 'cat' ? '🐈' : '🐕'

  const tabs: { id: OwnerTab; label: string }[] = [
    { id:'overview', label:'Overview' },
    { id:'records',  label:`Records${records.length ? ` · ${records.length}` : ''}` },
    { id:'scans',    label:`Scans${scans.length ? ` · ${scans.length}` : ''}` },
  ]

  const cardShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px #EBEBEB'
  const cardHoverShadow = '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px #E0E0E0'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      {selectedRecord && <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
      <Sidebar user={user} />

      <div style={{ flex:1, minWidth:0, overflow:'auto' }}>
        <main style={{ padding:'40px 48px 80px', maxWidth:800, width:'100%' }}>

          {/* Pet header */}
          <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                {petEmoji}
              </div>
              <div>
                <h1 style={{ fontFamily:'var(--font-jakarta,var(--font-inter),-apple-system,sans-serif)', fontSize:36, fontWeight:700, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom:4, lineHeight:1.1 }}>{pet.name}</h1>
                <p style={{ fontSize:15, color:'#6B7280' }}>{pet.breed} &middot; {pet.color} &middot; {petAge} yrs old</p>
              </div>
            </div>
            <button onClick={downloadAppleWallet} disabled={walletLoading} className="btn-primary" style={{ flexShrink:0, marginTop:6 }}>
              {walletLoading ? 'Generating…' : 'Add to Wallet'}
            </button>
          </div>

          {/* Tab row */}
          <div className="fade-up" style={{ display:'flex', borderBottom:'1px solid #EBEBEB', marginBottom:32 }}>
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
                  { label:'Records', value:records.length, icon:'file' },
                  { label:'Scans',   value:scans.length,   icon:'search' },
                  { label:'Age',     value:`${petAge}y`,   icon:'calendar' },
                ].map(({ label, value, icon }) => (
                  <div key={label}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = cardHoverShadow; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = cardShadow; (e.currentTarget as HTMLElement).style.transform = '' }}
                    style={{ background:'#FFFFFF', borderRadius:12, padding:'20px', boxShadow:cardShadow, transition:'box-shadow 0.15s ease-out, transform 0.15s ease-out' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                      <span style={{ fontSize:12, color:'#6B7280' }}>{label}</span>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <StatIcon name={icon} />
                      </div>
                    </div>
                    <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.03em', color:'#0A0A0A', lineHeight:1 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Chip card */}
              <div style={{ background:'#0A0A0A', borderRadius:12, padding:'24px', marginBottom:20, position:'relative', overflow:'hidden' }}>
                {/* Dot texture */}
                <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'20px 20px', pointerEvents:'none' }} />
                <div style={{ position:'relative' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Microchip</div>
                      <div style={{ fontSize:16, fontWeight:600, color:'white', letterSpacing:'-0.01em' }}>{pet.name}</div>
                    </div>
                    <span style={{ fontSize:11, color:'white', background:'#E8820C', borderRadius:999, padding:'3px 10px', fontWeight:600 }}>Active</span>
                  </div>
                  <div style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:15, color:'rgba(255,255,255,0.9)', letterSpacing:'0.12em', marginBottom:20, fontWeight:400 }}>
                    {chipFormatted || '— — — —'}
                  </div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>NFC · 134.2 kHz · ISO 11784/5</div>
                </div>
              </div>

              {/* Emergency contact */}
              <div
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = cardHoverShadow; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = cardShadow; (e.currentTarget as HTMLElement).style.transform = '' }}
                style={{ background:'#FFFFFF', borderRadius:12, padding:'20px 24px', marginBottom:20, boxShadow:cardShadow, display:'flex', justifyContent:'space-between', alignItems:'center', transition:'box-shadow 0.15s ease-out, transform 0.15s ease-out' }}>
                <div>
                  <div className="section-label" style={{ marginBottom:6 }}>Emergency Contact</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'#0A0A0A' }}>{chip?.emergency_contact?.name || user?.full_name || 'Ian Schwarz'}</div>
                  <div style={{ fontSize:14, color:'#6B7280', marginTop:2 }}>{chip?.emergency_contact?.phone || '(801) 555-0192'}</div>
                </div>
                <a href={`tel:${(chip?.emergency_contact?.phone || '8015550192').replace(/\D/g,'')}`}
                  style={{ height:36, padding:'0 18px', border:'1px solid #D1D5DB', borderRadius:10, display:'flex', alignItems:'center', fontSize:13, fontWeight:500, color:'#0A0A0A', textDecoration:'none', flexShrink:0, transition:'border-color 0.15s ease-out, background 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8820C'; (e.currentTarget as HTMLElement).style.color = '#E8820C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLElement).style.color = '#0A0A0A' }}>
                  Call
                </a>
              </div>

              {/* AI Health Brief */}
              <div style={{ background:'#FFFFFF', borderRadius:12, borderLeft:'3px solid #E8820C', boxShadow:cardShadow, padding:'20px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{ fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'#9CA3AF' }}>✨ Health Brief</span>
                  <button
                    onClick={() => pet && sessionTokenRef.current && fetchSummary(pet.id, sessionTokenRef.current)}
                    disabled={summaryLoading}
                    style={{ fontSize:12, color:'#9CA3AF', background:'none', border:'none', cursor: summaryLoading ? 'default' : 'pointer', padding:'2px 0', fontFamily:'inherit', transition:'color 0.15s ease-out' }}
                    onMouseEnter={e => { if (!summaryLoading) (e.currentTarget as HTMLElement).style.color = '#E8820C' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                    {summaryLoading ? 'Generating…' : 'Regenerate'}
                  </button>
                </div>
                {summaryLoading && !aiSummary
                  ? <p style={{ fontSize:15, color:'#9CA3AF', lineHeight:1.75, fontStyle:'italic' }}>Generating health brief…</p>
                  : aiSummary
                    ? <p style={{ fontSize:15, color:'#374151', lineHeight:1.75 }}>{aiSummary}</p>
                    : <p style={{ fontSize:15, color:'#9CA3AF', lineHeight:1.75, fontStyle:'italic' }}>Health summary unavailable.</p>
                }
              </div>

            </div>
          )}

          {/* Records tab */}
          {activeTab === 'records' && (
            <div className="fade-up">
              <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, overflow:'hidden' }}>
                <div style={{ padding:'18px 24px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:15, fontWeight:600, color:'#0A0A0A' }}>Medical Records</span>
                  <span style={{ fontSize:13, color:'#9CA3AF' }}>{records.length} total</span>
                </div>
                {records.length === 0 ? (
                  <div style={{ padding:'56px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>🐾</div>
                    <p style={{ color:'#6B7280', fontSize:15 }}>No records yet</p>
                  </div>
                ) : records.map((rec: any, i: number) => {
                  const label = recordTypeLabel[rec.record_type] ?? 'Record'
                  return (
                    <div key={rec.id} onClick={() => setSelectedRecord(rec)}
                      style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'18px 24px', borderBottom: i < records.length - 1 ? '1px solid #EBEBEB' : 'none', cursor:'pointer', transition:'background 0.15s ease-out' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
                      <div style={{ flex:1, minWidth:0, paddingRight:16 }}>
                        <div style={{ marginBottom:6 }}>
                          <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:999, padding:'3px 10px', fontSize:12, fontWeight:500 }}>{label}</span>
                        </div>
                        <div style={{ fontSize:14, fontWeight:500, letterSpacing:'-0.01em', marginBottom:4, color:'#0A0A0A' }}>{rec.title}</div>
                        <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{rec.content}</div>
                      </div>
                      <div style={{ flexShrink:0, textAlign:'right' }}>
                        <div style={{ fontSize:13, color:'#9CA3AF' }}>{fmtDate(rec.record_date)}</div>
                        <div style={{ fontSize:18, color:'#D1D5DB', marginTop:6 }}>›</div>
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
              <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, overflow:'hidden' }}>
                <div style={{ padding:'18px 24px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:15, fontWeight:600, color:'#0A0A0A' }}>Scan History</span>
                  <span style={{ fontSize:13, color:'#9CA3AF' }}>{scans.length} total</span>
                </div>
                {scans.length === 0 ? (
                  <div style={{ padding:'56px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>🐾</div>
                    <p style={{ color:'#6B7280', fontSize:15 }}>No scans recorded yet</p>
                  </div>
                ) : scans.map((s: any, i: number) => (
                  <div key={i}
                    style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 24px', borderBottom: i < scans.length - 1 ? '1px solid #EBEBEB' : 'none', transition:'background 0.15s ease-out' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'#16A34A', flexShrink:0 }} />
                      <span style={{ fontSize:14, color:'#0A0A0A', fontWeight:500 }}>{s.location?.label || s.location?.city || 'Unknown location'}</span>
                    </div>
                    <span style={{ fontSize:13, color:'#9CA3AF' }}>{fmtDT(s.scanned_at)}</span>
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
