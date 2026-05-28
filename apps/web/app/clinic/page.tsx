'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDT(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const speciesLabel: Record<string, string> = { dog: 'Dog', cat: 'Cat' }

function Sidebar({ user, orgName }: { user: any; orgName: string }) {
  const router = useRouter()
  const initials = (user?.full_name || 'SC').split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const roleLabel = user?.role === 'clinic_admin' ? 'Clinic Admin' : 'Staff'

  const navItems = [
    { label: 'Dashboard',         href: '/clinic',              active: true,  badge: undefined },
    { label: 'Patients',          href: '/clinic',              active: false, badge: undefined },
    { label: 'Records',           href: '/clinic',              active: false, badge: undefined },
    { label: 'Chip Registration', href: '/clinic',              active: false, badge: undefined },
    { label: 'AI Summaries',      href: '/clinic',              active: false, badge: undefined },
    { label: 'PIMS Integrations', href: '/clinic/integrations', active: false, badge: 'New'     },
    { label: 'Reports',           href: '/clinic',              active: false, badge: undefined },
    { label: 'Settings',          href: '/clinic',              active: false, badge: undefined },
  ]

  return (
    <aside style={{ width:220, flexShrink:0, background:'#FFFFFF', borderRight:'1px solid #EBEBEB', display:'flex', flexDirection:'column', minHeight:'100vh', position:'sticky', top:0 }}>
      <div style={{ padding:'20px 16px', borderBottom:'1px solid #EBEBEB' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#E8820C"/>
          </svg>
          <span style={{ fontWeight:700, fontSize:15, color:'#0A0A0A', letterSpacing:'-0.02em' }}>Honeybee</span>
        </Link>
        <div style={{ fontSize:12, color:'#6B7280', paddingLeft:28, lineHeight:1.3 }}>{orgName}</div>
      </div>
      <nav style={{ flex:1, padding:'8px' }}>
        {navItems.map(({ label, href, active, badge }) => (
          <Link key={label} href={href} style={{ textDecoration:'none' }}>
            <div style={{ display:'flex', alignItems:'center', padding:'8px 12px', paddingLeft: active ? '10px' : '12px', borderRadius:6, marginBottom:2, color: active ? '#0A0A0A' : '#6B7280', fontSize:14, fontWeight: active ? 500 : 400, cursor:'pointer', borderLeft: active ? '2px solid #E8820C' : '2px solid transparent', transition:'color 0.15s ease-out' }}>
              <span style={{ flex:1 }}>{label}</span>
              {badge && <span style={{ fontSize:10, background:'#E8820C', color:'white', borderRadius:4, padding:'2px 6px', fontWeight:600 }}>{badge}</span>}
            </div>
          </Link>
        ))}
      </nav>
      <div style={{ padding:'16px', borderTop:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'white', flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.full_name || 'Dr. Sarah Chen'}</div>
          <div style={{ fontSize:11, color:'#6B7280' }}>{roleLabel}</div>
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

export default function ClinicDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orgName, setOrgName] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

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
        const uid = session.user.id

        const { data: profileData } = await supabase
          .from('profiles').select('*').eq('id', uid).limit(1)
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
    return (
      <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const totalRecords = patients.reduce((sum: number, p: any) => sum + Number(p.record_count ?? 0), 0)

  const stats = [
    { label:'Total Patients',  value: patients.length },
    { label:'Medical Records', value: totalRecords },
    { label:'Chipped',         value: patients.filter((p: any) => p.chip_number).length },
    { label:'Recent Activity', value: activity.length },
  ]

  const activityTypeLabel: Record<string, string> = {
    vaccination:  'Vaccine',
    exam:         'Exam',
    prescription: 'Rx',
    lab:          'Lab',
    scan:         'Scan',
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      <Sidebar user={user} orgName={orgName || 'Your Clinic'} />

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        <header style={{ background:'#FFFFFF', borderBottom:'1px solid #EBEBEB', padding:'0 28px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <h1 style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.02em', color:'#0A0A0A' }}>Dashboard</h1>
            {orgName && <div style={{ fontSize:12, color:'#6B7280', marginTop:1 }}>{orgName}</div>}
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Link href="/scan" style={{ display:'flex', alignItems:'center', gap:7, background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:8, padding:'8px 14px', fontSize:13, color:'#6B7280', textDecoration:'none', fontWeight:500, transition:'border-color 0.15s ease-out' }}>
              Scan Chip
            </Link>
            <button style={{ display:'flex', alignItems:'center', gap:7, background:'#E8820C', color:'white', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', transition:'background 0.15s ease-out' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D4750B' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#E8820C' }}
            >
              + Register Chip
            </button>
          </div>
        </header>

        <main style={{ flex:1, padding:'24px 28px', overflow:'auto' }}>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
            {stats.map(({ label, value }) => (
              <div key={label} style={{ background:'#FFFFFF', borderRadius:8, border:'1px solid #EBEBEB', padding:'18px 20px' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>{label}</div>
                <div style={{ fontSize:32, fontWeight:700, letterSpacing:'-0.03em', color:'#0A0A0A', lineHeight:1 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>

            {/* Patients table */}
            <div style={{ background:'#FFFFFF', borderRadius:8, border:'1px solid #EBEBEB', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #EBEBEB', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h2 style={{ fontSize:15, fontWeight:700, color:'#0A0A0A' }}>Patients</h2>
                <span style={{ fontSize:13, color:'#6B7280' }}>{patients.length} total</span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1.2fr 1.5fr 1fr 0.7fr', padding:'10px 20px', borderBottom:'1px solid #EBEBEB', background:'#FAFAFA' }}>
                {['Patient', 'Owner', 'Chip #', 'Last Visit', 'Records'].map(h => (
                  <div key={h} style={{ fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
                ))}
              </div>

              {patients.length === 0 ? (
                <div style={{ padding:'48px 20px', textAlign:'center', color:'#6B7280', fontSize:14 }}>
                  No patients registered yet
                </div>
              ) : patients.map((p: any, i: number) => (
                <div
                  key={p.pet_id}
                  style={{ display:'grid', gridTemplateColumns:'1.8fr 1.2fr 1.5fr 1fr 0.7fr', padding:'13px 20px', alignItems:'center', borderBottom: i < patients.length - 1 ? '1px solid #EBEBEB' : 'none', cursor:'pointer', background: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF', transition:'background 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i % 2 === 1 ? '#FAFAFA' : '#FFFFFF' }}
                >
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
                  <div style={{ fontFamily:"'SF Mono', 'Fira Code', monospace", fontSize:12, color:'#6B7280', letterSpacing:'0.04em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.chip_number
                      ? p.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
                      : '—'}
                  </div>
                  <div style={{ fontSize:13, color:'#6B7280' }}>{fmtDate(p.last_visit_date)}</div>
                  <div>
                    <span style={{ background:'#F4F4F5', color:'#3F3F46', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:500 }}>
                      {p.record_count ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Recent activity */}
              <div style={{ background:'#FFFFFF', borderRadius:8, border:'1px solid #EBEBEB', overflow:'hidden' }}>
                <div style={{ padding:'16px 18px', borderBottom:'1px solid #EBEBEB' }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#0A0A0A' }}>Recent Activity</h3>
                </div>
                {activity.length === 0 ? (
                  <div style={{ padding:'20px 18px', fontSize:13, color:'#6B7280' }}>No recent activity</div>
                ) : activity.map((a: any, i: number) => {
                  const typeLabel = activityTypeLabel[a.activity_type] ?? a.activity_type
                  return (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'11px 18px', borderBottom: i < activity.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                      <span style={{ fontSize:10, fontWeight:600, background:'#F4F4F5', color:'#3F3F46', borderRadius:4, padding:'3px 7px', flexShrink:0, marginTop:2, letterSpacing:'0.02em' }}>
                        {typeLabel}
                      </span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {a.pet_name} — {a.description}
                        </div>
                        <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{fmtDT(a.activity_date)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick actions */}
              <div style={{ background:'#FFFFFF', borderRadius:8, border:'1px solid #EBEBEB', padding:18 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#0A0A0A', marginBottom:12 }}>Quick Actions</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <Link href="/scan" style={{ display:'flex', alignItems:'center', padding:'11px 14px', background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:8, textDecoration:'none', color:'#0A0A0A', fontSize:14, fontWeight:500, transition:'border-color 0.15s ease-out' }}>
                    Scan a Chip
                  </Link>
                  <Link href="/clinic/integrations" style={{ display:'flex', alignItems:'center', padding:'11px 14px', background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:8, textDecoration:'none', color:'#0A0A0A', fontSize:14, fontWeight:500, transition:'border-color 0.15s ease-out' }}>
                    PIMS Integrations
                  </Link>
                  <button style={{ display:'flex', alignItems:'center', padding:'11px 14px', background:'#E8820C', border:'none', borderRadius:8, color:'white', fontSize:14, fontWeight:600, cursor:'pointer', width:'100%', textAlign:'left', transition:'background 0.15s ease-out' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D4750B' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#E8820C' }}
                  >
                    AI Medical Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
