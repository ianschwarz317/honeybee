'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { mockPet, mockRecords, mockSummary, mockScans } from '@/lib/mock-data'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vaccination: { label: 'Vaccine',      color: '#1A7F37', bg: '#E8F8ED', icon: '💉' },
  exam:         { label: 'Exam',         color: '#0051A2', bg: '#E8F1FB', icon: '🩺' },
  prescription: { label: 'Rx',           color: '#6B3FBA', bg: '#F3EEFF', icon: '💊' },
  lab:          { label: 'Lab',          color: '#7D4800', bg: '#FFF3E0', icon: '🧪' },
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function fmtDT(d: string)   { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) }
function age(dob: string)   { return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs` }

// ── Record detail modal ──────────────────────────────────────────────────────
function RecordModal({ record, onClose }: { record: typeof mockRecords[0]; onClose: () => void }) {
  const cfg = (typeConfig[record.type] ?? typeConfig['exam'])!
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white',borderRadius:16,padding:28,width:'100%',maxWidth:520,boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
          <div style={{ display:'flex',gap:12,alignItems:'center' }}>
            <div style={{ width:44,height:44,borderRadius:12,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{cfg.icon}</div>
            <div>
              <span style={{ fontSize:11,fontWeight:600,color:cfg.color,background:cfg.bg,borderRadius:100,padding:'2px 8px' }}>{cfg.label}</span>
              <div style={{ fontSize:13,color:'#6E6E73',marginTop:3 }}>{fmtDate(record.date)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#F2F2F7',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#6E6E73' }}>✕</button>
        </div>
        <h2 style={{ fontSize:20,fontWeight:700,marginBottom:12 }}>{record.title}</h2>
        <div style={{ background:'#F2F2F7',borderRadius:10,padding:'14px 16px',marginBottom:16 }}>
          <p style={{ fontSize:14,color:'#1D1D1F',lineHeight:1.65,margin:0 }}>{record.content}</p>
        </div>
        {Object.keys(record.meta).length > 0 && (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 20px',marginBottom:16 }}>
            {Object.entries(record.meta).map(([k,v]) => (
              <div key={k}><div style={{ fontSize:11,color:'#AEAEB2',fontWeight:500,textTransform:'capitalize',marginBottom:2 }}>{k}</div><div style={{ fontSize:14,fontWeight:500 }}>{String(v)}</div></div>
            ))}
          </div>
        )}
        <div style={{ paddingTop:14,borderTop:'1px solid #F2F2F7',fontSize:13,color:'#6E6E73' }}>{record.author} · Summit Animal Hospital</div>
      </div>
    </div>
  )
}

// ── Update chip modal ────────────────────────────────────────────────────────
function UpdateChipModal({ onClose, anonymous, setAnonymous }: { onClose:()=>void; anonymous:boolean; setAnonymous:(v:boolean)=>void }) {
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white',borderRadius:16,padding:28,width:'100%',maxWidth:440,boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
          <h2 style={{ fontSize:20,fontWeight:700 }}>Update Chip Information</h2>
          <button onClick={onClose} style={{ background:'#F2F2F7',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#6E6E73' }}>✕</button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {[['Emergency Contact Name','John & Lisa Smith','text'],['Emergency Phone','(801) 555-0192','tel'],['Emergency Email','john.smith@email.com','email']].map(([l,v,t]) => (
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

// ── Realistic Apple Wallet pass ───────────────────────────────────────────────
// Matches the Wallet app UI: white background, Done/··· header, card with shadow
function AppleWalletView() {
  const vaccines = [
    { icon:'🛡️', color:'#1A7F37', label:'Rabies Vaccine Confirmed', status:'Good Through', detail:'04/22/2029' },
    { icon:'📋', color:'#0051A2', label:'Health Certificate', status:'Valid', detail:'' },
    { icon:'🐾', color:'#5A189A', label:'Bordatella Vaccine', status:'Up to Date', detail:'' },
    { icon:'🐾', color:'#E65100', label:'DHPP Vaccination', status:'Up to Date', detail:'' },
  ]

  return (
    // Wallet app container — white bg like the actual app
    <div style={{ background:'#FFFFFF', borderRadius:16, overflow:'hidden', border:'1px solid #E5E5EA', fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif' }}>
      {/* Wallet app chrome — Done / ··· bar */}
      <div style={{ background:'#F2F2F7', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid #C8C8CC' }}>
        <button style={{ background:'none', border:'none', fontSize:17, fontWeight:400, color:'#007AFF', cursor:'pointer', fontFamily:'inherit', padding:0 }}>Done</button>
        <span style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>Honeybee</span>
        <button style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'#E5E5EA', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:16, color:'#3C3C43', lineHeight:1, letterSpacing:1 }}>···</span>
          </div>
        </button>
      </div>

      {/* Pass card — this is the actual pass */}
      <div style={{ padding:'14px 16px 0' }}>
        <div style={{ borderRadius:12, overflow:'hidden', boxShadow:'0 8px 28px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}>
          {/* Pass background */}
          <div style={{ background:'linear-gradient(165deg, #FFF9E6 0%, #FFF0B8 100%)' }}>

            {/* Logo strip */}
            <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Image src="/logo.svg" alt="Honeybee" width={22} height={22} style={{ borderRadius:5 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#3D2B00', letterSpacing:'0.05em' }}>HONEYBEE</div>
                  <div style={{ fontSize:9, color:'#8B6914', fontWeight:500, letterSpacing:'0.03em' }}>Pet Health Pass</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(255,255,255,0.65)', borderRadius:100, padding:'4px 8px', border:'0.5px solid rgba(61,43,0,0.12)' }}>
                <span style={{ fontSize:10 }}>🛡️</span>
                <span style={{ fontSize:10, color:'#3D6B2C', fontWeight:600 }}>Vet Verified</span>
              </div>
            </div>

            {/* Primary field — pet name */}
            <div style={{ padding:'0 16px 4px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:9, fontWeight:600, color:'#8B6914', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Pet Name</div>
                <div style={{ fontSize:32, fontWeight:700, color:'#3D2B00', letterSpacing:'-0.02em', lineHeight:1, marginBottom:10 }}>Biscuit</div>
                <div style={{ fontSize:9, fontWeight:600, color:'#8B6914', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:3 }}>Pet Age</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#3D2B00' }}>6 years</div>
              </div>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#FFF3CD,#FFD966)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, border:'3px solid rgba(255,255,255,0.8)', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', marginTop:4 }}>🐕</div>
            </div>

            {/* Divider */}
            <div style={{ margin:'10px 16px', height:1, background:'rgba(61,43,0,0.1)' }} />

            {/* Vaccination rows */}
            <div style={{ padding:'0 10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              {vaccines.map(({ icon, color, label, status, detail }) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.75)', borderRadius:10, padding:'9px 11px', display:'flex', alignItems:'center', gap:9, backdropFilter:'blur(4px)' }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#1C1C1E', letterSpacing:'0.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
                    <div style={{ fontSize:10, color, fontWeight:600, marginTop:1 }}>{status}{detail ? ` ${detail}` : ''}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:8, height:5, borderLeft:'1.5px solid white', borderBottom:'1.5px solid white', transform:'rotate(-45deg) translate(0.5px,-0.5px)' }} />
                    </div>
                    <span style={{ fontSize:10, color:'#8E8E93' }}>Details ›</span>
                  </div>
                </div>
              ))}
            </div>

            {/* QR code */}
            <div style={{ background:'rgba(255,255,255,0.6)', margin:'0 16px 14px', borderRadius:10, padding:'10px', display:'flex', justifyContent:'center' }}>
              <svg width="64" height="64" viewBox="0 0 70 70">
                <rect width="70" height="70" fill="white"/>
                <rect x="2" y="2" width="20" height="20" fill="#1C1C1E"/><rect x="4" y="4" width="16" height="16" fill="white"/><rect x="6" y="6" width="12" height="12" fill="#1C1C1E"/>
                <rect x="48" y="2" width="20" height="20" fill="#1C1C1E"/><rect x="50" y="4" width="16" height="16" fill="white"/><rect x="52" y="6" width="12" height="12" fill="#1C1C1E"/>
                <rect x="2" y="48" width="20" height="20" fill="#1C1C1E"/><rect x="4" y="50" width="16" height="16" fill="white"/><rect x="6" y="52" width="12" height="12" fill="#1C1C1E"/>
                <rect x="24" y="2" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="2" width="4" height="4" fill="#1C1C1E"/><rect x="36" y="2" width="4" height="4" fill="#1C1C1E"/>
                <rect x="24" y="8" width="4" height="4" fill="#1C1C1E"/><rect x="36" y="8" width="4" height="4" fill="#1C1C1E"/>
                <rect x="24" y="14" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="14" width="4" height="4" fill="#1C1C1E"/>
                <rect x="24" y="24" width="22" height="22" fill="#F5A623" rx="2"/><rect x="28" y="28" width="14" height="14" fill="white"/><rect x="30" y="30" width="10" height="10" fill="#F5A623"/>
                <rect x="48" y="24" width="4" height="4" fill="#1C1C1E"/><rect x="54" y="24" width="4" height="4" fill="#1C1C1E"/>
                <rect x="48" y="30" width="4" height="4" fill="#1C1C1E"/><rect x="60" y="30" width="4" height="4" fill="#1C1C1E"/>
                <rect x="48" y="36" width="4" height="4" fill="#1C1C1E"/><rect x="54" y="36" width="4" height="4" fill="#1C1C1E"/>
                <rect x="24" y="48" width="4" height="4" fill="#1C1C1E"/><rect x="36" y="48" width="4" height="4" fill="#1C1C1E"/>
                <rect x="24" y="54" width="4" height="4" fill="#1C1C1E"/><rect x="42" y="54" width="4" height="4" fill="#1C1C1E"/>
                <rect x="24" y="60" width="4" height="4" fill="#1C1C1E"/><rect x="30" y="60" width="4" height="4" fill="#1C1C1E"/>
                <rect x="48" y="48" width="4" height="4" fill="#1C1C1E"/><rect x="60" y="48" width="4" height="4" fill="#1C1C1E"/>
                <rect x="54" y="54" width="4" height="4" fill="#1C1C1E"/><rect x="48" y="60" width="4" height="4" fill="#1C1C1E"/><rect x="60" y="60" width="4" height="4" fill="#1C1C1E"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* "Add to" buttons below the card — inside Wallet app */}
      <div style={{ padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ cursor:'pointer' }}>
          <Image src="/apple-wallet.png" alt="Add to Apple Wallet" width={600} height={180} style={{ width:'100%', height:'auto', borderRadius:10, display:'block' }} />
        </div>
        <div style={{ cursor:'pointer' }}>
          <Image src="/google-wallet.png" alt="Add to Google Wallet" width={600} height={180} style={{ width:'100%', height:'auto', borderRadius:10, display:'block' }} />
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function OwnerPortal() {
  const [selectedRecord, setSelectedRecord] = useState<typeof mockRecords[0]|null>(null)
  const [showUpdateChip, setShowUpdateChip] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const pet = mockPet
  const cfgFn = (t:string) => (typeConfig[t] ?? typeConfig['exam'])!

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
        .record-card { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
        .record-card .view-btn { flex-shrink: 0; }
      `}</style>

      {selectedRecord && <RecordModal record={selectedRecord} onClose={()=>setSelectedRecord(null)} />}
      {showUpdateChip && <UpdateChipModal onClose={()=>setShowUpdateChip(false)} anonymous={anonymous} setAnonymous={setAnonymous} />}

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:50,background:'rgba(245,245,247,0.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,0.08)',padding:'0 20px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex',alignItems:'center',gap:8,textDecoration:'none' }}>
          <Image src="/logo.svg" alt="Honeybee" width={26} height={26} style={{ borderRadius:6 }} />
          <span style={{ fontWeight:600,fontSize:15,color:'#1D1D1F' }}>Honeybee</span>
        </Link>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:14,color:'#6E6E73' }}>John Smith</span>
          <div style={{ width:30,height:30,borderRadius:'50%',background:'#007AFF',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600 }}>JS</div>
        </div>
      </nav>

      <main style={{ maxWidth:1100,margin:'0 auto',padding:'20px 16px 40px' }}>
        <h1 style={{ fontSize:26,fontWeight:700,marginBottom:16,letterSpacing:'-0.02em' }}>My Pets</h1>

        {/* Two-column: left = info, right = wallet pass */}
        <div className="owner-grid" style={{ marginBottom:14 }}>

          {/* Left column */}
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>

            {/* Pet profile */}
            <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex',gap:14,alignItems:'center',marginBottom:16 }}>
                <div style={{ width:52,height:52,borderRadius:13,background:'linear-gradient(135deg,#FFF3CD,#FFD966)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0 }}>🐕</div>
                <div>
                  <h2 style={{ fontSize:20,fontWeight:700,marginBottom:2 }}>{pet.name}</h2>
                  <p style={{ fontSize:13,color:'#6E6E73',marginBottom:5 }}>{pet.breed}</p>
                  <span style={{ display:'inline-flex',alignItems:'center',gap:4,background:'#E8F8ED',color:'#1A7F37',borderRadius:100,padding:'2px 8px',fontSize:12,fontWeight:600 }}>✓ Chip registered</span>
                </div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 0',paddingTop:14,borderTop:'1px solid #F2F2F7' }}>
                {[['Age',age(pet.date_of_birth)],['Weight',`${pet.weight_kg} kg`],['Sex',pet.sex],['Color',pet.color]].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:11,color:'#AEAEB2',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2 }}>{l}</div><div style={{ fontSize:14,fontWeight:500 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ marginTop:12,paddingTop:12,borderTop:'1px solid #F2F2F7' }}>
                <div style={{ fontSize:11,color:'#AEAEB2',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:2 }}>Veterinary Clinic</div>
                <div style={{ fontSize:14,fontWeight:500 }}>{pet.vet_clinic}</div>
              </div>
            </div>

            {/* Chip + scan log side by side on wider screens */}
            <div className="chip-row">
              {/* Chip */}
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
                  <div style={{ fontFamily:'monospace',color:'white',fontSize:12,letterSpacing:'0.1em',marginBottom:6,position:'relative' }}>{pet.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/,'$1 $2 $3 $4')}</div>
                  <div style={{ fontSize:10,color:'rgba(255,255,255,0.35)',position:'relative' }}>NFC + 134.2 kHz · ISO 11784/5</div>
                </div>
                {[['NFC UID',pet.nfc_uid],['Emergency',pet.owner_phone]].map(([l,v])=>(
                  <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:7 }}>
                    <span style={{ fontSize:13,color:'#6E6E73' }}>{l}</span>
                    <span style={{ fontSize:12,fontWeight:500,fontFamily:l==='NFC UID'?'monospace':'inherit' }}>{v}</span>
                  </div>
                ))}
                {/* Anonymize toggle */}
                <div style={{ background:'#F2F2F7',borderRadius:9,padding:'9px 11px',marginTop:10,marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div><div style={{ fontSize:13,fontWeight:500,marginBottom:1 }}>Anonymize on scan</div><div style={{ fontSize:11,color:'#6E6E73' }}>Hide personal info</div></div>
                  <button onClick={()=>setAnonymous(!anonymous)} style={{ width:42,height:24,borderRadius:12,border:'none',cursor:'pointer',background:anonymous?'#007AFF':'#D1D1D6',position:'relative',transition:'background 0.2s',flexShrink:0,marginLeft:10 }}>
                    <div style={{ position:'absolute',top:2,left:anonymous?18:2,width:20,height:20,borderRadius:'50%',background:'white',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.2s' }} />
                  </button>
                </div>
                <button onClick={()=>setShowUpdateChip(true)} style={{ width:'100%',border:'1px solid #D1D1D6',borderRadius:9,padding:'8px',fontSize:13,background:'white',color:'#1D1D1F',cursor:'pointer',fontFamily:'inherit',fontWeight:500 }}>✏️ Update Information</button>
              </div>

              {/* Recent scans */}
              <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#6E6E73',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:12 }}>Recent Scans</div>
                {mockScans.map((s,i)=>(
                  <div key={i} style={{ display:'flex',gap:10,alignItems:'flex-start',marginBottom:12 }}>
                    <div style={{ width:6,height:6,borderRadius:'50%',background:i===0?'#007AFF':'#D1D1D6',marginTop:5,flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:500 }}>{s.location}</div>
                      <div style={{ fontSize:12,color:'#6E6E73' }}>{fmtDT(s.at)}</div>
                    </div>
                    {s.alerted && <span style={{ fontSize:11,background:'#FFF3E0',color:'#7D4800',borderRadius:100,padding:'2px 8px',fontWeight:600,flexShrink:0 }}>Alert sent</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div style={{ background:'white',borderRadius:14,padding:18,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',borderLeft:'3px solid #F5A623' }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:'#FFF3E0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>✨</div>
                <div><div style={{ fontSize:15,fontWeight:600 }}>AI Health Summary</div><div style={{ fontSize:12,color:'#6E6E73' }}>Generated from {mockRecords.length} records · May 2026</div></div>
              </div>
              <p style={{ fontSize:14,lineHeight:1.65,color:'#1D1D1F',whiteSpace:'pre-line',margin:0 }}>{mockSummary}</p>
            </div>

            {/* Medical records */}
            <div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
                <h2 style={{ fontSize:18,fontWeight:700 }}>Medical Records</h2>
                <span style={{ fontSize:13,color:'#6E6E73' }}>{mockRecords.length} records</span>
              </div>
              <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                {mockRecords.map(rec=>{
                  const cfg=cfgFn(rec.type)
                  return (
                    <div key={rec.id} style={{ background:'white',borderRadius:14,padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start',boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div style={{ width:34,height:34,borderRadius:9,background:cfg.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0 }}>{cfg.icon}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:3,flexWrap:'wrap' }}>
                          <span style={{ fontSize:11,fontWeight:600,color:cfg.color,background:cfg.bg,borderRadius:100,padding:'2px 7px' }}>{cfg.label}</span>
                          <span style={{ fontSize:12,color:'#6E6E73' }}>{fmtDate(rec.date)}</span>
                        </div>
                        <div style={{ fontSize:14,fontWeight:600,marginBottom:3 }}>{rec.title}</div>
                        <div style={{ fontSize:13,color:'#6E6E73',lineHeight:1.5 }}>{rec.content}</div>
                        <div style={{ fontSize:11,color:'#AEAEB2',marginTop:5 }}>{rec.author}</div>
                      </div>
                      <button onClick={()=>setSelectedRecord(rec)} style={{ flexShrink:0,border:'1px solid #D1D1D6',borderRadius:8,padding:'5px 12px',fontSize:13,background:'white',color:'#1D1D1F',cursor:'pointer',fontFamily:'inherit',fontWeight:500,whiteSpace:'nowrap' }}>View →</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column — Wallet pass (sticky on desktop) */}
          <div style={{ position:'sticky', top:66, alignSelf:'start' }}>
            <AppleWalletView />
          </div>
        </div>
      </main>
    </div>
  )
}
