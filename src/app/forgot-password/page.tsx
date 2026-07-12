'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('ఈమెయిల్ అడ్రస్ టైప్ చేయండి.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఈమెయిల్ కి పంపబడింది! 📩')
        setEmail('')
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
        <div className="flex items-center gap-2">
          <Link href="/login" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-950 transition shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-xl font-black text-gray-900 leading-tight">పాస్‌వర్డ్ రీసెట్</h1>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed text-center">
          మీ రిజిస్టర్డ్ ఈమెయిల్ ఎంటర్ చేయండి. మేము మీ పాస్‌వర్డ్‌ను రీసెట్ చేయడానికి ఒక ప్రత్యేక లింక్‌ను పంపుతాము.
        </p>

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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-white" />
                పాస్వర్డ్ రీసెట్ లింక్ పంపండి
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
export { ForgotPasswordPage }
