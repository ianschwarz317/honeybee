'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ClinicSidebar } from './_components/sidebar'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}
function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })
}

function NavIcon({ name, color }: { name: string; color: string }) {
  const s = { width:18, height:18, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:'1.75', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name === 'grid')     return <svg {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  if (name === 'users')    return <svg {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  if (name === 'file')     return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (name === 'chip')     return <svg {...s}><rect x="7" y="7" width="10" height="10" rx="1"/><line x1="7" y1="9" x2="4" y2="9"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="7" y1="15" x2="4" y2="15"/><line x1="17" y1="9" x2="20" y2="9"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="17" y1="15" x2="20" y2="15"/><line x1="9" y1="7" x2="9" y2="4"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="15" y1="7" x2="15" y2="4"/><line x1="9" y1="17" x2="9" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/><line x1="15" y1="17" x2="15" y2="20"/></svg>
  if (name === 'star')     return <svg {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (name === 'link')     return <svg {...s}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
  if (name === 'bar')      return <svg {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  if (name === 'settings') return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  return null
}

function StatIcon({ name }: { name: string }) {
  const s = { width:15, height:15, viewBox:'0 0 24 24', fill:'none', stroke:'#E8820C', strokeWidth:'2', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
  if (name === 'users')    return <svg {...s}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  if (name === 'file')     return <svg {...s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  if (name === 'chip')     return <svg {...s}><rect x="7" y="7" width="10" height="10" rx="1"/><line x1="7" y1="12" x2="4" y2="12"/><line x1="17" y1="12" x2="20" y2="12"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="12" y1="17" x2="12" y2="20"/></svg>
  if (name === 'clock')    return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  return null
}

function petEmoji(species: string) {
  if (species === 'cat') return '🐈'
  if (species === 'dog') return '🐕'
  return '🐾'
}

type ClinicTab = 'patients' | 'activity'

export default function ClinicDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orgName, setOrgName] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ClinicTab>('patients')
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [panelRecords, setPanelRecords] = useState<any[]>([])
  const [panelChip, setPanelChip] = useState<any | null>(null)
  const [panelLoading, setPanelLoading] = useState(false)
  const [addingRecord, setAddingRecord] = useState(false)
  const [newRecord, setNewRecord] = useState({ type: 'exam', description: '', notes: '' })
  const [savingRecord, setSavingRecord] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
    if (!authLoading && user && user.role === 'pet_owner') router.replace('/owner')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      setDataLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) { setDataLoading(false); return }
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).limit(1)
        const orgId = profileData?.[0]?.organization_id
        if (!orgId) { setDataLoading(false); return }
        setOrgId(orgId)
        const [orgRes, patientsRes, activityRes] = await Promise.all([
          supabase.from('organizations').select('name').eq('id', orgId).limit(1),
          supabase.rpc('get_clinic_patients', { org_id: orgId }),
          supabase.rpc('get_clinic_recent_activity', { org_id: orgId, limit_count: 10 }),
        ])
        setOrgName(orgRes.data?.[0]?.name ?? '')
        setPatients(patientsRes.data ?? [])
        setActivity(activityRes.data ?? [])
      } catch (e) { console.error(e) }
      finally { setDataLoading(false) }
    }
    load()
  }, [user])

  async function openPatient(p: any) {
    setSelectedPatient(p)
    setPanelLoading(true)
    setAddingRecord(false)
    setNewRecord({ type: 'exam', description: '', notes: '' })
    try {
      const [recordsRes, chipRes] = await Promise.all([
        supabase.from('medical_records').select('*').eq('pet_id', p.pet_id).order('record_date', { ascending: false }),
        supabase.from('chips').select('*').eq('pet_id', p.pet_id).limit(1),
      ])
      setPanelRecords(recordsRes.data ?? [])
      setPanelChip(chipRes.data?.[0] ?? null)
    } finally { setPanelLoading(false) }
  }

  async function saveRecord() {
    if (!selectedPatient || !newRecord.description.trim()) return
    setSavingRecord(true)
    try {
      await supabase.from('medical_records').insert({
        pet_id: selectedPatient.pet_id,
        organization_id: orgId,
        record_type: newRecord.type,
        description: newRecord.description.trim(),
        notes: newRecord.notes.trim() || null,
        record_date: new Date().toISOString().split('T')[0],
        metadata: { author: user?.full_name || 'Clinic Staff' },
      })
      const { data } = await supabase.from('medical_records').select('*').eq('pet_id', selectedPatient.pet_id).order('record_date', { ascending: false })
      setPanelRecords(data ?? [])
      setNewRecord({ type: 'exam', description: '', notes: '' })
      setAddingRecord(false)
      setPatients(prev => prev.map(pt => pt.pet_id === selectedPatient.pet_id ? { ...pt, record_count: Number(pt.record_count ?? 0) + 1 } : pt))
    } finally { setSavingRecord(false) }
  }

  if (authLoading || dataLoading) {
    return <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" /></div>
  }

  const totalRecords = patients.reduce((sum: number, p: any) => sum + Number(p.record_count ?? 0), 0)
  const chippedCount = patients.filter((p: any) => p.chip_number).length

  const activityTypeLabel: Record<string, string> = {
    vaccination:'Vaccine', exam:'Exam', prescription:'Rx', lab:'Lab', scan:'Scan',
  }

  const tabs: { id: ClinicTab; label: string }[] = [
    { id:'patients', label:`Patients${patients.length ? ` · ${patients.length}` : ''}` },
    { id:'activity', label:`Activity${activity.length ? ` · ${activity.length}` : ''}` },
  ]

  const cardShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px #EBEBEB'
  const cardHoverShadow = '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px #E0E0E0'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      <ClinicSidebar user={user} orgName={orgName || 'Your Clinic'} />

      <main style={{ flex:1, padding:'40px 48px', overflow:'auto', minWidth:0 }}>

        {/* Page title row */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom: orgName ? 4 : 0 }}>Dashboard</h1>
            {orgName && <p style={{ fontSize:14, color:'#6B7280' }}>{orgName}</p>}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:2 }}>
            <Link href="/scan"
              style={{ display:'inline-flex', alignItems:'center', background:'#FFFFFF', border:'1px solid #D1D5DB', borderRadius:10, padding:'9px 16px', fontSize:13, color:'#6B7280', textDecoration:'none', fontWeight:500, transition:'border-color 0.15s ease-out, color 0.15s ease-out' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF'; (e.currentTarget as HTMLElement).style.color = '#0A0A0A' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLElement).style.color = '#6B7280' }}>
              Scan Chip
            </Link>
            <button className="btn-primary" style={{ padding:'9px 18px', height:'auto', fontSize:13 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D4750B' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#E8820C' }}>
              + Register Chip
            </button>
          </div>
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

        {/* Patients tab */}
        {activeTab === 'patients' && (
          <div className="fade-up">
            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
              {[
                { label:'Patients',  value: patients.length, icon:'users' },
                { label:'Records',   value: totalRecords,    icon:'file'  },
                { label:'Chipped',   value: chippedCount,    icon:'chip'  },
                { label:'Activity',  value: activity.length, icon:'clock' },
              ].map(({ label, value, icon }) => (
                <div key={label}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = cardHoverShadow; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = cardShadow; (e.currentTarget as HTMLElement).style.transform = '' }}
                  style={{ background:'#FFFFFF', borderRadius:12, padding:'20px', boxShadow:cardShadow, transition:'box-shadow 0.15s ease-out, transform 0.15s ease-out' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <StatIcon name={icon} />
                    </div>
                  </div>
                  <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.03em', color:'#0A0A0A', lineHeight:1 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Patients table */}
            <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:15, fontWeight:600, color:'#0A0A0A' }}>All Patients</span>
                <span style={{ fontSize:13, color:'#9CA3AF' }}>{patients.length} total</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.5fr 1fr 0.7fr', padding:'10px 24px', borderBottom:'1px solid #EBEBEB', background:'#FAFAFA' }}>
                {['Patient', 'Owner', 'Chip #', 'Last Visit', 'Records'].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</div>
                ))}
              </div>
              {patients.length === 0 ? (
                <div style={{ padding:'56px 24px', textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>🐾</div>
                  <p style={{ color:'#6B7280', fontSize:15 }}>No patients registered yet</p>
                </div>
              ) : patients.map((p: any, i: number) => (
                <div key={p.pet_id}
                  onClick={() => openPatient(p)}
                  style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.5fr 1fr 0.7fr', padding:'14px 24px', alignItems:'center', borderBottom: i < patients.length - 1 ? '1px solid #EBEBEB' : 'none', cursor:'pointer', background: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF', transition:'background 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF9F5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                      {petEmoji(p.species)}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>{p.pet_name}</div>
                      <div style={{ fontSize:12, color:'#9CA3AF', marginTop:1 }}>{p.breed || p.species}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'#6B7280' }}>{p.owner_name || '—'}</div>
                  <div style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:12, color:'#9CA3AF', letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.chip_number ? p.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4') : '—'}
                  </div>
                  <div style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(p.last_visit_date)}</div>
                  <div>
                    <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:999, padding:'3px 10px', fontSize:12, fontWeight:500 }}>{p.record_count ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>

            {/* Activity feed */}
            <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, overflow:'hidden' }}>
              <div style={{ padding:'18px 24px', borderBottom:'1px solid #EBEBEB' }}>
                <span style={{ fontSize:15, fontWeight:600, color:'#0A0A0A' }}>Recent Activity</span>
              </div>
              {activity.length === 0 ? (
                <div style={{ padding:'56px 24px', textAlign:'center' }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>🐾</div>
                  <p style={{ color:'#6B7280', fontSize:15 }}>No recent activity</p>
                </div>
              ) : activity.map((a: any, i: number) => {
                const typeLabel = activityTypeLabel[a.activity_type] ?? a.activity_type
                return (
                  <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'14px 24px', borderBottom: i < activity.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                    <span style={{ fontSize:11, fontWeight:600, background:'#F4F4F5', color:'#6B7280', borderRadius:999, padding:'3px 8px', flexShrink:0, marginTop:2, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{typeLabel}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.pet_name} — {a.description}</div>
                      <div style={{ fontSize:12, color:'#9CA3AF', marginTop:2 }}>{fmtDT(a.activity_date)}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick actions */}
            <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, padding:'20px 20px', alignSelf:'start' }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Link href="/scan"
                  style={{ display:'flex', alignItems:'center', padding:'11px 14px', border:'1px solid #D1D5DB', borderRadius:10, textDecoration:'none', color:'#0A0A0A', fontSize:14, fontWeight:500, transition:'border-color 0.15s ease-out, background 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8820C'; (e.currentTarget as HTMLElement).style.background = '#FEF9F5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLElement).style.background = '' }}>
                  Scan a Chip
                </Link>
                <Link href="/clinic/integrations"
                  style={{ display:'flex', alignItems:'center', padding:'11px 14px', border:'1px solid #D1D5DB', borderRadius:10, textDecoration:'none', color:'#0A0A0A', fontSize:14, fontWeight:500, transition:'border-color 0.15s ease-out, background 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8820C'; (e.currentTarget as HTMLElement).style.background = '#FEF9F5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'; (e.currentTarget as HTMLElement).style.background = '' }}>
                  PIMS Integrations
                </Link>
                <button className="btn-primary" style={{ width:'100%', textAlign:'left', justifyContent:'flex-start', padding:'11px 14px', height:'auto', fontSize:14 }}>
                  AI Medical Summary
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Patient detail panel */}
      {selectedPatient && (
        <div onClick={() => setSelectedPatient(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:200, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ width:420, background:'#FFFFFF', height:'100vh', overflowY:'auto', boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', animation:'slideInRight 150ms ease-out' }}>

            {/* Header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:14, position:'sticky', top:0, background:'#FFFFFF', zIndex:1 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                {petEmoji(selectedPatient.species)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:17, fontWeight:600, color:'#0A0A0A', letterSpacing:'-0.01em' }}>{selectedPatient.pet_name}</div>
                <div style={{ fontSize:13, color:'#6B7280', marginTop:1 }}>{selectedPatient.breed || selectedPatient.species}{selectedPatient.owner_name ? ` · ${selectedPatient.owner_name}` : ''}</div>
              </div>
              <button onClick={() => setSelectedPatient(null)}
                style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s ease-out' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EBEBEB' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F4F4F5' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {panelLoading ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" /></div>
            ) : (
              <div style={{ padding:'20px 24px', flex:1 }}>

                {/* Chip card */}
                {panelChip && (
                  <div style={{ background:'#0A0A0A', borderRadius:12, padding:'16px 20px', marginBottom:24, position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'16px 16px' }} />
                    <div style={{ position:'relative' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Microchip</span>
                        <span style={{ fontSize:11, color:'white', background:'#E8820C', borderRadius:999, padding:'2px 8px', fontWeight:600 }}>
                          {panelChip.status === 'registered' ? 'Registered' : panelChip.status ?? '—'}
                        </span>
                      </div>
                      <div style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:13, color:'rgba(255,255,255,0.85)', letterSpacing:'0.12em' }}>
                        {panelChip.chip_number?.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4') || '—'}
                      </div>
                      {panelChip.nfc_uid && (
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4, fontFamily:"'SF Mono','Fira Code',monospace", letterSpacing:'0.06em' }}>NFC {panelChip.nfc_uid}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Records header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em' }}>Medical Records</span>
                  {!addingRecord && (
                    <button onClick={() => setAddingRecord(true)}
                      style={{ fontSize:13, fontWeight:500, color:'#E8820C', background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', transition:'color 0.15s ease-out' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4750B' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#E8820C' }}>
                      + Add Record
                    </button>
                  )}
                </div>

                {/* Add record form */}
                {addingRecord && (
                  <div style={{ background:'#FAFAFA', borderRadius:12, border:'1px solid #EBEBEB', padding:'16px', marginBottom:16 }}>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:12, fontWeight:500, color:'#6B7280', display:'block', marginBottom:6 }}>Type</label>
                      <select value={newRecord.type} onChange={e => setNewRecord(r => ({ ...r, type: e.target.value }))}
                        style={{ width:'100%', height:36, border:'1px solid #D1D5DB', borderRadius:8, padding:'0 10px', fontSize:13, fontFamily:'inherit', background:'#FFFFFF', color:'#0A0A0A', cursor:'pointer', outline:'none' }}>
                        <option value="exam">Exam</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="prescription">Prescription</option>
                        <option value="lab">Lab</option>
                      </select>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:12, fontWeight:500, color:'#6B7280', display:'block', marginBottom:6 }}>Description</label>
                      <input className="hb-input" type="text" value={newRecord.description}
                        onChange={e => setNewRecord(r => ({ ...r, description: e.target.value }))}
                        placeholder="e.g. Annual wellness exam" autoFocus />
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={{ fontSize:12, fontWeight:500, color:'#6B7280', display:'block', marginBottom:6 }}>Notes <span style={{ fontWeight:400, color:'#9CA3AF' }}>(optional)</span></label>
                      <textarea value={newRecord.notes}
                        onChange={e => setNewRecord(r => ({ ...r, notes: e.target.value }))}
                        placeholder="Clinical notes..."
                        style={{ width:'100%', minHeight:72, border:'1px solid #D1D5DB', borderRadius:8, padding:'8px 10px', fontSize:13, fontFamily:'inherit', color:'#0A0A0A', resize:'vertical', outline:'none', lineHeight:1.5, background:'#FFFFFF' }}
                        onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0A0A0A' }}
                        onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }} />
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={saveRecord} disabled={savingRecord || !newRecord.description.trim()} className="btn-primary" style={{ flex:1 }}>
                        {savingRecord ? 'Saving…' : 'Save Record'}
                      </button>
                      <button onClick={() => { setAddingRecord(false); setNewRecord({ type:'exam', description:'', notes:'' }) }} className="btn-secondary" style={{ flex:1 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Records list */}
                {panelRecords.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'32px 0' }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>🐾</div>
                    <p style={{ fontSize:14, color:'#9CA3AF' }}>No records yet</p>
                  </div>
                ) : panelRecords.map((r: any, i: number) => {
                  const typeLabel: Record<string, string> = { vaccination:'Vaccine', exam:'Exam', prescription:'Rx', lab:'Lab' }
                  return (
                    <div key={r.id} style={{ paddingBottom: i < panelRecords.length - 1 ? 14 : 0, marginBottom: i < panelRecords.length - 1 ? 14 : 0, borderBottom: i < panelRecords.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                        <span style={{ fontSize:11, fontWeight:600, background:'#F4F4F5', color:'#6B7280', borderRadius:999, padding:'3px 8px', flexShrink:0, marginTop:1, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                          {typeLabel[r.record_type] ?? r.record_type}
                        </span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A' }}>{r.description}</div>
                          {r.notes && <div style={{ fontSize:12, color:'#6B7280', marginTop:3, lineHeight:1.5 }}>{r.notes}</div>}
                          <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>{fmtDate(r.record_date)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes slideInRight { from { transform:translateX(100%); } to { transform:translateX(0); } }`}</style>
    </div>
  )
}
