import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFF8EC 0%, #F8F7F4 60%, #F0FDF4 100%)' }}>
      {/* Logo */}
      <div className="mb-12 text-center fade-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#F5A623' }}>
            🐝
          </div>
          <span className="font-display text-3xl font-bold" style={{ color: '#1A1A1A' }}>honeybee</span>
        </div>
        <p className="text-sm" style={{ color: '#6B6B6B' }}>Smart microchip platform for pets, owners & vets</p>
      </div>

      {/* Portal cards */}
      <div className="flex gap-6 fade-up fade-up-2">
        {/* Pet owner */}
        <Link href="/owner" className="group block w-72 card p-8 text-center hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 transition-transform group-hover:scale-110" style={{ background: '#FFF8EC', border: '1.5px solid #FFD98A' }}>
            🐾
          </div>
          <h2 className="font-display text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>Pet Owner</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
            View your pet's profile, medical records, chip status, and digital ID pass.
          </p>
          <div className="mt-6 btn-honey w-full text-center block">
            Open portal →
          </div>
        </Link>

        {/* Vet clinic */}
        <Link href="/clinic" className="group block w-72 card p-8 text-center hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 transition-transform group-hover:scale-110" style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
            🏥
          </div>
          <h2 className="font-display text-xl font-semibold mb-2" style={{ color: '#1A1A1A' }}>Vet Clinic</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B6B6B' }}>
            Manage patients, register chips, add medical records, and generate AI summaries.
          </p>
          <div className="mt-6 w-full text-center block py-2.5 px-5 rounded-xl font-semibold text-sm transition-all" style={{ background: '#1A1A1A', color: 'white' }}>
            Open dashboard →
          </div>
        </Link>
      </div>

      <p className="mt-10 text-xs fade-up fade-up-3" style={{ color: '#9CA3AF' }}>
        Demo environment · seehoneybee.com
      </p>
    </main>
  )
}
