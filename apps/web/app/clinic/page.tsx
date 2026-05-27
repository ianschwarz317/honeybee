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

const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈' }

const Sidebar = ({ user }: { user: any }) => (
  <aside style={{ width: 220, flexShrink: 0, background: '#1D1D1F', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
        <Image src="/logo.svg" alt="Honeybee" width={24} height={24} style={{ borderRadius: 5 }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Honeybee</span>
      </Link>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 32, lineHeight: 1.3 }}>Summit Animal Hospital</div>
    </div>
    <nav style={{ flex: 1, padding: '10px 8px' }}>
      {[
        { label: 'Dashboard', icon: '⊞', href: '/clinic', active: true },
        { label: 'Patients', icon: '🐾', href: '/clinic' },
        { label: 'Records', icon: '📋', href: '/clinic' },
        { label: 'Chip Registration', icon: '📡', href: '/clinic' },
        { label: 'AI Summaries', icon: '✨', href: '/clinic' },
        { label: 'PIMS Integrations', icon: '🔗', href: '/clinic/integrations', badge: 'New' },
        { label: 'Reports', icon: '📊', href: '/clinic' },
        { label: 'Settings', icon: '⚙️', href: '/clinic' },
      ].map(({ label, icon, href, active, badge }) => (
        <Link key={label} href={href} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 2, background: active ? 'rgba(255,255,255,0.1)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: active ? 500 : 400, cursor: 'pointer' }}>
            <span style={{ width: 18, textAlign: 'center' }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
            {badge && <span style={{ fontSize: 10, background: 'var(--blue)', color: 'white', borderRadius: 100, padding: '2px 6px', fontWeight: 600 }}>{badge}</span>}
          </div>
        </Link>
      ))}
    </nav>
    <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>
        {(user?.full_name || 'SC').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{user?.full_name || 'Dr. Sarah Chen'}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Clinic Admin</div>
      </div>
    </div>
  </aside>
)

export default function ClinicDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      setDataLoading(true)

      const { data: petsData } = await supabase
        .from('pets')
        .select(`*, chips!inner(*, organizations(name))`)
        .eq('chips.registered_at_org', user!.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setPatients(petsData ?? [])

      const { data: recsData } = await supabase
        .from('medical_records')
        .select('*, pets(name)')
        .eq('organization_id', user!.organization_id)
        .order('created_at', { ascending: false })
        .limit(20)
      setRecords(recsData ?? [])

      setDataLoading(false)
    }
    load()
  }, [user])

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--blue)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const stats = [
    { label: 'Patients Today', value: patients.length, icon: '🐾', color: '#FFF3E0' },
    { label: 'Total Patients', value: patients.length, icon: '📁', color: '#EEF2FF' },
    { label: 'Chips Registered', value: patients.filter((p: any) => p.chips?.length > 0).length, icon: '📡', color: '#E8F8ED' },
    { label: 'Records', value: records.length, icon: '📋', color: '#FFF8E1' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar user={user} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/scan" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 8, padding: '7px 14px', fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>📡 Scan Chip</Link>
            <button className="btn-primary" style={{ fontSize: 14, padding: '8px 16px' }}>+ Register Chip</button>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {stats.map(({ label, value, icon, color }) => (
              <div key={label} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
            <div className="card">
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Patients</h2>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{patients.length} total</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 0.9fr', padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                  {['Patient', 'Owner', 'Chip', 'Last Visit', 'Weight'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                  ))}
                </div>
                {patients.length === 0 && (
                  <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                    No patients registered yet
                  </div>
                )}
                {patients.map((p: any, i: number) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 0.9fr', padding: '12px 18px', alignItems: 'center', borderBottom: i < patients.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{speciesEmoji[p.species] || '🐾'}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.breed}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13 }}>—</div>
                    <div>
                      {p.chips?.length > 0
                        ? <span className="badge-green">● Chipped</span>
                        : <span className="badge-amber">○ None</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(p.created_at)}</div>
                    <div style={{ fontSize: 13 }}>{p.weight_kg ? `${p.weight_kg} kg` : '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent Records</h3>
                {records.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No records yet</div>}
                {records.slice(0, 6).map((r: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>📋</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.pets?.name} · {fmtDate(r.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 18 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link href="/scan" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 9, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>
                    <span>📡</span> Scan a Chip
                  </Link>
                  <Link href="/clinic/integrations" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 9, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500 }}>
                    <span>🔗</span> PIMS Integrations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
