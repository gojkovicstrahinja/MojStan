import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { AuthService } from '../lib/auth'
import type { User, LoginFormData, RegisterFormData } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (data: LoginFormData) => Promise<{ error: Error | null }>
  signUp: (data: RegisterFormData) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data } = await AuthService.getCurrentUser()
      setUser(data)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data } = await AuthService.getCurrentUser()
          setUser(data)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (data: LoginFormData) => {
    setLoading(true)
    const { error } = await AuthService.signIn(data)
    setLoading(false)
    return { error }
  }

  const signUp = async (data: RegisterFormData) => {
    setLoading(true)
    const { error } = await AuthService.signUp(data)
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await AuthService.signOut()
    setUser(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') }
    
    setLoading(true)
    const { data, error } = await AuthService.updateProfile(user.id, updates)
    if (data) setUser(data)
    setLoading(false)
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}