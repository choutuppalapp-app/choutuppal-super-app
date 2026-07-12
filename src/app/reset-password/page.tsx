'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error('కొత్త పాస్‌వర్డ్ టైప్ చేయండి.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('రెండు పాస్‌వర్డ్‌లు ఒకేలా ఉండాలి.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim(),
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('పాస్‌వర్డ్ విజయవంతంగా రీసెట్ చేయబడింది! 🥳')
        router.push('/login')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-gray-900 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">కొత్త పాస్‌వర్డ్</h1>
          <p className="text-xs text-gray-500 mt-1">దయచేసి మీ కొత్త పాస్‌వర్డ్‌ను సెట్ చేసుకోండి</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">కొత్త పాస్‌వర్డ్ (New Password) *</label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">పాస్‌వర్డ్ ధృవీకరించండి (Confirm Password) *</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
                placeholder="••••••••"
              />
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                పాస్వర్డ్ రీసెట్ చేయండి
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
export { ResetPasswordPage }
