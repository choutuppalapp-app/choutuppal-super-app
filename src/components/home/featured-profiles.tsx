'use client'

import { Crown, User as UserIcon, ChevronRight, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'

export function FeaturedProfiles() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigateTo = useAppStore(s => s.navigateTo)

  useEffect(() => {
    fetch('/api/featured-profiles')
      .then(res => res.json())
      .then(data => {
        if (data.profiles && Array.isArray(data.profiles)) {
          setProfiles(data.profiles)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch featured profiles', err)
        setLoading(false)
      })
  }, [])

  if (loading || profiles.length === 0) {
    return null // Completely hidden if no profiles exist
  }

  return (
    <section className="px-4 py-4">
      {/* ── Static heading ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#4169E1]" />
          <h2 className="text-lg font-bold text-gray-800">Featured Profiles</h2>
        </div>
        <button
          onClick={() => navigateTo('community')}
          className="flex items-center gap-1 text-xs text-[#4169E1] font-medium hover:text-[#4169E1]/80 transition-colors bg-transparent border-none p-0 cursor-pointer"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Scrollable profile cards ── */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {profiles.map((user) => {
          const isLeader = user.role === 'city_admin' || user.role === 'super_admin' || user.role === 'agent'
          const IconComponent = isLeader ? Crown : UserIcon
          const gradient = isLeader ? 'from-[#D4AF37] to-[#4169E1]' : 'from-[#4169E1] to-[#6B8DD6]'
          const ringColor = isLeader ? 'ring-[#D4AF37]' : 'ring-[#4169E1]'

          const name = user.fullName || 'User'
          const title = user.profile?.bio || (isLeader ? 'Leader' : 'Member')
          const avatarUrl = user.avatarUrl
          
          console.log('Featured Profile Link:', '/profile/' + user.id)

          return (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="shrink-0 group"
            >
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl p-4 flex flex-col items-center gap-2 w-36 hover:bg-white/30 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                {/* Type indicator */}
                <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                  isLeader ? 'bg-[#FF9933]' : 'bg-[#4169E1]'
                }`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
                
                {/* Avatar */}
                <div className="relative mt-1">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={name} 
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-white/50 shadow-md" 
                    />
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/50 shadow-md`}
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                  {user.profile?.isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                      <ShieldCheck className={`w-4 h-4 ${isLeader ? 'text-[#D4AF37]' : 'text-[#4169E1]'}`} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center w-full mt-1">
                  <p className="text-sm font-bold text-gray-900 truncate w-full">{name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500 truncate w-full">{title}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
