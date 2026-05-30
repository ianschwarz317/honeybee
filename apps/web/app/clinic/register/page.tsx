'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { ClinicSidebar } from '../_components/sidebar'

function formatChip(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 15)
  return [d.slice(0,3), d.slice(3,7), d.slice(7,11), d.slice(11,15)].filter(Boolean).join(' ')
}

export default function RegisterChip() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orgId, setOrgId]   = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')
  const [step, setStep]     = useState<1|2|3|4>(1)
  const [error, setError]   = useState('')
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)

  // Chip
  const [chipNumber, setChipNumber] = useState('')
  const [nfcUid, setNfcUid]         = useState('')

  // Pet
  const [petName, setPetName]   = useState('')
  const [species, setSpecies]   = useState('dog')
  const [breed, setBreed]       = useState('')
  const [dob, setDob]           = useState('')
  const [sex, setSex]           = useState('unknown')
  const [color, setColor]       = useState('')
  const [petNotes, setPetNotes] = useState('')

  // Owner
  const [ownerName, setOwnerName]   = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')

  // Success
  const [successChip, setSuccessChip] = useState('')
  const [successPet, setSuccessPet]   = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth')
    if (!authLoading && user && user.role === 'pet_owner') router.replace('/owner')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).limit(1)
      const oid = profile?.[0]?.organization_id
      if (!oid) return
      setOrgId(oid)
      const { data: org } = await supabase.from('organizations').select('name').eq('id', oid).limit(1)
      setOrgName(org?.[0]?.name ?? '')
    }
    load()
  }, [user])

  async function nextFromChip() {
    setError('')
    const clean = chipNumber.replace(/\s/g, '')
    if (!/^\d{15}$/.test(clean)) { setError('Enter a valid 15-digit chip number'); return }
    setChecking(true)
    try {
      const { data } = await supabase.from('chips').select('id').eq('chip_number', clean).limit(1)
      if (data && data.length > 0) { setError('This chip is already registered in Honeybee'); return }
      setStep(2)
    } finally { setChecking(false) }
  }

  async function submit() {
    if (!orgId || !petName.trim() || !ownerName.trim() || !ownerEmail.trim()) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const clean = chipNumber.replace(/\s/g, '')

      const { data: petRows, error: petErr } = await supabase.from('pets').insert({
        name: petName.trim(),
        species,
        breed: breed.trim() || null,
        date_of_birth: dob || null,
        sex,
        color: color.trim() || null,
        notes: petNotes.trim() || null,
      }).select('id')
      if (petErr) throw petErr

      const { error: chipErr } = await supabase.from('chips').insert({
        chip_number: clean,
        nfc_uid: nfcUid.trim() || null,
        pet_id: petRows?.[0]?.id,
        registered_at_org: orgId,
        registered_by: session?.user?.id ?? null,
        status: 'registered',
        registered_at: new Date().toISOString(),
        emergency_contact: {
          name: ownerName.trim(),
          email: ownerEmail.trim(),
          phone: ownerPhone.trim() || undefined,
        },
      })
      if (chipErr) throw chipErr

      setSuccessChip(chipNumber)
      setSuccessPet(petName.trim())
      setStep(4)
    } catch (e: any) {
      setError(e.message || 'Registration failed')
    } finally { setSaving(false) }
  }

  function reset() {
    setStep(1); setError('')
    setChipNumber(''); setNfcUid('')
    setPetName(''); setSpecies('dog'); setBreed(''); setDob(''); setSex('unknown'); setColor(''); setPetNotes('')
    setOwnerName(''); setOwnerEmail(''); setOwnerPhone('')
  }

  if (authLoading) return <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" /></div>

  const cardShadow = '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px #EBEBEB'
  const STEPS = ['Chip', 'Pet Details', 'Owner']

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#FFFFFF' }}>
      <ClinicSidebar user={user} orgName={orgName} />

      <main style={{ flex:1, padding:'40px 48px', overflow:'auto', minWidth:0 }}>
        <div className="fade-up">
          <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.02em', color:'#0A0A0A', marginBottom:4 }}>Register Chip</h1>
          <p style={{ fontSize:14, color:'#6B7280', marginBottom:32 }}>Register a new microchip and link it to a patient record.</p>

          {/* Step indicator */}
          {step !== 4 && (
            <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
              {STEPS.map((label, i) => {
                const n = (i + 1) as 1|2|3
                const done = step > n
                const active = step === n
                return (
                  <div key={label} style={{ display:'flex', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, background: done ? '#E8820C' : active ? '#0A0A0A' : '#F4F4F5', color: (done || active) ? '#FFFFFF' : '#9CA3AF', flexShrink:0 }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize:13, fontWeight: active ? 500 : 400, color: active ? '#0A0A0A' : done ? '#6B7280' : '#9CA3AF' }}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 && <div style={{ width:28, height:1, background:'#EBEBEB', margin:'0 12px' }} />}
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ maxWidth:520 }}>

            {/* ── STEP 1: Chip ── */}
            {step === 1 && (
              <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, padding:'28px 32px' }}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Chip Number <span style={{ color:'#DC2626' }}>*</span></label>
                  <input className="hb-input" type="text" value={chipNumber}
                    onChange={e => setChipNumber(formatChip(e.target.value))}
                    placeholder="XXX XXXX XXXX XXXX"
                    style={{ fontFamily:"'SF Mono','Fira Code',monospace", letterSpacing:'0.08em' }}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && nextFromChip()} />
                  <p style={{ fontSize:12, color:'#9CA3AF', marginTop:6 }}>15-digit ISO 11784/11785 standard</p>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>NFC UID <span style={{ fontSize:12, fontWeight:400, color:'#9CA3AF' }}>(optional)</span></label>
                  <input className="hb-input" type="text" value={nfcUid}
                    onChange={e => setNfcUid(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, ''))}
                    placeholder="A3F84C2D19E0"
                    style={{ fontFamily:"'SF Mono','Fira Code',monospace", letterSpacing:'0.08em' }} />
                </div>
                {error && <p style={{ fontSize:13, color:'#DC2626', marginBottom:16 }}>{error}</p>}
                <button onClick={nextFromChip} disabled={checking} className="btn-primary" style={{ width:'100%' }}>
                  {checking ? 'Checking…' : 'Continue →'}
                </button>
              </div>
            )}

            {/* ── STEP 2: Pet Details ── */}
            {step === 2 && (
              <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, padding:'28px 32px' }}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Pet Name <span style={{ color:'#DC2626' }}>*</span></label>
                  <input className="hb-input" type="text" value={petName} onChange={e => setPetName(e.target.value)} placeholder="e.g. Biscuit" autoFocus />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Species</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {([['dog','🐕 Dog'],['cat','🐈 Cat'],['other','🐾 Other']] as [string,string][]).map(([val, label]) => (
                      <button key={val} onClick={() => setSpecies(val)}
                        style={{ flex:1, height:40, border: species === val ? '1.5px solid #E8820C' : '1px solid #D1D5DB', borderRadius:10, fontSize:13, fontWeight: species === val ? 500 : 400, color: species === val ? '#E8820C' : '#6B7280', background: species === val ? '#FEF3E2' : '#FFFFFF', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s ease-out' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Breed <span style={{ fontWeight:400, color:'#9CA3AF' }}>(opt.)</span></label>
                    <input className="hb-input" type="text" value={breed} onChange={e => setBreed(e.target.value)} placeholder="e.g. Golden Retriever" />
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Date of Birth <span style={{ fontWeight:400, color:'#9CA3AF' }}>(opt.)</span></label>
                    <input className="hb-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Sex</label>
                    <select value={sex} onChange={e => setSex(e.target.value)}
                      style={{ width:'100%', height:44, border:'1px solid #D1D5DB', borderRadius:8, padding:'0 10px', fontSize:14, fontFamily:'inherit', background:'#FFFFFF', color:'#0A0A0A', outline:'none' }}
                      onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0A0A0A' }}
                      onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }}>
                      <option value="unknown">Unknown</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Color <span style={{ fontWeight:400, color:'#9CA3AF' }}>(opt.)</span></label>
                    <input className="hb-input" type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Golden" />
                  </div>
                </div>
                {error && <p style={{ fontSize:13, color:'#DC2626', marginBottom:16 }}>{error}</p>}
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => { setStep(1); setError('') }} className="btn-secondary" style={{ flex:1 }}>← Back</button>
                  <button onClick={() => { if (!petName.trim()) { setError('Pet name is required'); return }; setError(''); setStep(3) }} className="btn-primary" style={{ flex:2 }}>Continue →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Owner ── */}
            {step === 3 && (
              <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, padding:'28px 32px' }}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Owner Name <span style={{ color:'#DC2626' }}>*</span></label>
                  <input className="hb-input" type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Full name" autoFocus />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Email <span style={{ color:'#DC2626' }}>*</span></label>
                  <input className="hb-input" type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@example.com" />
                  <p style={{ fontSize:12, color:'#9CA3AF', marginTop:6 }}>Stored as emergency contact. Owner can sign up with this email to access their records.</p>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:8 }}>Phone <span style={{ fontWeight:400, color:'#9CA3AF' }}>(optional)</span></label>
                  <input className="hb-input" type="tel" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="(555) 000-0000" />
                </div>
                {error && <p style={{ fontSize:13, color:'#DC2626', marginBottom:16 }}>{error}</p>}
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => { setStep(2); setError('') }} className="btn-secondary" style={{ flex:1 }}>← Back</button>
                  <button onClick={submit} disabled={saving} className="btn-primary" style={{ flex:2 }}>
                    {saving ? 'Registering…' : 'Register Chip'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: Success ── */}
            {step === 4 && (
              <div style={{ background:'#FFFFFF', borderRadius:12, boxShadow:cardShadow, padding:'40px 32px', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#F0FDF4', border:'1px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:22, color:'#16A34A' }}>✓</div>
                <h2 style={{ fontSize:20, fontWeight:600, color:'#0A0A0A', marginBottom:8, letterSpacing:'-0.02em' }}>Chip Registered</h2>
                <p style={{ fontSize:14, color:'#6B7280', marginBottom:6 }}>{successPet} has been successfully registered.</p>
                <p style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:13, color:'#9CA3AF', letterSpacing:'0.08em', marginBottom:32 }}>{successChip}</p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={reset} className="btn-secondary" style={{ flex:1 }}>Register Another</button>
                  <button onClick={() => router.push('/clinic')} className="btn-primary" style={{ flex:1 }}>Back to Dashboard</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
