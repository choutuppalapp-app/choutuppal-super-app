'use client'

import { Crown, User, ChevronRight, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/lib/store'

/**
 * FeaturedProfiles — Quick access to Individual & Leader profile pages.
 * Shown on the home page as a horizontal scrollable row of profile cards.
 */
export function FeaturedProfiles() {
  const navigateTo = useAppStore((s) => s.navigateTo)
  const setProfileType = useAppStore((s) => s.setProfileType)
  const setSelectedProfileUserId = useAppStore((s) => s.setSelectedProfileUserId)

  const profiles = [
    {
      id: 'demo-individual',
      name: 'Rajesh Kumar',
      title: 'Digital Marketer',
      type: 'individual' as const,
      icon: User,
      gradient: 'from-[#4169E1] to-[#6B8DD6]',
      ringColor: 'ring-[#4169E1]',
      verified: true,
      followers: '2.5K',
    },
    {
      id: 'demo-leader',
      name: 'Komatireddy V. Reddy',
      title: 'MLA - Choutuppal',
      type: 'leader' as const,
      icon: Crown,
      gradient: 'from-[#D4AF37] to-[#4169E1]',
      ringColor: 'ring-[#D4AF37]',
      verified: true,
      followers: '15.4K',
    },
    {
      id: 'demo-individual-2',
      name: 'Lakshmi Devi',
      title: 'Tailor & Designer',
      type: 'individual' as const,
      icon: User,
      gradient: 'from-emerald-500 to-teal-500',
      ringColor: 'ring-emerald-500',
      verified: false,
      followers: '890',
    },
    {
      id: 'demo-leader-2',
      name: 'V. Srinivas Rao',
      title: 'MPTC - Choutuppal',
      type: 'leader' as const,
      icon: Crown,
      gradient: 'from-[#FF9933] to-[#138808]',
      ringColor: 'ring-[#FF9933]',
      verified: true,
      followers: '5.2K',
    },
  ]

  const handleProfileClick = (profile: typeof profiles[number]) => {
    setSelectedProfileUserId(null) // Use placeholder data
    setProfileType(profile.type)
    navigateTo(profile.type === 'leader' ? 'leader-profile' : 'individual-profile')
  }

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center shadow-sm">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Featured People</h2>
            <p className="text-[10px] text-gray-400 -mt-0.5">Professionals & Leaders</p>
          </div>
        </div>
        <button
          onClick={() => navigateTo('community')}
          className="flex items-center gap-1 text-xs text-[#4169E1] font-medium hover:text-[#4169E1]/80 transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {profiles.map((profile) => {
          const IconComponent = profile.icon
          const isLeader = profile.type === 'leader'
          return (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              className="flex flex-col items-center gap-2 shrink-0 group transition-all duration-300"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-16 h-16 ${isLeader ? 'rounded-2xl' : 'rounded-full'} bg-gradient-to-br ${profile.gradient} flex items-center justify-center text-white font-bold text-xl ring-2 ${profile.ringColor} ring-offset-2 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                >
                  {profile.name.charAt(0)}
                </div>
                {profile.verified && (
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
                <p className="text-xs font-semibold text-gray-900 truncate w-full">{profile.name.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-400 truncate w-full">{profile.title}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
