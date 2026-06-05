'use client'

import { useState } from 'react'
import {
  X, Mail, ArrowRight, Shield, Sparkles,
  Lock, User, ChevronRight, Eye, EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { useMounted } from '@/hooks/use-mounted'

/**
 * LoginModal — Email/Password + Google OAuth
 *
 * RULES ENFORCED:
 * 1. Full-screen overlay: fixed inset-0 bg-black/60 backdrop-blur-sm
 * 2. Card: bg-white rounded-xl shadow-2xl — NO transparency, NO GlassCard
 * 3. NO Framer Motion — all animations use CSS transitions
 * 4. Mounted guard — don't render until after hydration
 * 5. All inputs: bg-white border-gray-200 — solid, readable
 * 6. All text: text-gray-800 / text-gray-600 — dark, readable on white
 */

export function LoginModal() {
  const {
    showLoginModal, setShowLoginModal,
    login, signup, loginWithGoogle,
  } = useAuth()

  const mounted = useMounted()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => {
    setShowLoginModal(false)
    setEmail('')
    setPassword('')
    setFullName('')
    setError('')
    setSuccessMsg('')
    setLoading(false)
    setShowPassword(false)
  }

  const handleEmailLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Login failed. Check your credentials.')
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!fullName) {
      setError('Please enter your full name')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    const result = await signup(fullName, email, password)
    if (!result.success) {
      setError(result.error || 'Signup failed')
    } else {
      setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      setIsSignup(false)
      setPassword('')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const result = await loginWithGoogle()
    if (!result.success) {
      setError(result.error || 'Google sign-in failed')
      setLoading(false)
    }
    // Don't setLoading(false) on success — page will redirect
  }

  // Don't render until client-side mount to prevent hydration mismatch
  if (!mounted || !showLoginModal) {
    return null
  }

  return (
    /* ═══ FULL-SCREEN OVERLAY ═══ */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      {/* SOLID WHITE CARD */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header gradient ─── */}
        <div className="relative bg-gradient-to-r from-[#D4AF37] to-[#4169E1] px-6 py-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Close login modal"
          >
            <X className="size-4" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <Shield className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isSignup ? 'Join Mana Cities' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {isSignup
              ? 'Create your account to get started'
              : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* ─── Body — solid white, all text dark ─── */}
        <div className="bg-white p-6 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
            </div>
          )}

          {/* ─── Google OAuth Button ─── */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-12 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="size-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin inline-block" />
            ) : (
              <>
                <svg className="size-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-400">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ─── Email/Password Login ─── */}
          {!isSignup && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-800">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('password')?.focus()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-800">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleEmailLogin}
                disabled={loading || !email.includes('@') || password.length < 6}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white h-12 font-semibold hover:from-[#C9A533] hover:to-[#A88518] transition-all"
              >
                {loading ? (
                  <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  <>Sign In <ArrowRight className="size-4 ml-2" /></>
                )}
              </Button>
            </div>
          )}

          {/* ─── Signup ─── */}
          {isSignup && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-800">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail" className="text-sm font-medium text-gray-800">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword" className="text-sm font-medium text-gray-800">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-[#D4AF37]" />
                  Get 25 welcome coins when you sign up!
                </p>
              </div>
              <Button
                onClick={handleSignup}
                disabled={loading || !fullName || !email.includes('@') || password.length < 6}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white h-12 font-semibold hover:from-[#C9A533] hover:to-[#A88518] transition-all"
              >
                {loading ? (
                  <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                ) : (
                  <>Create Account <ChevronRight className="size-4 ml-1" /></>
                )}
              </Button>
            </div>
          )}

          {/* ─── Toggle signup/login ─── */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
                setSuccessMsg('')
                setPassword('')
              }}
              className="text-sm text-[#4169E1] hover:underline font-medium"
            >
              {isSignup
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
