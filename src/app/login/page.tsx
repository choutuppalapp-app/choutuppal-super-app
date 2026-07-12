'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await login(email, password)
      if (res.success) {
        toast.success('స్వాగతం! లాగిన్ విజయవంతమైంది. 🎉')
        router.push('/')
      } else {
        toast.error(res.error || 'లాగిన్ వివరాలు తప్పుగా ఉన్నాయి.')
      }
    } catch (err: any) {
      toast.error(err.message || 'సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch (err: any) {
      console.error(err)
      toast.error('గూగుల్ లాగిన్ విఫలమైంది.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-gray-900 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">లాగిన్ చేయండి (Sign In)</h1>
          <p className="text-xs text-gray-500 mt-1">మీ అకౌంట్‌తో లాగిన్ అవ్వండి</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">ఈమెయిల్ అడ్రస్ (Email) *</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
                placeholder="example@mail.com"
              />
              <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-700">పాస్‌వర్డ్ (Password) *</label>
              <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
                placeholder="••••••••"
              />
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || googleLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-white" />
                లాగిన్ చేయండి
              </div>
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-150"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">లేదా (Or)</span>
          <div className="flex-grow border-t border-gray-150"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
          ) : (
            <svg className="w-4 h-4 text-current" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          )}
          గూగుల్ ద్వారా లాగిన్ చేయండి
        </button>

        <p className="text-center text-xs text-gray-500 font-semibold mt-2">
          అకౌంట్ లేదా?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            అకౌంట్ క్రియేట్ చేయండి
          </Link>
        </p>
      </div>
    </div>
  )
}
export { LoginPage }
