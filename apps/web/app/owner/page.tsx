'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
function age(dob: string) {
  return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs`
}

const recordType: Record<string, { label: string; dot: string }> = {
  vaccination: { label: 'Vaccine',      dot: '#2D6A4F' },
  exam:        { label: 'Exam',         dot: '#C8832A' },
  prescription:{ label: 'Prescription', dot: '#6B4FBA' },
  lab:         { label: 'Lab',          dot: '#C0392B' },
}

function RecordModal({ record, onClose }: { record: any; onClose: () => void }) {
  const rt = recordType[record.record_type] ?? { label: 'Record', dot: '#C8832A' }
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)',borderRadius:'20px 20px 0 0',padding:'32px 24px 48px',width:'100%',maxWidth:540,animation:'slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ width:36,height:4,borderRadius:2,background:'var(--border-strong)',margin:'0 auto 28px' }} />
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
          <div style={{ width:8,height:8,borderRadius:'50%',background:rt.dot,flexShrink:0 }} />
          <span style={{ fontSize:12,fontWeight:700,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.06em' }}>{rt.label}</span>
          <span style={{ fontSize:13,color:'var(--text-tertiary)',marginLeft:'auto' }}>{fmtDate(record.record_date)}</span>
        </div>
        <h2 style={{ fontSize:22,fontWeight:700,marginBottom:14,letterSpacing:'-0.02em' }}>{record.title}</h2>
        <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:20 }}>{record.content}</p>
        {record.metadata && Object.keys(record.metadata).filter((k:string) => k !== 'author').length > 0 && (
          <div style={{ background:'var(--surface-2)',borderRadius:'var(--radius-sm)',padding:'14px 16px',marginBottom:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 20px' }}>
            {Object.entries(record.metadata).filter(([k]) => k !== 'author').map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize:11,color:'var(--text-tertiary)',fontWeight:600,textTransform:'capitalize',marginBottom:2 }}>{k}</div>
                <div style={{ fontSize:14,fontWeight:500 }}>{String(v)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize:13,color:'var(--text-tertiary)',marginBottom:24 }}>{record.metadata?.author || 'Summit Animal Hospital'}</div>
        <button onClick={onClose} style={{ width:'100%',height:52,background:'var(--surface-2)',border:'none',borderRadius:'var(--radius-sm)',fontSize:15,fontWeight:600,cursor:'pointer',color:'var(--text-primary)' }}>
          Close
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>
    </div>
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

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
    if (!authLoading && user && (user.role === 'clinic_admin' || user.role === 'clinic_staff')) router.replace('/clinic')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      setDataLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setDataLoading(false); return }
        const uid = session.user.id

        const { data: petsData } = await supabase
          .from('pets').select('*')
          .eq('owner_id', uid).eq('is_active', true)
          .order('created_at', { ascending: false }).limit(1)
        if (!petsData || petsData.length === 0) { setDataLoading(false); return }
        const p = petsData[0]
        setPet(p)

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

  const initials = (user?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,padding:40,textAlign:'center' }}>
        <div style={{ fontSize:48 }}>🐾</div>
        <h2 style={{ fontSize:22,fontWeight:700 }}>No pet found</h2>
        <p style={{ color:'var(--text-secondary)',fontSize:15,maxWidth:280 }}>No pets are linked to this account yet.</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))} className="btn-secondary" style={{ marginTop:8 }}>Sign out</button>
      </div>
    )
  }

  const chipNum = chip?.chip_number || ''
  const chipFormatted = chipNum.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {selectedRecord && <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      <nav className="hb-nav">
        <Link href="/" style={{ display:'flex',alignItems:'center',gap:8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#C8832A"/>
          </svg>
          <span style={{ fontWeight:700,fontSize:16,letterSpacing:'-0.01em' }}>Honeybee</span>
        </Link>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))}
          style={{ width:34,height:34,borderRadius:'50%',background:'var(--dark)',color:'white',border:'none',cursor:'pointer',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}
        >
          {initials}
        </button>
      </nav>

      <div className="hb-page" style={{ paddingTop:40,paddingBottom:80 }}>

        {/* Hero */}
        <div className="fade-up" style={{ marginBottom:40 }}>
          <span className="pill pill-green" style={{ marginBottom:16,display:'inline-flex' }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block' }} />
            Registered
          </span>
          <h1 style={{ fontSize:52,fontWeight:800,letterSpacing:'-0.04em',marginBottom:6 }}>{pet.name}</h1>
          <p style={{ fontSize:15,color:'var(--text-secondary)' }}>
            {pet.breed} &middot; {pet.color} &middot; {age(pet.date_of_birth)}
          </p>
        </div>

        {/* Chip Passport */}
        <div className="chip-card fade-up delay-1" style={{ marginBottom:32 }}>
          <div style={{ position:'absolute',right:-30,top:-30,width:120,height:120,borderRadius:'50%',background:'rgba(200,131,42,0.12)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',right:20,bottom:-20,width:80,height:80,borderRadius:'50%',background:'rgba(200,131,42,0.07)',pointerEvents:'none' }} />
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32,position:'relative' }}>
            <div>
              <div style={{ fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.35)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4 }}>Honeybee</div>
              <div style={{ fontSize:20,fontWeight:700,color:'white',letterSpacing:'-0.02em' }}>{pet.name}</div>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ opacity:0.5 }}>
              <path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#C8832A"/>
            </svg>
          </div>
          <div style={{ fontFamily:'monospace',fontSize:18,color:'white',letterSpacing:'0.12em',marginBottom:20,fontWeight:500,position:'relative' }}>
            {chipFormatted || '— — — —'}
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-end',position:'relative' }}>
            <div style={{ fontSize:13,color:'rgba(255,255,255,0.4)' }}>NFC + 134.2 kHz · ISO 11784/5</div>
            <span style={{ background:'rgba(200,131,42,0.2)',color:'#F5C47A',borderRadius:100,padding:'3px 10px',fontSize:11,fontWeight:600 }}>● Active</span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="fade-up delay-2" style={{ background:'var(--surface)',borderRadius:'var(--radius)',border:'1px solid var(--border)',padding:'18px 20px',marginBottom:32,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div>
            <div className="section-label" style={{ marginBottom:4 }}>Emergency Contact</div>
            <div style={{ fontSize:16,fontWeight:600 }}>{chip?.emergency_contact?.name || user?.full_name || 'Ian Schwarz'}</div>
            <div style={{ fontSize:14,color:'var(--text-secondary)',marginTop:2 }}>{chip?.emergency_contact?.phone || '(801) 555-0192'}</div>
          </div>
          <a href={`tel:${(chip?.emergency_contact?.phone || '8015550192').replace(/\D/g,'')}`}
            style={{ width:44,height:44,borderRadius:'50%',background:'var(--honey-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
            📞
          </a>
        </div>

        {/* Recent Scans */}
        {scans.length > 0 && (
          <div className="fade-up delay-2" style={{ marginBottom:32 }}>
            <div className="section-label">Recent Scans</div>
            <div style={{ background:'var(--surface)',borderRadius:'var(--radius)',border:'1px solid var(--border)',overflow:'hidden' }}>
              {scans.map((s: any, i: number) => (
                <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderBottom:i < scans.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:i===0?'var(--honey)':'var(--border-strong)',flexShrink:0 }} />
                    <span style={{ fontSize:14 }}>{s.location?.label || s.location?.city || 'Unknown location'}</span>
                  </div>
                  <span style={{ fontSize:13,color:'var(--text-tertiary)' }}>{fmtDT(s.scanned_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="fade-up delay-3" style={{ padding:'24px 0',borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',marginBottom:32 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
            <span style={{ color:'var(--honey)',fontWeight:700,fontSize:14 }}>✦</span>
            <span className="section-label" style={{ marginBottom:0 }}>Health Summary</span>
          </div>
          <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.75,marginBottom:12 }}>
            {pet.name} is a healthy {age(pet.date_of_birth)} {pet.breed} with no significant concerns.
            April 2026 wellness exam confirmed normal cardiac and pulmonary function, stable weight, and clear hips.
          </p>
          <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.75 }}>
            Vaccinations current through April 2029. Monthly Heartgard Plus — last heartworm test negative.
            Mild tartar noted on molars; dental cleaning recommended within 6–12 months.
          </p>
        </div>

        {/* Medical Records */}
        <div className="fade-up delay-4" style={{ marginBottom:40 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <div className="section-label" style={{ marginBottom:0 }}>Medical Records</div>
            <span style={{ fontSize:13,color:'var(--text-tertiary)' }}>{records.length} total</span>
          </div>
          <div>
            {records.map((rec: any) => {
              const rt = recordType[rec.record_type] ?? { label: 'Record', dot: '#C8832A' }
              return (
                <div key={rec.id} className="record-row" onClick={() => setSelectedRecord(rec)}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                    <div style={{ flex:1,minWidth:0,paddingRight:16 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5 }}>
                        <div style={{ width:6,height:6,borderRadius:'50%',background:rt.dot,flexShrink:0 }} />
                        <span style={{ fontSize:11,fontWeight:700,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{rt.label}</span>
                      </div>
                      <div style={{ fontSize:16,fontWeight:600,letterSpacing:'-0.01em',marginBottom:4 }}>{rec.title}</div>
                      <div style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical' }}>{rec.content}</div>
                    </div>
                    <div style={{ flexShrink:0,textAlign:'right' }}>
                      <div style={{ fontSize:13,color:'var(--text-tertiary)' }}>{fmtDate(rec.record_date)}</div>
                      <div style={{ fontSize:20,color:'var(--border-strong)',marginTop:6 }}>›</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Wallet Passes */}
        <div className="fade-up delay-5" style={{ display:'flex',flexDirection:'column',gap:10 }}>
          <Image src="/apple-wallet.png" alt="Add to Apple Wallet" width={600} height={180}
            style={{ width:'100%',height:'auto',borderRadius:'var(--radius-sm)',cursor:'pointer' }} />
          <Image src="/google-wallet.png" alt="Add to Google Wallet" width={600} height={180}
            style={{ width:'100%',height:'auto',borderRadius:'var(--radius-sm)',cursor:'pointer' }} />
        </div>

      </div>
    </div>
  )
}
