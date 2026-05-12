'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

interface AuthUser {
  id: string
  fullName: string
  email?: string | null
  phone?: string | null
  role: 'user' | 'admin'
  coinsBalance: number
  subscriptionTier: string
  avatarUrl?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>
  loginWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  signup: (fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  loginStep: 'phone' | 'otp' | 'email'
  setLoginStep: (step: 'phone' | 'otp' | 'email') => void
  pendingPhone: string
  setPendingPhone: (phone: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo accounts for development
const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  '9999999999': {
    id: 'admin-user-1',
    fullName: 'Admin User',
    phone: '9999999999',
    email: 'admin@choutuppal.com',
    role: 'admin',
    coinsBalance: 500,
    subscriptionTier: 'premium',
  },
  '8888888888': {
    id: 'demo-user-1',
    fullName: 'Guest User',
    phone: '8888888888',
    email: 'guest@choutuppal.com',
    role: 'user',
    coinsBalance: 50,
    subscriptionTier: 'free',
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginStep, setLoginStep] = useState<'phone' | 'otp' | 'email'>('phone')
  const [pendingPhone, setPendingPhone] = useState('')
  const { setCurrentUser } = useAppStore()

  // Check for existing session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('choutuppal_auth_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as AuthUser
        setUser(parsed)
        setCurrentUser({
          id: parsed.id,
          fullName: parsed.fullName,
          role: parsed.role,
          coinsBalance: parsed.coinsBalance,
          subscriptionTier: parsed.subscriptionTier,
        })
      }
    } catch {
      // No saved session
    } finally {
      setIsLoading(false)
    }
  }, [setCurrentUser])

  const persistUser = useCallback((authUser: AuthUser) => {
    setUser(authUser)
    localStorage.setItem('choutuppal_auth_user', JSON.stringify(authUser))
    setCurrentUser({
      id: authUser.id,
      fullName: authUser.fullName,
      role: authUser.role,
      coinsBalance: authUser.coinsBalance,
      subscriptionTier: authUser.subscriptionTier,
    })
  }, [setCurrentUser])

  const login = useCallback(async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    // In production, this would verify OTP via Supabase Auth
    // For now, accept any 4-digit OTP with known phone numbers
    if (otp.length !== 4) {
      return { success: false, error: 'Please enter a valid 4-digit OTP' }
    }

    const account = DEMO_ACCOUNTS[phone]
    if (account) {
      persistUser(account)
      setShowLoginModal(false)
      setLoginStep('phone')
      setPendingPhone('')
      return { success: true }
    }

    // For any phone number with valid OTP, create a new user
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      fullName: phone === pendingPhone ? `User ${phone.slice(-4)}` : `User ${phone.slice(-4)}`,
      phone,
      role: 'user',
      coinsBalance: 10,
      subscriptionTier: 'free',
    }
    persistUser(newUser)
    setShowLoginModal(false)
    setLoginStep('phone')
    setPendingPhone('')
    return { success: true }
  }, [persistUser, pendingPhone])

  const loginWithMagicLink = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    // In production, this would send a magic link via Supabase Auth
    // For now, auto-login as demo user
    const newUser: AuthUser = {
      id: `user-email-${Date.now()}`,
      fullName: email.split('@')[0],
      email,
      role: 'user',
      coinsBalance: 10,
      subscriptionTier: 'free',
    }
    persistUser(newUser)
    setShowLoginModal(false)
    setLoginStep('phone')
    return { success: true }
  }, [persistUser])

  const signup = useCallback(async (fullName: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    if (!fullName || !phone) {
      return { success: false, error: 'Name and phone are required' }
    }
    // In production, this would create a Supabase Auth account
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      fullName,
      phone,
      role: 'user',
      coinsBalance: 25, // Welcome bonus
      subscriptionTier: 'free',
    }
    persistUser(newUser)
    setShowLoginModal(false)
    setLoginStep('phone')
    setPendingPhone('')
    return { success: true }
  }, [persistUser])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('choutuppal_auth_user')
    setCurrentUser(null)
  }, [setCurrentUser])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithMagicLink,
    signup,
    logout,
    showLoginModal,
    setShowLoginModal,
    loginStep,
    setLoginStep,
    pendingPhone,
    setPendingPhone,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
