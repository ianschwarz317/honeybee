'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈' }

const activityBadge: Record<string, { label: string; bg: string; color: string }> = {
  vaccination:  { label: 'Vaccine', bg: '#EBF5F0', color: '#2D6A4F' },
  exam:         { label: 'Exam',    bg: '#FBF3E8', color: '#9E6520' },
  prescription: { label: 'Rx',      bg: '#F0ECFF', color: '#6B4FBA' },
  lab:          { label: 'Lab',     bg: '#FBEAE9', color: '#C0392B' },
  scan:         { label: 'Scan',    bg: '#EEF2FF', color: '#3B5BDB' },
}

function Sidebar({ user, orgName }: { user: any; orgName: string }) {
  const router = useRouter()
  const initials = (user?.full_name || 'SC').split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const roleLabel = user?.role === 'clinic_admin' ? 'Clinic Admin' : 'Staff'

  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#1D1D1F', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
          <Image src="/logo.svg" alt="Honeybee" width={24} height={24} style={{ borderRadius: 5 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Honeybee</span>
        </Link>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 32, lineHeight: 1.3 }}>{orgName}</div>
      </div>
      <nav style={{ flex: 1, padding: '10px 8px' }}>
        {[
          { label: 'Dashboard',        icon: '⊞', href: '/clinic',              active: true  },
          { label: 'Patients',         icon: '🐾', href: '/clinic'                            },
          { label: 'Records',          icon: '📋', href: '/clinic'                            },
          { label: 'Chip Registration',icon: '📡', href: '/clinic'                            },
          { label: 'AI Summaries',     icon: '✨', href: '/clinic'                            },
          { label: 'PIMS Integrations',icon: '🔗', href: '/clinic/integrations', badge: 'New' },
          { label: 'Reports',          icon: '📊', href: '/clinic'                            },
          { label: 'Settings',         icon: '⚙️', href: '/clinic'                            },
        ].map(({ label, icon, href, active, badge }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: active ? 500 : 400, cursor: 'pointer' }}>
              <span style={{ width: 18, textAlign: 'center' }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badge && <span style={{ fontSize: 10, background: '#C8832A', color: 'white', borderRadius: 100, padding: '2px 6px', fontWeight: 600 }}>{badge}</span>}
            </div>
          </Link>
        ))}
      </nav>
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#C8832A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || 'Dr. Sarah Chen'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{roleLabel}</div>
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.replace('/auth'))}
          title="Sign out"
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 16, padding: '4px 2px', flexShrink: 0, lineHeight: 1 }}
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
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const totalRecords = patients.reduce((sum: number, p: any) => sum + Number(p.record_count ?? 0), 0)

  const stats = [
    { label: 'Total Patients',   value: patients.length,                                   icon: '🐾', bg: '#FBF3E8' },
    { label: 'Medical Records',  value: totalRecords,                                       icon: '📋', bg: '#EBF5F0' },
    { label: 'Chipped',          value: patients.filter((p: any) => p.chip_number).length, icon: '📡', bg: '#EEF2FF' },
    { label: 'Recent Activity',  value: activity.length,                                   icon: '⚡', bg: '#FFF8E1' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF8' }}>
      <Sidebar user={user} orgName={orgName || 'Your Clinic'} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E8E3', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: '#1A1A18' }}>Dashboard</h1>
            {orgName && <div style={{ fontSize: 12, color: '#A8A89E', marginTop: 1 }}>{orgName}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/scan" style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F4F4F0', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#6B6B63', textDecoration: 'none', fontWeight: 500 }}>
              📡 Scan Chip
            </Link>
            <button style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#C8832A', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              + Register Chip
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 28px', overflow: 'auto' }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {stats.map(({ label, value, icon, bg }) => (
              <div key={label} style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E8E8E3', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#A8A89E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1A18' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

            {/* Patients table */}
            <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E8E8E3', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E8E3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18' }}>Patients</h2>
                <span style={{ fontSize: 13, color: '#A8A89E' }}>{patients.length} total</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1.5fr 1fr 0.7fr', padding: '10px 20px', borderBottom: '1px solid #E8E8E3', background: '#FAFAF8' }}>
                {['Patient', 'Owner', 'Chip #', 'Last Visit', 'Records'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#A8A89E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                ))}
              </div>

              {patients.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A8A89E', fontSize: 14 }}>
                  No patients registered yet
                </div>
              ) : patients.map((p: any, i: number) => (
                <div
                  key={p.pet_id}
                  style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1.5fr 1fr 0.7fr', padding: '13px 20px', alignItems: 'center', borderBottom: i < patients.length - 1 ? '1px solid #E8E8E3' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F4F4F0')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FBF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {speciesEmoji[p.species] || '🐾'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18' }}>{p.pet_name}</div>
                      <div style={{ fontSize: 12, color: '#A8A89E', marginTop: 1 }}>{p.breed || p.species}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#1A1A18' }}>{p.owner_name || '—'}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B6B63', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.chip_number
                      ? p.chip_number.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
                      : '—'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B6B63' }}>{fmtDate(p.last_visit_date)}</div>
                  <div>
                    <span style={{ background: '#EBF5F0', color: '#2D6A4F', borderRadius: 100, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                      {p.record_count ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Recent activity feed */}
              <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E8E8E3', overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #E8E8E3' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18' }}>Recent Activity</h3>
                </div>
                {activity.length === 0 ? (
                  <div style={{ padding: '20px 18px', fontSize: 13, color: '#A8A89E' }}>No recent activity</div>
                ) : activity.map((a: any, i: number) => {
                  const badge = activityBadge[a.activity_type] ?? { label: a.activity_type, bg: '#F4F4F0', color: '#6B6B63' }
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 18px', borderBottom: i < activity.length - 1 ? '1px solid #E8E8E3' : 'none' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, borderRadius: 6, padding: '3px 7px', flexShrink: 0, marginTop: 2, letterSpacing: '0.02em' }}>
                        {badge.label}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {a.pet_name} — {a.description}
                        </div>
                        <div style={{ fontSize: 11, color: '#A8A89E', marginTop: 2 }}>{fmtDT(a.activity_date)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick actions */}
              <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E8E8E3', padding: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18', marginBottom: 12 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/scan" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F4F4F0', borderRadius: 10, textDecoration: 'none', color: '#1A1A18', fontSize: 14, fontWeight: 500 }}>
                    <span>📡</span> Scan a Chip
                  </Link>
                  <Link href="/clinic/integrations" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F4F4F0', borderRadius: 10, textDecoration: 'none', color: '#1A1A18', fontSize: 14, fontWeight: 500 }}>
                    <span>🔗</span> PIMS Integrations
                  </Link>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#FBF3E8', borderRadius: 10, color: '#9E6520', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    <span>✨</span> AI Medical Summary
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
