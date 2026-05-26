import Link from 'next/link'
import { mockPet, mockMedicalRecords, mockAiSummary, mockScanLogs } from '@/lib/mock-data'

const recordTypeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  vaccination: { label: 'Vaccine',      color: '#166534', bg: '#F0FDF4', icon: '💉' },
  exam:        { label: 'Exam',         color: '#1E40AF', bg: '#EFF6FF', icon: '🩺' },
  prescription:{ label: 'Prescription', color: '#7C3AED', bg: '#F5F3FF', icon: '💊' },
  lab:         { label: 'Lab',          color: '#92400E', bg: '#FFFBEB', icon: '🧪' },
  surgery:     { label: 'Surgery',      color: '#991B1B', bg: '#FEF2F2', icon: '⚕️' },
  note:        { label: 'Note',         color: '#374151', bg: '#F9FAFB', icon: '📝' },
}

function petAge(dob: string): string {
  const birth = new Date(dob)
  const years = new Date().getFullYear() - birth.getFullYear()
  return `${years} yrs`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function OwnerPortal() {
  const pet = mockPet
  const records = mockMedicalRecords
  const scans = mockScanLogs

  return (
    <div className="min-h-screen" style={{ background: '#F8F7F4' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: '#EDEBE6' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: '#F5A623' }}>🐝</div>
            <span className="font-display font-bold text-lg" style={{ color: '#1A1A1A' }}>honeybee</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#6B6B6B' }}>Ian & Angela Schwarz</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: '#F5A623' }}>IS</div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-6 fade-up">
          <h1 className="font-display text-3xl font-bold" style={{ color: '#1A1A1A' }}>My Pets</h1>
          <p className="text-sm mt-1" style={{ color: '#6B6B6B' }}>Manage profiles, records, and chip registrations</p>
        </div>

        {/* Top row: Pet card + Chip card + Quick stats */}
        <div className="grid grid-cols-3 gap-5 mb-5">

          {/* Pet profile */}
          <div className="card p-5 fade-up fade-up-1">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #FFF8EC, #FFD98A)' }}>
                🐕
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-bold" style={{ color: '#1A1A1A' }}>{pet.name}</h2>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>{pet.breed}</p>
                <div className="mt-2">
                  <span className="chip-badge">✓ Chip registered</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid #F0EDE7' }}>
              {[
                { label: 'Age',     value: petAge(pet.date_of_birth) },
                { label: 'Weight',  value: `${pet.weight_kg} kg` },
                { label: 'Sex',     value: 'Male' },
                { label: 'Color',   value: pet.color },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs mb-0.5" style={{ color: '#9CA3AF' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>Veterinary clinic</p>
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{pet.vet_clinic}</p>
            </div>
          </div>

          {/* Chip card */}
          <div className="card p-5 fade-up fade-up-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: '#6B6B6B' }}>MICROCHIP</h3>
              <span className="chip-badge">● Active</span>
            </div>

            {/* Chip visual */}
            <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #1A1A1A, #374151)', position: 'relative', overflow: 'hidden' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #F5A623 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded text-xs flex items-center justify-center font-bold" style={{ background: '#F5A623', color: '#1A1A1A' }}>🐝</div>
                  <span className="text-xs font-semibold text-white opacity-80">honeybee</span>
                </div>
                <p className="text-white font-mono text-sm tracking-widest mb-2">{pet.chip_number.replace(/(.{3})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4')}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60 text-white">NFC + 134.2 kHz</span>
                  <span className="text-xs text-white opacity-40">·</span>
                  <span className="text-xs opacity-60 text-white">ISO 11784/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>NFC UID</span>
                <span className="text-xs font-mono font-medium" style={{ color: '#1A1A1A' }}>{pet.nfc_uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Registered</span>
                <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{pet.vet_clinic}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Emergency contact</span>
                <span className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{pet.emergency_phone}</span>
              </div>
            </div>
          </div>

          {/* Right column: Wallet pass + Scan log */}
          <div className="flex flex-col gap-4">
            {/* Wallet pass */}
            <div className="card p-5 fade-up fade-up-3">
              <h3 className="font-semibold text-sm mb-3" style={{ color: '#6B6B6B' }}>DIGITAL ID PASS</h3>
              <div className="rounded-xl p-4 flex items-center gap-3 mb-3 cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#000', color: 'white' }}>
                <div className="text-2xl">🍎</div>
                <div>
                  <p className="text-xs opacity-60 mb-0.5">Add to</p>
                  <p className="font-semibold text-sm">Apple Wallet</p>
                </div>
                <div className="ml-auto text-xl">›</div>
              </div>
              <div className="rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" style={{ background: '#1A73E8', color: 'white' }}>
                <div className="text-2xl">G</div>
                <div>
                  <p className="text-xs opacity-60 mb-0.5">Add to</p>
                  <p className="font-semibold text-sm">Google Wallet</p>
                </div>
                <div className="ml-auto text-xl">›</div>
              </div>
            </div>

            {/* Recent scans */}
            <div className="card p-5 flex-1 fade-up fade-up-4">
              <h3 className="font-semibold text-sm mb-3" style={{ color: '#6B6B6B' }}>RECENT SCANS</h3>
              <div className="space-y-2.5">
                {scans.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: i === 0 ? '#F5A623' : '#D1D5DB' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{s.location}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{formatDateTime(s.scanned_at)}</p>
                    </div>
                    {s.notified && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: '#FEF3C7', color: '#92400E' }}>Alert sent</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="card p-5 mb-5 fade-up fade-up-3" style={{ borderLeft: '3px solid #F5A623' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: '#FFF8EC', border: '1px solid #FFD98A' }}>✨</div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>AI Health Summary</h3>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Generated from {records.length} records · May 2026</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#374151' }}>
            {mockAiSummary}
          </p>
        </div>

        {/* Medical records */}
        <div className="fade-up fade-up-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold" style={{ color: '#1A1A1A' }}>Medical Records</h2>
            <span className="text-sm" style={{ color: '#9CA3AF' }}>{records.length} records</span>
          </div>

          <div className="space-y-3">
            {records.map((rec) => {
              const cfg = recordTypeConfig[rec.record_type] ?? recordTypeConfig["note"]!
              return (
                <div key={rec.id} className="card p-5 hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cfg.bg }}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{formatDate(rec.record_date)}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: '#1A1A1A' }}>{rec.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>{rec.content}</p>
                      <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>{rec.created_by} · {rec.clinic}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
