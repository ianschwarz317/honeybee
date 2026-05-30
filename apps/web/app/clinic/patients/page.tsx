'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ClinicSidebar } from '../_components/sidebar'
import { PatientPanel } from '../_components/patient-panel'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function petEmoji(s: string) {
  if (s === 'cat') return '🐈'
  if (s === 'dog') return '🐕'
  return '🐾'
}

type Species = 'all' | 'dog' | 'cat' | 'other'

export default function PatientsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orgId, setOrgId]     = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [species, setSpecies]   = useState<Species>('all')
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
    if (!authLoading && user && user.role === 'pet_owner') router.replace('/owner')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) return
        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).limit(1)
        const oid = profile?.[0]?.organization_id
        if (!oid) return
        setOrgId(oid)
        const [orgRes, patientsRes] = await Promise.all([
          supabase.from('organizations').select('name').eq('id', oid).limit(1),
          supabase.rpc('get_clinic_patients', { org_id: oid }),
        ])
        setOrgName(orgRes.data?.[0]?.name ?? '')
        setPatients(patientsRes.data ?? [])
      } finally { setLoading(false) }
    }
    load()
  }, [user])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return patients.filter(p => {
      const matchesSpecies = species === 'all' || p.species === species
      const matchesSearch = !q || [p.pet_name, p.owner_name, p.chip_number].some(v => v?.toLowerCase().includes(q))
      return matchesSpecies && matchesSearch
    })
  }, [patients, search, species])

  if (authLoading || loading) return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" />
    </div>
  )

  const cardShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px #EBEBEB'
  const chippedCount = patients.filter(p => p.chip_number).length
  const SPECIES: { id: Species; label: string }[] = [
    { id:'all', label:'All' },
    { id:'dog', label:'🐕 Dogs' },
    { id:'cat', label:'🐈 Cats' },
    { id:'other', label:'🐾 Other' },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      <ClinicSidebar user={user} orgName={orgName} />

      <main style={{ flex:1, padding:'40px 48px', overflow:'auto', minWidth:0 }}>
        <div className="fade-up">

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom:4 }}>Patients</h1>
              <p style={{ fontSize:14, color:'#6B7280' }}>{patients.length} total · {chippedCount} chipped</p>
            </div>
            <Link href="/clinic/register" className="btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', height:'auto', fontSize:13, textDecoration:'none' }}>
              + Register Chip
            </Link>
          </div>

          {/* Search + filter bar */}
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:24 }}>
            <div style={{ position:'relative', flex:1, maxWidth:360 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, owner, or chip #"
                style={{ width:'100%', height:40, border:'1px solid #D1D5DB', borderRadius:10, paddingLeft:36, paddingRight:12, fontSize:14, fontFamily:'inherit', color:'#0A0A0A', outline:'none', background:'#FFFFFF', transition:'border-color 0.15s ease-out' }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0A0A0A' }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }}
              />
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {SPECIES.map(({ id, label }) => (
                <button key={id} onClick={() => setSpecies(id)}
                  style={{ height:40, padding:'0 14px', border: species === id ? '1.5px solid #E8820C' : '1px solid #D1D5DB', borderRadius:10, fontSize:13, fontWeight: species === id ? 500 : 400, color: species === id ? '#E8820C' : '#6B7280', background: species === id ? '#FEF3E2' : '#FFFFFF', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s ease-out', whiteSpace:'nowrap' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.5fr 1fr 0.7fr', padding:'10px 24px', borderBottom:'1px solid #EBEBEB', background:'#FAFAFA' }}>
              {['Patient', 'Owner', 'Chip #', 'Last Visit', 'Records'].map(h => (
                <div key={h} style={{ fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em' }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:'56px 24px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🐾</div>
                <p style={{ color:'#6B7280', fontSize:15 }}>{search || species !== 'all' ? 'No patients match your filters' : 'No patients registered yet'}</p>
                {!search && species === 'all' && (
                  <Link href="/clinic/register" style={{ display:'inline-block', marginTop:12, fontSize:14, color:'#E8820C', textDecoration:'none', fontWeight:500 }}>Register your first chip →</Link>
                )}
              </div>
            ) : filtered.map((p: any, i: number) => (
              <div key={p.pet_id}
                onClick={() => setSelectedPatient(p)}
                style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1.5fr 1fr 0.7fr', padding:'14px 24px', alignItems:'center', borderBottom: i < filtered.length-1 ? '1px solid #EBEBEB' : 'none', cursor:'pointer', background: i % 2 === 1 ? '#FAFAFA' : '#FFFFFF', transition:'background 0.15s ease-out' }}
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

          {filtered.length > 0 && filtered.length < patients.length && (
            <p style={{ fontSize:13, color:'#9CA3AF', marginTop:12, textAlign:'center' }}>
              Showing {filtered.length} of {patients.length} patients
            </p>
          )}
        </div>
      </main>

      <PatientPanel
        patient={selectedPatient}
        orgId={orgId}
        user={user}
        onClose={() => setSelectedPatient(null)}
        onRecordAdded={petId => setPatients(prev => prev.map(p => p.pet_id === petId ? { ...p, record_count: Number(p.record_count ?? 0) + 1 } : p))}
      />
    </div>
  )
}
