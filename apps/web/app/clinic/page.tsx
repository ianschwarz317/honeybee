'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}
function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })
}

const speciesLabel: Record<string, string> = { dog:'Dog', cat:'Cat' }

function NavIcon({ name, color }: { name: string; color: string }) {
  const s = { width:20, height:20, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:'1.5', strokeLinecap:'round' as const, strokeLinejoin:'round' as const }
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

function Sidebar({ user, orgName }: { user: any; orgName: string }) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const initials = (user?.full_name || 'SC').split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const roleLabel = user?.role === 'clinic_admin' ? 'Clinic Admin' : 'Staff'
  const nav = [
    { label:'Dashboard',         href:'/clinic',              icon:'grid',     active:true,  badge:undefined },
    { label:'Patients',          href:'/clinic',              icon:'users',    active:false, badge:undefined },
    { label:'Records',           href:'/clinic',              icon:'file',     active:false, badge:undefined },
    { label:'Chip Registration', href:'/clinic',              icon:'chip',     active:false, badge:undefined },
    { label:'AI Summaries',      href:'/clinic',              icon:'star',     active:false, badge:undefined },
    { label:'PIMS Integrations', href:'/clinic/integrations', icon:'link',     active:false, badge:'New'     },
    { label:'Reports',           href:'/clinic',              icon:'bar',      active:false, badge:undefined },
    { label:'Settings',          href:'/clinic',              icon:'settings', active:false, badge:undefined },
  ]
  return (
    <aside style={{ width:240, flexShrink:0, background:'#FFFFFF', borderRight:'1px solid #EBEBEB', display:'flex', flexDirection:'column', minHeight:'100vh', position:'sticky', top:0 }}>
      <div style={{ padding:'20px 20px 18px', borderBottom:'1px solid #EBEBEB' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom: orgName ? 4 : 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#E8820C"/></svg>
          <span style={{ fontWeight:700, fontSize:14, color:'#0A0A0A', letterSpacing:'-0.02em' }}>Honeybee</span>
        </Link>
        {orgName && <div style={{ fontSize:12, color:'#6B7280', paddingLeft:28, lineHeight:1.3 }}>{orgName}</div>}
      </div>
      <nav style={{ flex:1, padding:'8px 12px' }}>
        {nav.map(({ label, href, icon, active, badge }) => (
          <Link key={label} href={href} style={{ textDecoration:'none' }}>
            <div onMouseEnter={() => setHovered(label)} onMouseLeave={() => setHovered(null)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', paddingLeft: active ? '14px' : '16px', borderRadius:8, marginBottom:2, color: active ? '#0A0A0A' : '#6B7280', fontSize:14, fontWeight: active ? 500 : 400, cursor:'pointer', borderLeft: active ? '2px solid #E8820C' : '2px solid transparent', background: !active && hovered === label ? '#F4F4F5' : 'transparent', transition:'background 0.15s ease-out' }}>
              <NavIcon name={icon} color={active ? '#0A0A0A' : '#9CA3AF'} />
              <span style={{ flex:1 }}>{label}</span>
              {badge && <span style={{ fontSize:10, background:'#F4F4F5', color:'#3F3F46', borderRadius:4, padding:'2px 6px', fontWeight:600 }}>{badge}</span>}
            </div>
          </Link>
        ))}
      </nav>
      <div style={{ padding:'16px', borderTop:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'white', flexShrink:0 }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.full_name || 'Dr. Sarah Chen'}</div>
          <div style={{ fontSize:11, color:'#6B7280' }}>{roleLabel}</div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))} title="Sign out" style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', fontSize:14, padding:'4px', flexShrink:0, lineHeight:1, fontFamily:'inherit' }}>↪</button>
      </div>
    </aside>
  )
}

type ClinicTab = 'patients' | 'activity'

export default function ClinicDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orgName, setOrgName] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ClinicTab>('patients')

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

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      <Sidebar user={user} orgName={orgName || 'Your Clinic'} />

      <main style={{ flex:1, padding:'40px 48px', overflow:'auto', minWidth:0 }}>

        {/* Page title row */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom: orgName ? 4 : 0 }}>Dashboard</h1>
            {orgName && <p style={{ fontSize:14, color:'#6B7280' }}>{orgName}</p>}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:2 }}>
            <Link href="/scan"
              style={{ display:'inline-flex', alignItems:'center', background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:8, padding:'9px 16px', fontSize:13, color:'#6B7280', textDecoration:'none', fontWeight:500, transition:'border-color 0.15s ease-out' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB' }}>
              Scan Chip
            </Link>
            <button className="btn-primary" style={{ padding:'9px 16px', height:'auto', fontSize:13 }}
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
                { label:'Patients',        value: patients.length },
                { label:'Records',         value: totalRecords    },
                { label:'Chipped',         value: chippedCount    },
                { label:'Recent Activity', value: activity.length },
              ].map(({ label, value }) => (
                <div key={label} style={{ border:'1px solid #EBEBEB', borderRadius:8, padding:'24px' }}>
                  <div style={{ fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>{label}</div>
                  <div style={{ fontSize:28, fontWeight:600, letterSpacing:'-0.03em', color:'#0A0A0A', lineHeight:1 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Patients table */}
            <div style={{ border:'1px solid #EBEBEB', borderRadius:8, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>All Patients</span>
                <span style={{ fontSize:13, color:'#6B7280' }}>{patients.length} total</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1.2fr 1.5fr 1fr 0.7fr', padding:'10px 20px', borderBottom:'1px solid #EBEBEB', background:'#FAFAFA' }}>
                {['Patient', 'Owner', 'Chip #', 'Last Visit', 'Records'].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
                ))}
              </div>
              {patients.length === 0 ? (
                <div style={{ padding:'48px 20px', textAlign:'center', color:'#6B7280', fontSize:14 }}>No patients registered yet</div>
              ) : patients.map((p: any, i: number) => (
                <div key={p.pet_id}
                  style={{ display:'grid', gridTemplateColumns:'1.8fr 1.2fr 1.5fr 1fr 0.7fr', padding:'13px 20px', alignItems:'center', borderBottom: i < patients.length - 1 ? '1px solid #EBEBEB' : 'none', cursor:'pointer', background: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF', transition:'background 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'#F4F4F5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0, color:'#6B7280', fontWeight:600 }}>
                      {(speciesLabel[p.species] || 'Pet')[0]}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>{p.pet_name}</div>
                      <div style={{ fontSize:12, color:'#6B7280', marginTop:1 }}>{p.breed || p.species}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'#0A0A0A' }}>{p.owner_name || '—'}</div>
                  <div style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:12, color:'#6B7280', letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.chip_number ? p.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4') : '—'}
                  </div>
                  <div style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(p.last_visit_date)}</div>
                  <div><span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:500 }}>{p.record_count ?? 0}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>

            {/* Activity feed */}
            <div style={{ border:'1px solid #EBEBEB', borderRadius:8, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #EBEBEB' }}>
                <span style={{ fontSize:14, fontWeight:600, color:'#0A0A0A' }}>Recent Activity</span>
              </div>
              {activity.length === 0 ? (
                <div style={{ padding:'48px 20px', textAlign:'center', color:'#6B7280', fontSize:14 }}>No recent activity</div>
              ) : activity.map((a: any, i: number) => {
                const typeLabel = activityTypeLabel[a.activity_type] ?? a.activity_type
                return (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'14px 20px', borderBottom: i < activity.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                    <span style={{ fontSize:10, fontWeight:600, background:'#F4F4F5', color:'#3F3F46', borderRadius:4, padding:'3px 7px', flexShrink:0, marginTop:2, letterSpacing:'0.02em', whiteSpace:'nowrap' }}>{typeLabel}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.pet_name} — {a.description}</div>
                      <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{fmtDT(a.activity_date)}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick actions */}
            <div style={{ border:'1px solid #EBEBEB', borderRadius:8, padding:'20px', alignSelf:'start' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#0A0A0A', marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Link href="/scan"
                  style={{ display:'flex', alignItems:'center', padding:'11px 14px', border:'1px solid #EBEBEB', borderRadius:8, textDecoration:'none', color:'#0A0A0A', fontSize:14, fontWeight:500, transition:'border-color 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB' }}>
                  Scan a Chip
                </Link>
                <Link href="/clinic/integrations"
                  style={{ display:'flex', alignItems:'center', padding:'11px 14px', border:'1px solid #EBEBEB', borderRadius:8, textDecoration:'none', color:'#0A0A0A', fontSize:14, fontWeight:500, transition:'border-color 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EBEBEB' }}>
                  PIMS Integrations
                </Link>
                <button className="btn-primary" style={{ width:'100%', textAlign:'left', justifyContent:'flex-start', padding:'11px 14px', height:'auto', fontSize:14 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D4750B' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#E8820C' }}>
                  AI Medical Summary
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
