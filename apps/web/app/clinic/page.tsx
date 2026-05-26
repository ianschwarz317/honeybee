import Link from 'next/link'
import { mockClinic, mockPatients, mockClinicStats, mockRecentActivity } from '@/lib/mock-data'

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const activityIcons: Record<string, string> = {
  record: '📋',
  chip: '📡',
  ai: '✨',
}

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
}

export default function ClinicDashboard() {
  const clinic = mockClinic
  const patients = mockPatients
  const stats = mockClinicStats
  const activity = mockRecentActivity

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F7F4' }}>

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r" style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: '#2A2A2A' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: '#F5A623' }}>🐝</div>
            <span className="font-display font-bold text-base text-white">honeybee</span>
          </Link>
          <p className="text-xs mt-1 truncate" style={{ color: '#6B6B6B' }}>{clinic.name}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { label: 'Dashboard',  icon: '⊞', active: true },
            { label: 'Patients',   icon: '🐾', active: false },
            { label: 'Records',    icon: '📋', active: false },
            { label: 'Chip Lookup',icon: '📡', active: false },
            { label: 'AI Summaries', icon: '✨', active: false },
            { label: 'Reports',    icon: '📊', active: false },
            { label: 'Settings',   icon: '⚙️', active: false },
          ].map(({ label, icon, active }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
              style={{
                background: active ? '#F5A623' : 'transparent',
                color: active ? '#1A1A1A' : '#9CA3AF',
                fontWeight: active ? 600 : 400,
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </nav>

        {/* Staff */}
        <div className="px-4 py-4 border-t" style={{ borderColor: '#2A2A2A' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: '#F5A623', color: '#1A1A1A' }}>
              {clinic.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{clinic.staff_name}</p>
              <p className="text-xs" style={{ color: '#6B6B6B' }}>Clinic Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="border-b px-7 h-14 flex items-center justify-between flex-shrink-0" style={{ background: 'white', borderColor: '#EDEBE6' }}>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: '#1A1A1A' }}>Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: '#F8F7F4', color: '#6B6B6B' }}>
              <span>🔍</span>
              <span>Search patients...</span>
            </div>
            <button className="btn-honey py-2 px-4 text-sm">
              + Register Chip
            </button>
          </div>
        </header>

        <main className="flex-1 p-7 overflow-auto">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 fade-up">
            {[
              { label: 'Patients Today',      value: stats.patients_today,    icon: '🐾', color: '#F5A623', bg: '#FFF8EC' },
              { label: 'Total Patients',       value: stats.total_patients,    icon: '📁', color: '#6366F1', bg: '#EEF2FF' },
              { label: 'Chips This Month',     value: stats.chips_this_month,  icon: '📡', color: '#10B981', bg: '#F0FDF4' },
              { label: 'Records Today',        value: stats.records_today,     icon: '📋', color: '#F59E0B', bg: '#FFFBEB' },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{label.toUpperCase()}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: bg }}>
                    {icon}
                  </div>
                </div>
                <p className="font-display text-3xl font-bold" style={{ color: '#1A1A1A' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Two columns: patients + side panel */}
          <div className="grid grid-cols-3 gap-5">

            {/* Patient list */}
            <div className="col-span-2 fade-up fade-up-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold" style={{ color: '#1A1A1A' }}>Patients</h2>
                <div className="flex gap-2">
                  {['All', 'Dogs', 'Cats'].map((f) => (
                    <button key={f} className="text-xs px-3 py-1 rounded-lg transition-colors" style={{
                      background: f === 'All' ? '#1A1A1A' : '#F0EDE7',
                      color: f === 'All' ? 'white' : '#6B6B6B',
                    }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden">
                {/* Table header */}
                <div className="grid px-5 py-3 text-xs font-semibold" style={{ color: '#9CA3AF', background: '#FAFAF9', borderBottom: '1px solid #F0EDE7', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr' }}>
                  <span>PATIENT</span>
                  <span>OWNER</span>
                  <span>LAST VISIT</span>
                  <span>NEXT DUE</span>
                  <span>CHIP</span>
                </div>

                {patients.map((p, i) => (
                  <div
                    key={p.id}
                    className="grid px-5 py-3.5 items-center cursor-pointer hover:bg-amber-50 transition-colors"
                    style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', borderBottom: i < patients.length - 1 ? '1px solid #F9F8F6' : 'none' }}
                  >
                    {/* Patient */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: p.color + '22', border: `1.5px solid ${p.color}44` }}>
                        {speciesEmoji[p.species]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{p.breed} · {p.age}</p>
                      </div>
                    </div>

                    {/* Owner */}
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>{p.owner}</p>

                    {/* Last visit */}
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>{formatDate(p.last_visit)}</p>

                    {/* Next due */}
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>{p.next_due}</p>

                    {/* Chip status */}
                    {p.chip_status === 'registered' ? (
                      <span className="chip-badge text-xs">✓ Chipped</span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: '#FEF9EE', color: '#92400E', border: '1px solid #FDE68A' }}>
                        Register
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">

              {/* Chip lookup */}
              <div className="card p-5 fade-up fade-up-2">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>Quick Chip Lookup</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Enter 15-digit chip #"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none"
                    style={{ borderColor: '#E5E1D8', background: '#FAFAF9', color: '#1A1A1A' }}
                    readOnly
                  />
                  <button className="btn-honey px-3 py-2 text-sm">Go</button>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="chip-badge">✓ Found</span>
                    <span className="text-xs font-mono" style={{ color: '#6B6B6B' }}>985...678</span>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Biscuit — Golden Retriever</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>Owner: Ian Schwarz · (801) 555-0192</p>
                </div>
              </div>

              {/* Add record */}
              <div className="card p-5 fade-up fade-up-3">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>Add Medical Record</h3>
                <div className="space-y-2.5">
                  <select className="w-full text-sm px-3 py-2 rounded-lg border appearance-none outline-none" style={{ borderColor: '#E5E1D8', background: '#FAFAF9', color: '#6B6B6B' }}>
                    <option>Select patient...</option>
                    {mockPatients.slice(0,3).map(p => <option key={p.id}>{p.name} ({p.owner})</option>)}
                  </select>
                  <select className="w-full text-sm px-3 py-2 rounded-lg border appearance-none outline-none" style={{ borderColor: '#E5E1D8', background: '#FAFAF9', color: '#6B6B6B' }}>
                    <option>Record type...</option>
                    {['Exam', 'Vaccination', 'Lab', 'Prescription', 'Surgery', 'Note'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input placeholder="Title" className="w-full text-sm px-3 py-2 rounded-lg border outline-none" style={{ borderColor: '#E5E1D8', background: '#FAFAF9', color: '#1A1A1A' }} readOnly />
                  <textarea placeholder="Clinical notes..." rows={3} className="w-full text-sm px-3 py-2 rounded-lg border outline-none resize-none" style={{ borderColor: '#E5E1D8', background: '#FAFAF9', color: '#1A1A1A' }} readOnly />
                  <button className="btn-honey w-full">Save Record</button>
                </div>
              </div>

              {/* Recent activity */}
              <div className="card p-5 fade-up fade-up-4">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#1A1A1A' }}>Today's Activity</h3>
                <div className="space-y-3">
                  {activity.map((a, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#F8F7F4' }}>
                        {activityIcons[a.type]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#1A1A1A' }}>{a.action}</p>
                        <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{a.detail}</p>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: '#C4BFB6' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
