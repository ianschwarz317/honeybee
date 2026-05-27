'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type UserRole = 'pet_owner' | 'clinic_admin' | 'clinic_staff' | 'super_admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  organization_id: string | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, organization_id')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return {
    id: data.id,
    email: data.email,
    role: data.role as UserRole,
    full_name: data.full_name || '',
    organization_id: data.organization_id || null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      const msg = authError.message === 'Invalid login credentials'
        ? 'Incorrect email or password'
        : authError.message
      setError(msg)
      throw new Error(msg)
    }
  }

  const signUp = async (email: string, password: string, role: UserRole, fullName: string) => {
    setError(null)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
      },
    })
    if (authError) {
      setError(authError.message)
      throw new Error(authError.message)
    }
  }

  const signOut = async () => {
    setError(null)
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function isClinic(user: AuthUser | null) {
  return user?.role === 'clinic_admin' || user?.role === 'clinic_staff'
}

export function dashboardPath(user: AuthUser | null) {
  return isClinic(user) ? '/clinic' : '/owner'
}
