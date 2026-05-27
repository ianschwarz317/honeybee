'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vaccination: { label: 'Vaccine',      color: '#1A7F37', bg: '#E8F8ED', icon: '💉' },
  exam:         { label: 'Exam',         color: '#0051A2', bg: '#E8F1FB', icon: '🩺' },
  prescription: { label: 'Rx',           color: '#6B3FBA', bg: '#F3EEFF', icon: '💊' },
  lab:          { label: 'Lab',          color: '#7D4800', bg: '#FFF3E0', icon: '🧪' },
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function fmtDT(d: string)   { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
function age(dob: string)   { return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs` }

function RecordModal({ record, onClose }: { record: any; onClose: () => void }) {
  const cfg = (typeConfig[record.record_type] ?? typeConfig['exam'])!
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white',borderRadius:16,padding:28,width:'100%',maxWidth:520,boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
          <div style={{ display:'flex',gap:12,alignItems:'center' }}>
            <div style={{ width:44,height:44,borderRadius:12,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{cfg.icon}</div>
            <div>
              <span style={{ fontSize:11,fontWeight:600,color:cfg.color,background:cfg.bg,borderRadius:100,padding:'2px 8px' }}>{cfg.label}</span>
              <div style={{ fontSize:13,color:'#6E6E73',marginTop:3 }}>{fmtDate(record.record_date)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#F2F2F7',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#6E6E73' }}>✕</button>
        </div>
        <h2 style={{ fontSize:20,fontWeight:700,marginBottom:12 }}>{record.title}</h2>
        <div style={{ background:'#F2F2F7',borderRadius:10,padding:'14px 16px',marginBottom:16 }}>
          <p style={{ fontSize:14,color:'#1D1D1F',lineHeight:1.65,margin:0 }}>{record.content}</p>
        </div>
        {record.metadata && Object.keys(record.metadata).length > 0 && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 20px',marginBottom:16 }}>
            {Object.entries(record.metadata).map(([k,v]) => (
              <div key={k}><div style={{ fontSize:11,color:'#AEAEB2',fontWeight:500,textTransform:'capitalize',marginBottom:2 }}>{k}</div><div style={{ fontSize:15,fontWeight:500 }}>{String(v)}</div></div>
            ))}
          </div>
        )}
        <div style={{ paddingTop:14,borderTop:'1px solid #F2F2F7',fontSize:13,color:'#6E6E73' }}>Summit Animal Hospital</div>
      </div>
    </div>
  )
}

function UpdateChipModal({ onClose, anonymous, setAnonymous }: { onClose:()=>void; anonymous:boolean; setAnonymous:(v:boolean)=>void }) {
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white',borderRadius:16,padding:28,width:'100%',maxWidth:440,boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h2 style={{ fontSize:20,fontWeight:700 }}>Update Chip Information</h2>
          <button onClick={onClose} style={{ background:'#F2F2F7',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#6E6E73' }}>✕</button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {[['Emergency Contact Name','Ian Schwarz','text'],['Emergency Phone','(801) 555-0192','tel'],['Emergency Email','ian@seehoneybee.com','email']].map(([l,v,t]) => (
            <div key={l}><label style={{ fontSize:13,fontWeight:500,color:'#6E6E73',display:'block',marginBottom:6 }}>{l}</label><input defaultValue={v} type={t} style={{ width:'100%',border:'1px solid #D1D1D6',borderRadius:9,padding:'10px 12px',fontSize:15,fontFamily:'inherit',color:'#1D1D1F',outline:'none',boxSizing:'border-box' }} /></div>
          ))}
          <div style={{ background:'#F2F2F7',borderRadius:12,padding:'12px 14px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div><div style={{ fontSize:14,fontWeight:600,marginBottom:2 }}>Anonymize on scan</div><div style={{ fontSize:12,color:'#6E6E73' }}>Hide personal info from strangers</div></div>
              <button onClick={()=>setAnonymous(!anonymous)} style={{ width:44,height:26,borderRadius:13,border:'none',cursor:'pointer',background:anonymous?'#007AFF':'#D1D1D6',position:'relative',transition:'background 0.2s',flexShrink:0,marginLeft:12 }}>
                <div style={{ position:'absolute',top:3,left:anonymous?20:3,width:20,height:20,borderRadius:'50%',background:'white',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s' }} />
              </button>
            </div>
          </div>
          <button style={{ width:'100%',background:'#007AFF',color:'white',border:'none',borderRadius:10,padding:'13px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

function AppleWalletView({ pet, chip }: { pet: any; chip: any }) {
  const vaccines = [
    { color:'#1A7F37', label:'Rabies Vaccine Confirmed', status:'Good Through 04/22/2029' },
    { color:'#0051A2', label:'Health Certificate', status:'Valid' },
    { color:'#5A189A', label:'Bordatella Vaccine', status:'Up to Date' },
    { color:'#C84B00', label:'DHPP Vaccination', status:'Up to Date' },
  ]

  const QR = () => {
    const rows = [
      [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
      [1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1],
      [0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1,1,0],
      [1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,0,1,1],
      [0,1,0,0,1,0,0,1,1,0,0,1,1,0,0,1,0,1,0,0,1],
      [1,1,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,0],
      [0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,1,0],
      [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0,1,1,0,1],
    ]
    const size = 5
    return (
      <svg width={(rows[0]?.length ?? 21) * size} height={rows.length*size} style={{ display:'block' }}>
        {rows.map((row,r)=>row.map((cell,c)=>cell?<rect key={`${r}-${c}`} x={c*size} y={r*size} width={size} height={size} fill="#1D1D1F"/>:null))}
      </svg>
    )
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <div style={{ background:'white',borderRadius:18,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.12)',border:'1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ background:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',padding:'18px 18px 14px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>Honeybee Health Pass</div>
              <div style={{ fontSize:22,fontWeight:800,color:'white',letterSpacing:'-0.02em' }}>{pet?.name || 'Biscuit'}</div>
              <div style={{ fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:2 }}>{pet?.breed || 'Golden Retriever'} · {pet?.color || 'Golden'}</div>
            </div>
            <div style={{ width:44,height:44,borderRadius:12,background:'rgba(245,166,35,0.2)',border:'1px solid rgba(245,166,35,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>🐕</div>
          </div>
          <div style={{ display:'flex',gap:16 }}>
            {[['Age', pet?.date_of_birth ? age(pet.date_of_birth) : '6 yrs'],['Weight',`${pet?.weight_kg || 32.5} kg`],['Sex', pet?.sex || 'Male']].map(([l,v])=>(
              <div key={l}><div style={{ fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2 }}>{l}</div><div style={{ fontSize:13,fontWeight:600,color:'white' }}>{v}</div></div>
            ))}
          </div>
        </div>

        <div style={{ padding:'12px 16px',background:'#FAFAFA',borderBottom:'1px solid #F0F0F0' }}>
          {vaccines.map(({color,label,status})=>(
            <div key={label} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:7,padding:'6px 8px',background:'white',borderRadius:8,border:'1px solid #F0F0F0' }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:color,flexShrink:0 }} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:10,fontWeight:700,color:'#1C1C1E',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{label}</div>
                <div style={{ fontSize:10,color,fontWeight:500,marginTop:1 }}>{status}</div>
              </div>
              <span style={{ fontSize:10,color:'#8E8E93',flexShrink:0 }}>›</span>
            </div>
          ))}
        </div>

        <div style={{ margin:'8px 16px 14px',background:'white',borderRadius:10,padding:'12px',display:'flex',justifyContent:'center',alignItems:'center' }}>
          <QR />
        </div>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
        <Image src="/apple-wallet.png" alt="Add to Apple Wallet" width={600} height={180}
          style={{ width:'75%',height:'auto',borderRadius:10,display:'block',cursor:'pointer',margin:'0 auto' }} />
        <Image src="/google-wallet.png" alt="Add to Google Wallet" width={600} height={180}
          style={{ width:'75%',height:'auto',borderRadius:10,display:'block',cursor:'pointer',margin:'0 auto' }} />
      </div>
    </div>
  )
}

export default function OwnerPortal() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [showUpdateChip, setShowUpdateChip] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [pet, setPet] = useState<any>(null)
  const [chip, setChip] = useState<any>(null)
  const [records, setRecords] = useState<any[]>([])
  const [scans, setScans] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const cfgFn = (t:string) => (typeConfig[t] ?? typeConfig['exam'])!

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
  async function load() {
      setDataLoading(true)
      try {
const { data: petsData, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user!.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
        if (petError || !petsData || petsData.length === 0) { setDataLoading(false); return }
        const petData = petsData[0]
        setPet(petData)

const { data: chipsData } = await supabase
          .from('chips')
          .select('*')
          .eq('pet_id', petData.id)
          .limit(1)
        const chipData = chipsData?.[0] ?? null
        setChip(chipData ?? null)

        const { data: recs } = await supabase
          .from('medical_records')
          .select('*')
          .eq('pet_id', petData.id)
          .eq('is_visible_to_owner', true)
          .order('record_date', { ascending: false })
        setRecords(recs ?? [])

        if (chipData?.id) {
          const { data: scanData } = await supabase
            .from('scan_logs')
            .select('*')
            .eq('chip_id', chipData.id)
            .order('scanned_at', { ascending: false })
            .limit(5)
          setScans(scanData ?? [])
        }
      } catch (err) {
        console.error('Load error:', err)
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [user])

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight:'100vh',background:'#F5F5F7',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:32,height:32,borderRadius:'50%',border:'2px solid rgba(0,0,0,0.08)',borderTop:'2px solid #0071E3',margin:'0 auto 12px',animation:'spin 0.8s linear infinite' }} />
          <div style={{ fontSize:14,color:'#6E6E73' }}>Loading…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!pet) {
    return (
      <div style={{ minHeight:'100vh',background:'#F5F5F7',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ textAlign:'center',padding:40 }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🐾</div>
          <h2 style={{ fontSize:20,fontWeight:700,marginBottom:8 }}>No pet found</h2>
          <p style={{ fontSize:14,color:'#6E6E73',marginBottom:20 }}>Register your first pet to get started.</p>
          <Link href="/auth" style={{ color:'#0071E3',fontSize:14 }}>← Sign out</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F5F5F7' }}>
      <style>{`
        .owner-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .chip-row { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 700px) {
          .chip-row { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 960px) {
          .owner-grid { grid-template-columns: 1fr 340px; }
        }
      `}</style>

      {selectedRecord && <RecordModal record={selectedRecord} onClose={()=>setSelectedRecord(null)} />}
      {showUpdateChip && <UpdateChipModal onClose={()=>setShowUpdateChip(false)} anonymous={anonymous} setAnonymous={setAnonymous} />}

      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(245,245,247,0.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,0.08)',padding:'0 20px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none' }}>
          <Image src="/logo.svg" alt="Honeybee" width={26} height={26} style={{ borderRadius:6 }} />
          <span style={{ fontWeight:600,fontSize:16,color:'#1D1D1F' }}>Honeybee</span>
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:14,color:'#6E6E73' }}>{user?.full_name || 'My Account'}</span>
          <div style={{ width:30,height:30,borderRadius:'50%',background:'#007AFF',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600 }}>
            {(user?.full_name || 'U').split(' ').map((n:string)=>n[0]).join('').toUpperCase()}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:1100,margin:'0 auto',padding:'24px 20px' }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:28,fontWeight:800,letterSpacing:'-0.02em',marginBottom:4 }}>{pet.name}</h1>
          <p style={{ fontSize:15,color:'#6E6E73' }}>{pet.breed} · {pet.color} · {age(pet.date_of_birth)}</p>
        </div>

        <div className="owner-grid">
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>

            <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px 20px',marginBottom:12 }}>
                {[['Weight',`${pet.weight_kg} kg`],['Sex',pet.sex],['DOB',fmtDate(pet.date_of_birth)],['Chip',chip?.status || 'registered']].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:12,color:'#AEAEB2',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2 }}>{l}</div><div style={{ fontSize:15,fontWeight:500 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ marginTop:12,paddingTop:12,borderTop:'1px solid #F2F2F7' }}>
                <div style={{ fontSize:12,color:'#AEAEB2',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2 }}>Veterinary Clinic</div>
                <div style={{ fontSize:15,fontWeight:500 }}>Summit Animal Hospital</div>
              </div>
            </div>

            <div className="chip-row">
              <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                  <span style={{ fontSize:12,fontWeight:600,color:'#6E6E73',textTransform:'uppercase',letterSpacing:'0.04em' }}>Microchip</span>
                  <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'#E8F8ED',color:'#1A7F37',borderRadius:100,padding:'2px 8px',fontSize:12,fontWeight:600 }}>● Active</span>
                </div>
                <div style={{ background:'#1D1D1F',borderRadius:10,padding:'14px',marginBottom:12,position:'relative',overflow:'hidden' }}>
                  <div style={{ position:'absolute',right:-16,top:-16,width:70,height:70,borderRadius:'50%',background:'rgba(245,166,35,0.15)' }} />
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10,position:'relative' }}>
                    <Image src="/logo.svg" alt="" width={16} height={16} style={{ borderRadius:3 }} />
                    <span style={{ color:'rgba(255,255,255,0.55)',fontSize:11,fontWeight:600 }}>Honeybee</span>
                  </div>
                  <div style={{ fontFamily:'monospace',color:'white',fontSize:13,letterSpacing:'0.1em',marginBottom:6,position:'relative' }}>
                    {(chip?.chip_number || '').replace(/(\d{3})(\d{4})(\d{4})(\d{4})/,'$1 $2 $3 $4')}
                  </div>
                  <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)',position:'relative' }}>NFC + 134.2 kHz · ISO 11784/5</div>
                </div>
                {[['NFC UID', chip?.nfc_uid || 'A3F84C2D19E0'],['Emergency', chip?.emergency_contact?.phone || '(801) 555-0192']].map(([l,v])=>(
                  <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:7 }}>
                    <span style={{ fontSize:13,color:'#6E6E73' }}>{l}</span>
                    <span style={{ fontSize:13,fontWeight:500,fontFamily:l==='NFC UID'?'monospace':'inherit' }}>{v}</span>
                  </div>
                ))}
                <div style={{ background:'#F2F2F7',borderRadius:9,padding:'9px 11px',marginTop:10,marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div><div style={{ fontSize:13,fontWeight:500,marginBottom:1 }}>Anonymize on scan</div><div style={{ fontSize:11,color:'#6E6E73' }}>Hide personal info</div></div>
                  <button onClick={()=>setAnonymous(!anonymous)} style={{ width:42,height:24,borderRadius:12,border:'none',cursor:'pointer',background:anonymous?'#007AFF':'#D1D1D6',position:'relative',transition:'background 0.2s',flexShrink:0,marginLeft:10 }}>
                    <div style={{ position:'absolute',top:2,left:anonymous?18:2,width:20,height:20,borderRadius:'50%',background:'white',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s' }} />
                  </button>
                </div>
                <button onClick={()=>setShowUpdateChip(true)} style={{ width:'100%',border:'1px solid #D1D1D6',borderRadius:9,padding:'8px',fontSize:13,background:'white',color:'#1D1D1F',cursor:'pointer',fontFamily:'inherit',fontWeight:500 }}>✏️ Update Information</button>
              </div>

              <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#6E6E73',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:12 }}>Recent Scans</div>
                {scans.length === 0 && <div style={{ fontSize:13,color:'#AEAEB2' }}>No scans yet</div>}
                {scans.map((s:any,i:number)=>(
                  <div key={i} style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:12 }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:i===0?'#007AFF':'#D1D1D6',marginTop:5,flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:500 }}>{s.location?.label || s.location?.city || 'Unknown'}</div>
                      <div style={{ fontSize:12,color:'#6E6E73' }}>{fmtDT(s.scanned_at)}</div>
                    </div>
                    {s.notified_owner && <span style={{ fontSize:11,background:'#FFF3E0',color:'#7D4800',borderRadius:100,padding:'2px 8px',fontWeight:600,flexShrink:0 }}>Alert sent</span>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',borderLeft:'3px solid #F5A623' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:'#FFF3E0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>✨</div>
                <div><div style={{ fontSize:15,fontWeight:600 }}>AI Health Summary</div><div style={{ fontSize:12,color:'#6E6E73' }}>Generated from {records.length} records · May 2026</div></div>
              </div>
              <p style={{ fontSize:15,lineHeight:1.65,color:'#1D1D1F',whiteSpace:'pre-line',margin:0 }}>{`${pet.name} is a healthy ${age(pet.date_of_birth)} ${pet.breed} with no significant concerns. His April 2026 wellness exam confirmed normal cardiac and pulmonary function, stable weight, and clear hips.\n\nVaccinations are current through April 2029. He's on monthly Heartgard Plus — last heartworm test negative.\n\nOne item to monitor: mild tartar buildup on his back molars. A professional dental cleaning is recommended in the next 6–12 months.\n\nNext scheduled visit: April 2027 annual wellness.`}</p>
            </div>

            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                <h2 style={{ fontSize:18,fontWeight:700 }}>Medical Records</h2>
                <span style={{ fontSize:13,color:'#6E6E73' }}>{records.length} records</span>
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {records.map((rec:any)=>{
                  const cfg=cfgFn(rec.record_type)
                  return (
                    <div key={rec.id} style={{ background:'white',borderRadius:14,padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start',boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div style={{ width:34,height:34,borderRadius:9,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0 }}>{cfg.icon}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:3,flexWrap:'wrap' }}>
                          <span style={{ fontSize:12,fontWeight:600,color:cfg.color,background:cfg.bg,borderRadius:100,padding:'2px 8px' }}>{cfg.label}</span>
                          <span style={{ fontSize:12,color:'#6E6E73' }}>{fmtDate(rec.record_date)}</span>
                        </div>
                        <div style={{ fontSize:15,fontWeight:600,marginBottom:3 }}>{rec.title}</div>
                        <div style={{ fontSize:14,color:'#6E6E73',lineHeight:1.5 }}>{rec.content}</div>
                        <div style={{ fontSize:12,color:'#AEAEB2',marginTop:5 }}>{rec.metadata?.author || 'Summit Animal Hospital'}</div>
                      </div>
                      <button onClick={()=>setSelectedRecord(rec)} style={{ flexShrink:0,border:'1px solid #D1D1D6',borderRadius:8,padding:'5px 12px',fontSize:14,background:'white',color:'#1D1D1F',cursor:'pointer',fontFamily:'inherit',fontWeight:500,whiteSpace:'nowrap' }}>View →</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={{ position:'sticky',top:66,alignSelf:'start' }}>
            <AppleWalletView pet={pet} chip={chip} />
          </div>
        </div>
      </main>
    </div>
  )
}
