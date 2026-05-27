'use client'
import { useState, useEffect } from 'react'
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
      <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const displayError = localError || error

  return (
    <div style={{ minHeight:'100vh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>

      <div style={{ padding:'20px 24px',display:'flex',alignItems:'center',gap:8 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C10.5 5.5 7 7 4 7c0 6 3.5 11 8 13 4.5-2 8-7 8-13-3 0-6.5-1.5-8-5z" fill="#C8832A"/>
        </svg>
        <span style={{ fontWeight:700,fontSize:16,letterSpacing:'-0.01em' }}>Honeybee</span>
      </div>

      <div style={{ flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'0 24px 60px',maxWidth:440,margin:'0 auto',width:'100%' }}>

        {screen === 'role-select' && (
          <div className="fade-up">
            <h1 style={{ fontSize:36,fontWeight:800,letterSpacing:'-0.035em',marginBottom:8 }}>Welcome back.</h1>
            <p style={{ fontSize:16,color:'var(--text-secondary)',marginBottom:40,lineHeight:1.5 }}>
              How are you signing in today?
            </p>
            <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:32 }}>
              {[
                { role:'pet_owner' as UserRole, title:'Pet Owner', sub:'View records, chip info & health summary' },
                { role:'clinic_admin' as UserRole, title:'Veterinary Clinic', sub:'Manage patients, records & chip registration' },
              ].map(({ role, title, sub }) => (
                <button
                  key={role}
                  onClick={() => { setSelectedRole(role); setScreen('login'); clearError(); setLocalError('') }}
                  style={{ width:'100%',padding:'20px 22px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',cursor:'pointer',textAlign:'left',transition:'border-color 0.15s, box-shadow 0.15s',display:'flex',alignItems:'center',justifyContent:'space-between' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-strong)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' }}
                >
                  <div>
                    <div style={{ fontSize:16,fontWeight:600,marginBottom:3,letterSpacing:'-0.01em' }}>{title}</div>
                    <div style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.4 }}>{sub}</div>
                  </div>
                  <span style={{ fontSize:20,color:'var(--border-strong)',marginLeft:16,flexShrink:0 }}>›</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize:13,color:'var(--text-tertiary)',textAlign:'center' }}>
              New to Honeybee?{' '}
              <button onClick={() => setScreen('signup')} style={{ background:'none',border:'none',color:'var(--honey)',fontWeight:600,cursor:'pointer',fontSize:13,fontFamily:'inherit' }}>
                Create an account
              </button>
            </p>
          </div>
        )}

        {(screen === 'login' || screen === 'signup') && (
          <form onSubmit={handleSubmit} className="fade-up">
            <button
              type="button"
              onClick={() => { setScreen('role-select'); setLocalError(''); clearError() }}
              style={{ background:'none',border:'none',color:'var(--text-tertiary)',cursor:'pointer',fontSize:14,fontFamily:'inherit',marginBottom:32,padding:0,display:'flex',alignItems:'center',gap:4 }}
            >
              ← Back
            </button>

            <h1 style={{ fontSize:32,fontWeight:800,letterSpacing:'-0.03em',marginBottom:6 }}>
              {screen === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p style={{ fontSize:15,color:'var(--text-secondary)',marginBottom:40 }}>
              {screen === 'login'
                ? `Continuing as ${selectedRole === 'pet_owner' ? 'Pet Owner' : 'Vet Clinic'}`
                : `Signing up as ${selectedRole === 'pet_owner' ? 'Pet Owner' : 'Vet Clinic'}`}
            </p>

            <div style={{ display:'flex',flexDirection:'column',gap:28,marginBottom:32 }}>
              {screen === 'signup' && (
                <div>
                  <label style={{ fontSize:12,fontWeight:700,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:8 }}>Full Name</label>
                  <input className="hb-input" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ian Schwarz" autoComplete="name" />
                </div>
              )}
              <div>
                <label style={{ fontSize:12,fontWeight:700,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:8 }}>Email</label>
                <input className="hb-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={selectedRole === 'pet_owner' ? 'owner@honeybee.com' : 'clinic@honeybee.com'} autoComplete="email" />
              </div>
              <div>
                <label style={{ fontSize:12,fontWeight:700,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:8 }}>Password</label>
                <input className="hb-input" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={screen === 'login' ? 'current-password' : 'new-password'} />
              </div>
            </div>

            {displayError && (
              <div style={{ marginBottom:20,padding:'12px 16px',background:'var(--red-light)',borderRadius:'var(--radius-sm)',fontSize:14,color:'var(--red)',fontWeight:500 }}>
                {displayError}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary" style={{ width:'100%',opacity:submitting?0.6:1,cursor:submitting?'not-allowed':'pointer' }}>
              {submitting ? 'Please wait…' : screen === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {screen === 'login' && (
              <div style={{ marginTop:16,textAlign:'center' }}>
                <button type="button" onClick={() => { setScreen('signup'); setLocalError(''); clearError() }} style={{ background:'none',border:'none',color:'var(--text-tertiary)',fontSize:13,cursor:'pointer',fontFamily:'inherit' }}>
                  Don't have an account? <span style={{ color:'var(--honey)',fontWeight:600 }}>Sign up</span>
                </button>
              </div>
            )}

            {screen === 'login' && (
              <p style={{ textAlign:'center',fontSize:12,color:'var(--text-tertiary)',marginTop:24 }}>
                Demo — {selectedRole === 'pet_owner' ? 'owner@honeybee.com' : 'clinic@honeybee.com'} / Honeybee2026!
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
