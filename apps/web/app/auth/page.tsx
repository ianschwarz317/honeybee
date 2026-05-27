'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole, dashboardPath, isClinic } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type Screen = 'role-select' | 'login' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const { user, loading, error, signIn, signUp, clearError } = useAuth()

  const [screen, setScreen] = useState<Screen>('role-select')
  const [selectedRole, setSelectedRole] = useState<UserRole>('pet_owner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace(dashboardPath(user))
  }, [user, loading, router])

  function pickRole(role: UserRole, mode: Screen) {
    setSelectedRole(role)
    setScreen(mode)
    clearError()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (screen === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()
          const role = profile?.role
          const dest = (role === 'clinic_admin' || role === 'clinic_staff') ? '/clinic' : '/owner'
          router.replace(dest)
        }
      } else {
        await signUp(email, password, selectedRole, fullName)
        const dest = selectedRole === 'clinic_admin' ? '/clinic' : '/owner'
        router.replace(dest)
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border-strong)', borderTop: '2px solid var(--blue)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    )
  }

  const roleLabel = selectedRole === 'pet_owner' ? 'Pet Owner' : 'Vet Clinic'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo.svg" alt="Honeybee" width={48} height={48} style={{ borderRadius: 12, marginBottom: 10 }} />
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>Honeybee</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Smart Pet Microchip Platform</p>
        </div>

        {screen === 'role-select' && (
          <div className="fade-up">
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 16 }}>Sign in as</p>
            {[
              { role: 'pet_owner' as UserRole, emoji: '🐾', label: 'Pet Owner', sub: 'View your pet\'s records & chip' },
              { role: 'clinic_admin' as UserRole, emoji: '🏥', label: 'Veterinary Clinic', sub: 'Manage patients & records' },
            ].map(({ role, emoji, label, sub }) => (
              <button
                key={role}
                onClick={() => pickRole(role, 'login')}
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px', marginBottom: 10, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', transition: 'box-shadow 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{sub}</div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--text-tertiary)' }}>→</div>
              </button>
            ))}
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 20 }}>
              New here?{' '}
              <button onClick={() => setScreen('signup')} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}>
                Create account
              </button>
            </p>
          </div>
        )}

        {(screen === 'login' || screen === 'signup') && (
          <form onSubmit={handleSubmit} className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => { setScreen('role-select'); clearError() }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 500 }}
              >
                ← Back
              </button>
              <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 8, padding: 3 }}>
                {(['login', 'signup'] as Screen[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setScreen(m); clearError() }}
                    style={{ background: screen === m ? 'var(--surface)' : 'transparent', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 500, color: screen === m ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: screen === m ? 'var(--shadow-sm)' : 'none' }}
                  >
                    {m === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {screen === 'login' ? 'Signing in as' : 'Creating account as'}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, background: 'var(--blue-light)', color: '#0051A2', borderRadius: 100, padding: '2px 10px' }}>
                {roleLabel}
              </span>
            </div>

            {screen === 'signup' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ian Schwarz"
                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', background: 'var(--surface)', transition: 'border-color 0.15s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={selectedRole === 'pet_owner' ? 'owner@honeybee.com' : 'clinic@honeybee.com'}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', background: 'var(--surface)', transition: 'border-color 0.15s' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 15, fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', background: 'var(--surface)', transition: 'border-color 0.15s' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--blue)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#C62828', margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 600, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Please wait…' : screen === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {screen === 'login' && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 14 }}>
                Demo: {selectedRole === 'pet_owner' ? 'owner@honeybee.com' : 'clinic@honeybee.com'} / Honeybee2026!
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  )
}
