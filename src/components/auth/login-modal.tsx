'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Phone, Mail, ArrowRight, Shield, Sparkles,
  Lock, User, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

/**
 * LoginModal — COMPLETE REWRITE
 *
 * RULES ENFORCED:
 * 1. Full-screen overlay: fixed inset-0 bg-black/60 backdrop-blur-sm
 * 2. Card: bg-white rounded-xl shadow-2xl p-8 — NO transparency, NO GlassCard
 * 3. All inputs: bg-white border-gray-200 — solid, readable
 * 4. All text: text-gray-800 / text-gray-600 — dark, readable on white
 * 5. Close on overlay click or X button
 */
export function LoginModal() {
  const {
    showLoginModal, setShowLoginModal,
    login, loginWithMagicLink, signup,
    loginStep, setLoginStep,
    pendingPhone, setPendingPhone,
  } = useAuth()

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone')
  const [isSignup, setIsSignup] = useState(false)

  const handleClose = () => {
    setShowLoginModal(false)
    setLoginStep('phone')
    setPhone('')
    setOtp('')
    setEmail('')
    setFullName('')
    setError('')
    setLoading(false)
  }

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 800))
    setPendingPhone(phone)
    setLoginStep('otp')
    setLoading(false)
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      setError('Please enter the 4-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(pendingPhone, otp)
    if (!result.success) {
      setError(result.error || 'Verification failed')
    }
    setLoading(false)
  }

  const handleMagicLink = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    setLoading(true)
    setError('')
    const result = await loginWithMagicLink(email)
    if (!result.success) {
      setError(result.error || 'Failed to send magic link')
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!fullName || !phone || phone.length < 10) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    const result = await signup(fullName, phone)
    if (!result.success) {
      setError(result.error || 'Signup failed')
    }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {showLoginModal && (
        /* ═══ FULL-SCREEN OVERLAY — bg-black/60 backdrop-blur-sm ═══ */
        <motion.div
          key="login-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            // Close only when clicking the overlay itself, not the card
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          {/* SOLID WHITE CARD — bg-white rounded-xl shadow-2xl */}
          <motion.div
            key="login-card"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
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
                {isSignup ? 'Join Choutuppal' : 'Welcome Back'}
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* ─── Phone + OTP login ─── */}
              {!isSignup && authMethod === 'phone' && loginStep === 'phone' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-800">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Demo: 9999999999 (Super Admin) · 5555555551 (City Admin) · 6666666661 (Agent) · 8888888888 (User)
                    </p>
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length < 10}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white h-12 font-semibold hover:from-[#C9A533] hover:to-[#A88518] transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Send OTP <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <div className="relative flex items-center">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="px-3 text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <button
                    onClick={() => setAuthMethod('email')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Mail className="size-4" />
                    Sign in with Email
                  </button>
                </div>
              )}

              {!isSignup && authMethod === 'phone' && loginStep === 'otp' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      We sent a code to <span className="font-semibold text-gray-800">{pendingPhone}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Enter any 4-digit code to continue</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-800">Verification Code</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter 4-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="pl-10 bg-white border-gray-200 h-12 text-center text-lg tracking-widest font-bold text-gray-800"
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 4}
                    className="w-full bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white h-12 font-semibold hover:from-[#3b5fd4] hover:to-[#2a4cb0] transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Verify & Login <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <button
                    onClick={() => { setLoginStep('phone'); setOtp(''); setError(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Change phone number
                  </button>
                </div>
              )}

              {/* ─── Email login ─── */}
              {!isSignup && authMethod === 'email' && (
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
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      We&apos;ll send you a magic link to sign in
                    </p>
                  </div>
                  <Button
                    onClick={handleMagicLink}
                    disabled={loading || !email.includes('@')}
                    className="w-full bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white h-12 font-semibold hover:from-[#3b5fd4] hover:to-[#2a4cb0] transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                  <button
                    onClick={() => { setAuthMethod('phone'); setError(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Sign in with phone instead
                  </button>
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
                    <Label htmlFor="signupPhone" className="text-sm font-medium text-gray-800">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        id="signupPhone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-10 bg-white border-gray-200 h-12 text-gray-800 placeholder:text-gray-400"
                      />
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
                    disabled={loading || !fullName || phone.length < 10}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white h-12 font-semibold hover:from-[#C9A533] hover:to-[#A88518] transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        Create Account <ChevronRight className="size-4 ml-1" />
                      </>
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
                    setLoginStep('phone')
                    setAuthMethod('phone')
                  }}
                  className="text-sm text-[#4169E1] hover:underline font-medium"
                >
                  {isSignup
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
