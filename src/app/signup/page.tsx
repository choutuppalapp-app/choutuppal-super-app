'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Loader2, Mail, Lock, User, Phone, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      toast.error('అన్ని తప్పనిసరి వివరాలను నింపండి.')
      return
    }

    setLoading(true)
    try {
      const res = await signup(fullName.trim(), phone.trim(), email.trim(), password.trim())
      if (res.success) {
        toast.success('రిజిస్ట్రేషన్ విజయవంతమైంది! లాగిన్ అవ్వండి. 🎉')
        router.push('/login')
      } else {
        toast.error(res.error || 'రిజిస్ట్రేషన్ విఫలమైంది.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-gray-900 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">అకౌంట్ క్రియేట్ చేయండి (Sign Up)</h1>
          <p className="text-xs text-gray-500 mt-1">కొత్త అకౌంట్‌ను సృష్టించండి</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">పూర్తి పేరు (Full Name) *</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
                placeholder="ఉదా: కిరణ్ కుమార్"
              />
              <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">మొబైల్ నంబర్ (Phone) *</label>
            <div className="relative">
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
                placeholder="ఉదా: 9876543210"
              />
              <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
            <label className="text-xs font-bold text-gray-700">పాస్‌వర్డ్ (Password) *</label>
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-white" />
                అకౌంట్ క్రియేట్ చేయండి
              </div>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 font-semibold mt-2">
          ఇప్పటికే అకౌంట్ ఉందా?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            లాగిన్ చేయండి
          </Link>
        </p>
      </div>
    </div>
  )
}
export { SignupPage }
