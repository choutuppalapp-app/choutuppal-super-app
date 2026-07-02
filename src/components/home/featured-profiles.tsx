'use client'

import { Crown, User as UserIcon, ChevronRight, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function FeaturedProfiles() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
        <Link
          href="/community"
          className="flex items-center gap-1 text-xs text-[#4169E1] font-medium hover:text-[#4169E1]/80 transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
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

          return (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex flex-col items-center gap-2 shrink-0 group transition-all duration-300"
            >
              {/* Avatar */}
              <div className="relative">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={name} 
                    className={`w-16 h-16 ${isLeader ? 'rounded-2xl' : 'rounded-full'} object-cover ring-2 ${ringColor} ring-offset-2 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`} 
                  />
                ) : (
                  <div
                    className={`w-16 h-16 ${isLeader ? 'rounded-2xl' : 'rounded-full'} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl ring-2 ${ringColor} ring-offset-2 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                  >
                    {name.charAt(0)}
                  </div>
                )}
                
                {user.profile?.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                    <ShieldCheck className={`w-4 h-4 ${isLeader ? 'text-[#D4AF37]' : 'text-[#4169E1]'}`} />
                  </div>
                )}
                {/* Type indicator */}
                <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                  isLeader ? 'bg-[#FF9933]' : 'bg-[#4169E1]'
                }`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="text-center max-w-[80px]">
                <p className="text-xs font-semibold text-gray-900 truncate w-full">{name.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-400 truncate w-full">{title}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
