import Link from 'next/link'
import Image from 'next/image'
import { mockClinic, mockPatients, mockStats, mockActivity } from '@/lib/mock-data'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const actIcon: Record<string, string> = { record: '📋', chip: '📡', ai: '✨' }
const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐈' }

const Sidebar = () => (
  <aside style={{ width: 220, flexShrink: 0, background: '#1D1D1F', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 4 }}>
        <Image src="/logo.svg" alt="Honeybee" width={24} height={24} style={{ borderRadius: 5 }} />
        <span style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>Honeybee</span>
      </Link>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 32, lineHeight: 1.3 }}>{mockClinic.name}</div>
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
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>{mockClinic.initials}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{mockClinic.doctor}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Clinic Admin</div>
      </div>
    </div>
  </aside>
)

export default function ClinicDashboard() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 28px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Dashboard</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 8, padding: '7px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>🔍 Search patients…</div>
            <button className="btn-primary" style={{ fontSize: 14, padding: '8px 16px' }}>+ Register Chip</button>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, overflow: 'auto' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Patients Today', value: mockStats.today, icon: '🐾', color: '#FFF3E0' },
              { label: 'Total Patients', value: mockStats.total, icon: '📁', color: '#EEF2FF' },
              { label: 'Chips This Month', value: mockStats.chipsMonth, icon: '📡', color: '#E8F8ED' },
              { label: 'Records Today', value: mockStats.recordsToday, icon: '📋', color: '#FFF8E1' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Two-col layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
            {/* Patient table */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Patients</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['All','Dogs','Cats'].map((f,i) => (
                    <button key={f} style={{ fontSize: 13, padding: '5px 12px', borderRadius: 7, border: 'none', background: i === 0 ? 'var(--text-primary)' : 'var(--surface)', color: i === 0 ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 0.9fr', padding: '10px 18px', fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  {['Patient','Owner','Last Visit','Next Due','Chip'].map(h => <span key={h}>{h}</span>)}
                </div>
                {mockPatients.map((p, i) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 0.9fr', padding: '12px 18px', alignItems: 'center', borderBottom: i < mockPatients.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: p.hue + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{speciesEmoji[p.species]}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.breed} · {p.age}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.owner}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(p.lastVisit)}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.nextDue}</div>
                    <div>
                      {p.chipped
                        ? <span className="badge-green" style={{ fontSize: 11 }}>✓ Chipped</span>
                        : <span className="badge-amber" style={{ fontSize: 11 }}>Register</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Chip lookup */}
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Quick Chip Lookup</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input readOnly placeholder="15-digit chip #" style={{ flex: 1, border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', background: 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none' }} />
                  <button className="btn-primary" style={{ fontSize: 13, padding: '8px 14px' }}>Go</button>
                </div>
                <div style={{ background: 'var(--green-light)', borderRadius: 9, padding: '12px 14px' }}>
                  <span className="badge-green" style={{ marginBottom: 6, display: 'inline-flex' }}>✓ Found</span>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Biscuit — Golden Retriever</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>John Smith · (801) 555-0192</div>
                </div>
              </div>

              {/* Add record */}
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add Medical Record</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    <select key="p" style={{ width: '100%', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', background: 'var(--surface-2)', color: 'var(--text-secondary)', outline: 'none' }}><option>Select patient…</option>{mockPatients.slice(0,3).map(p => <option key={p.id}>{p.name} ({p.owner})</option>)}</select>,
                    <select key="t" style={{ width: '100%', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', background: 'var(--surface-2)', color: 'var(--text-secondary)', outline: 'none' }}><option>Record type…</option>{['Exam','Vaccination','Lab','Prescription','Note'].map(t => <option key={t}>{t}</option>)}</select>,
                    <input key="title" readOnly placeholder="Title" style={{ border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', background: 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none' }} />,
                    <textarea key="notes" readOnly placeholder="Clinical notes…" rows={3} style={{ border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', background: 'var(--surface-2)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />,
                  ]}
                  <button className="btn-primary" style={{ width: '100%', fontSize: 14 }}>Save Record</button>
                </div>
              </div>

              {/* Activity */}
              <div className="card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Today&apos;s Activity</div>
                {mockActivity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{actIcon[a.type]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
