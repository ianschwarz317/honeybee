'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function petEmoji(species: string) {
  if (species === 'cat') return '🐈'
  if (species === 'dog') return '🐕'
  return '🐾'
}

const TYPE_LABEL: Record<string, string> = { vaccination:'Vaccine', exam:'Exam', prescription:'Rx', lab:'Lab' }

interface Props {
  patient: any | null
  orgId: string | null
  user: any
  onClose: () => void
  onRecordAdded?: (petId: string) => void
}

export function PatientPanel({ patient, orgId, user, onClose, onRecordAdded }: Props) {
  const [records, setRecords]         = useState<any[]>([])
  const [chip, setChip]               = useState<any | null>(null)
  const [loading, setLoading]         = useState(false)
  const [addingRecord, setAddingRecord] = useState(false)
  const [newRecord, setNewRecord]     = useState({ type:'exam', description:'', notes:'' })
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    if (!patient) return
    setAddingRecord(false)
    setNewRecord({ type:'exam', description:'', notes:'' })
    setLoading(true)
    Promise.all([
      supabase.from('medical_records').select('*').eq('pet_id', patient.pet_id).order('record_date', { ascending:false }),
      supabase.from('chips').select('*').eq('pet_id', patient.pet_id).limit(1),
    ]).then(([rRes, cRes]) => {
      setRecords(rRes.data ?? [])
      setChip(cRes.data?.[0] ?? null)
    }).finally(() => setLoading(false))
  }, [patient?.pet_id])

  async function saveRecord() {
    if (!patient || !orgId || !newRecord.description.trim()) return
    setSaving(true)
    try {
      await supabase.from('medical_records').insert({
        pet_id: patient.pet_id,
        organization_id: orgId,
        record_type: newRecord.type,
        description: newRecord.description.trim(),
        notes: newRecord.notes.trim() || null,
        record_date: new Date().toISOString().split('T')[0],
        metadata: { author: user?.full_name || 'Clinic Staff' },
      })
      const { data } = await supabase.from('medical_records').select('*').eq('pet_id', patient.pet_id).order('record_date', { ascending:false })
      setRecords(data ?? [])
      setNewRecord({ type:'exam', description:'', notes:'' })
      setAddingRecord(false)
      onRecordAdded?.(patient.pet_id)
    } finally { setSaving(false) }
  }

  if (!patient) return null

  const chipFormatted = chip?.chip_number?.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:200, display:'flex', justifyContent:'flex-end' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:420, background:'#FFFFFF', height:'100vh', overflowY:'auto', boxShadow:'-4px 0 24px rgba(0,0,0,0.1)', display:'flex', flexDirection:'column', animation:'slideInRight 150ms ease-out' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #EBEBEB', display:'flex', alignItems:'center', gap:14, position:'sticky', top:0, background:'#FFFFFF', zIndex:1 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {petEmoji(patient.species)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:17, fontWeight:600, color:'#0A0A0A', letterSpacing:'-0.01em' }}>{patient.pet_name}</div>
            <div style={{ fontSize:13, color:'#6B7280', marginTop:1 }}>
              {patient.breed || patient.species}{patient.owner_name ? ` · ${patient.owner_name}` : ''}
            </div>
          </div>
          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:'50%', border:'none', background:'#F4F4F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s ease-out' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EBEBEB' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F4F4F5' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" /></div>
        ) : (
          <div style={{ padding:'20px 24px', flex:1 }}>

            {/* Chip card */}
            {chip && (
              <div style={{ background:'#0A0A0A', borderRadius:12, padding:'16px 20px', marginBottom:24, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'16px 16px' }} />
                <div style={{ position:'relative' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Microchip</span>
                    <span style={{ fontSize:11, color:'white', background: chip.is_lost ? '#DC2626' : '#E8820C', borderRadius:999, padding:'2px 8px', fontWeight:600 }}>
                      {chip.is_lost ? 'Lost' : chip.status === 'registered' ? 'Registered' : chip.status ?? '—'}
                    </span>
                  </div>
                  <div style={{ fontFamily:"'SF Mono','Fira Code',monospace", fontSize:13, color:'rgba(255,255,255,0.85)', letterSpacing:'0.12em' }}>
                    {chipFormatted || '—'}
                  </div>
                  {chip.nfc_uid && (
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:4, fontFamily:"'SF Mono','Fira Code',monospace", letterSpacing:'0.06em' }}>NFC {chip.nfc_uid}</div>
                  )}
                </div>
              </div>
            )}

            {/* Records */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <span style={{ fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em' }}>Medical Records</span>
              {!addingRecord && (
                <button onClick={() => setAddingRecord(true)}
                  style={{ fontSize:13, fontWeight:500, color:'#E8820C', background:'none', border:'none', cursor:'pointer', padding:0, fontFamily:'inherit', transition:'color 0.15s ease-out' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4750B' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#E8820C' }}>
                  + Add Record
                </button>
              )}
            </div>

            {/* Add record form */}
            {addingRecord && (
              <div style={{ background:'#FAFAFA', borderRadius:12, border:'1px solid #EBEBEB', padding:'16px', marginBottom:16 }}>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:'#6B7280', display:'block', marginBottom:6 }}>Type</label>
                  <select value={newRecord.type} onChange={e => setNewRecord(r => ({ ...r, type:e.target.value }))}
                    style={{ width:'100%', height:36, border:'1px solid #D1D5DB', borderRadius:8, padding:'0 10px', fontSize:13, fontFamily:'inherit', background:'#FFFFFF', color:'#0A0A0A', outline:'none' }}>
                    <option value="exam">Exam</option>
                    <option value="vaccination">Vaccination</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:'#6B7280', display:'block', marginBottom:6 }}>Description</label>
                  <input className="hb-input" type="text" value={newRecord.description}
                    onChange={e => setNewRecord(r => ({ ...r, description:e.target.value }))}
                    placeholder="e.g. Annual wellness exam" autoFocus />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:500, color:'#6B7280', display:'block', marginBottom:6 }}>Notes <span style={{ fontWeight:400, color:'#9CA3AF' }}>(optional)</span></label>
                  <textarea value={newRecord.notes} onChange={e => setNewRecord(r => ({ ...r, notes:e.target.value }))}
                    placeholder="Clinical notes..."
                    style={{ width:'100%', minHeight:72, border:'1px solid #D1D5DB', borderRadius:8, padding:'8px 10px', fontSize:13, fontFamily:'inherit', color:'#0A0A0A', resize:'vertical', outline:'none', lineHeight:1.5, background:'#FFFFFF' }}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0A0A0A' }}
                    onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB' }} />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={saveRecord} disabled={saving || !newRecord.description.trim()} className="btn-primary" style={{ flex:1 }}>
                    {saving ? 'Saving…' : 'Save Record'}
                  </button>
                  <button onClick={() => { setAddingRecord(false); setNewRecord({ type:'exam', description:'', notes:'' }) }} className="btn-secondary" style={{ flex:1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Records list */}
            {records.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>🐾</div>
                <p style={{ fontSize:14, color:'#9CA3AF' }}>No records yet</p>
              </div>
            ) : records.map((r: any, i: number) => (
              <div key={r.id} style={{ paddingBottom: i < records.length-1 ? 14 : 0, marginBottom: i < records.length-1 ? 14 : 0, borderBottom: i < records.length-1 ? '1px solid #EBEBEB' : 'none' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <span style={{ fontSize:11, fontWeight:600, background:'#F4F4F5', color:'#6B7280', borderRadius:999, padding:'3px 8px', flexShrink:0, marginTop:1, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
                    {TYPE_LABEL[r.record_type] ?? r.record_type}
                  </span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'#0A0A0A' }}>{r.description}</div>
                    {r.notes && <div style={{ fontSize:12, color:'#6B7280', marginTop:3, lineHeight:1.5 }}>{r.notes}</div>}
                    <div style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>{fmtDate(r.record_date)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes slideInRight { from { transform:translateX(100%); } to { transform:translateX(0); } }`}</style>
    </div>
  )
}
