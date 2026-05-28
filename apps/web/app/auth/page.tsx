'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole, dashboardPath } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type Screen = 'role-select' | 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const { user, loading, error, signUp, clearError } = useAuth()
  const [screen, setScreen] = useState<Screen>('role-select')
  const [selectedRole, setSelectedRole] = useState<UserRole>('pet_owner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!loading && user) router.replace(dashboardPath(user))
  }, [user, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setLocalError('')
    try {
      if (screen === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) { setLocalError('Incorrect email or password'); return }
        if (data.user) {
          const { data: rows } = await supabase.from('profiles').select('role').eq('id', data.user.id).limit(1)
          const role = rows?.[0]?.role
          router.replace((role === 'clinic_admin' || role === 'clinic_staff') ? '/clinic' : '/owner')
        }
      } else {
        await signUp(email, password, selectedRole, fullName)
        router.replace(selectedRole === 'clinic_admin' ? '/clinic' : '/owner')
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const displayError = localError || error

  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', flexDirection:'column' }}>

      {/* Logo */}
      <div style={{ padding:'24px 32px', flexShrink:0 }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:20, lineHeight:1 }}>🐝</span>
          <span style={{ fontWeight:700, fontSize:15, color:'#E8820C', letterSpacing:'-0.02em' }}>honeybee</span>
        </Link>
      </div>

      {/* Centered card */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 24px 80px' }}>
        <div style={{ width:'100%', maxWidth:440 }}>
          <div className="fade-up" style={{ background:'#FFFFFF', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px #EBEBEB', padding:'40px' }}>

            {screen === 'role-select' && (
              <div>
                <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:'-0.02em', marginBottom:6, color:'#0A0A0A' }}>Welcome back.</h1>
                <p style={{ fontSize:14, color:'#6B7280', marginBottom:32, lineHeight:1.6 }}>
                  How are you signing in today?
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {[
                    { role:'pet_owner' as UserRole, title:'Pet Owner', sub:'View records, chip info & health summary', emoji:'🐾' },
                    { role:'clinic_admin' as UserRole, title:'Veterinary Clinic', sub:'Manage patients, records & chip registration', emoji:'🏥' },
                  ].map(({ role, title, sub, emoji }) => (
                    <button
                      key={role}
                      onClick={() => { setSelectedRole(role); setScreen('login'); clearError(); setLocalError('') }}
                      style={{ width:'100%', padding:'18px 20px', background:'#FFFFFF', border:'1px solid #EBEBEB', borderRadius:12, cursor:'pointer', textAlign:'left', transition:'border-color 0.15s ease-out, box-shadow 0.15s ease-out', display:'flex', alignItems:'center', gap:16 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8820C'; e.currentTarget.style.boxShadow = '0 0 0 3px #FEF3E2' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#EBEBEB'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <div style={{ width:40, height:40, borderRadius:'50%', background:'#FEF3E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                        {emoji}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600, marginBottom:2, color:'#0A0A0A' }}>{title}</div>
                        <div style={{ fontSize:13, color:'#6B7280', lineHeight:1.4 }}>{sub}</div>
                      </div>
                      <span style={{ fontSize:18, color:'#D1D5DB', flexShrink:0 }}>›</span>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize:13, color:'#6B7280', textAlign:'center' }}>
                  New to Honeybee?{' '}
                  <button onClick={() => setScreen('signup')} style={{ background:'none', border:'none', color:'#E8820C', fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
                    Create an account
                  </button>
                </p>
              </div>
            )}

            {(screen === 'login' || screen === 'signup') && (
              <form onSubmit={handleSubmit}>
                <button
                  type="button"
                  onClick={() => { setScreen('role-select'); setLocalError(''); clearError() }}
                  style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:13, fontFamily:'inherit', marginBottom:28, padding:0, display:'flex', alignItems:'center', gap:6 }}
                >
                  ← Back
                </button>

                <h1 style={{ fontSize:22, fontWeight:600, letterSpacing:'-0.02em', marginBottom:4, color:'#0A0A0A' }}>
                  {screen === 'login' ? 'Sign in' : 'Create account'}
                </h1>
                <p style={{ fontSize:14, color:'#6B7280', marginBottom:28, lineHeight:1.5 }}>
                  {screen === 'login'
                    ? `Continuing as ${selectedRole === 'pet_owner' ? 'Pet Owner' : 'Vet Clinic'}`
                    : `Signing up as ${selectedRole === 'pet_owner' ? 'Pet Owner' : 'Vet Clinic'}`}
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:24 }}>
                  {screen === 'signup' && (
                    <div>
                      <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:6 }}>Full name</label>
                      <input className="hb-input" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ian Schwarz" autoComplete="name" />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:6 }}>Email</label>
                    <input className="hb-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={selectedRole === 'pet_owner' ? 'owner@honeybee.com' : 'clinic@honeybee.com'} autoComplete="email" />
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:500, color:'#0A0A0A', display:'block', marginBottom:6 }}>Password</label>
                    <input className="hb-input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={screen === 'login' ? 'current-password' : 'new-password'} />
                  </div>
                </div>

                {displayError && (
                  <div style={{ marginBottom:16, fontSize:13, color:'#DC2626', background:'#FEF2F2', borderRadius:8, padding:'10px 12px' }}>
                    {displayError}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary" style={{ width:'100%' }}>
                  {submitting ? 'Please wait…' : screen === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {screen === 'login' && (
                  <div style={{ marginTop:16, textAlign:'center' }}>
                    <button type="button" onClick={() => { setScreen('signup'); setLocalError(''); clearError() }} style={{ background:'none', border:'none', color:'#6B7280', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                      Don&apos;t have an account? <span style={{ color:'#E8820C', fontWeight:600 }}>Sign up</span>
                    </button>
                  </div>
                )}

                {screen === 'login' && (
                  <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:20 }}>
                    Demo — {selectedRole === 'pet_owner' ? 'owner@honeybee.com' : 'clinic@honeybee.com'} / Honeybee2026!
                  </p>
                )}
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
