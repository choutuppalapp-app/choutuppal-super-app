'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ShieldCheck, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import IndividualProfilePage from '@/components/profile/individual-profile-page'
import LeaderProfilePage from '@/components/profile/leader-profile-page'

// ─── Types ─────────────────────────────────────────────────
interface ProfileData {
  id: string
  userId: string
  bio: string
  avatarUrl: string | null
  coverImageUrl: string | null
  isPublicFigure: boolean
  publicFigureCategory: string | null
  isVerified: boolean
  followersCount: number
  followingCount: number
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
    createdAt: string
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  POLITICIAN: 'నాయకుడు',
  INFLUENCER: 'Influencer',
  GOVT_OFFICIAL: 'ప్రభుత్వోద్యోగి',
  CELEBRITY: 'Celebrity',
}

// ─── Component ──────────────────────────────────────────────
export default function ProfileView() {
  const selectedProfileUserId = useAppStore((s) => s.selectedProfileUserId)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const currentUser = useAppStore((s) => s.currentUser)
  const profileType = useAppStore((s) => s.profileType)
  const { isAuthenticated, user } = useAuth()

  const isOwnProfile = !selectedProfileUserId || (currentUser && selectedProfileUserId === currentUser.id)
  const profileUserId = isOwnProfile ? currentUser?.id : selectedProfileUserId

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!profileUserId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/social/profiles?userId=${profileUserId}`)
      if (res.ok) {
        const data = await res.json()
        const profileData = data.profile || data
        setProfile(profileData)
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [profileUserId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // ─── Loading State ───────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 md:h-52 rounded-2xl bg-gray-200" />
        <div className="px-4 -mt-12">
          <div className="w-24 h-24 rounded-full bg-gray-300" />
        </div>
        <div className="px-4 space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  // ─── Determine Profile Type ──────────────────────────────
  // Priority:
  // 1. Explicit profileType from store (set by navigation)
  // 2. Profile data: POLITICIAN / GOVT_OFFICIAL → Leader, else Individual
  // 3. Default: Individual
  const isLeaderProfile =
    profileType === 'leader' ||
    profile?.publicFigureCategory === 'POLITICIAN' ||
    profile?.publicFigureCategory === 'GOVT_OFFICIAL'

  // ─── Render Leader Profile ───────────────────────────────
  if (isLeaderProfile) {
    return (
      <LeaderProfilePage
        profileData={
          profile
            ? {
                id: profile.id,
                fullName: profile.user.fullName,
                designation: CATEGORY_LABELS[profile.publicFigureCategory || ''] || 'Community Leader',
                party: 'Public Service',
                partyColor: '#D4AF37',
                constituency: 'Choutuppal, Yadadri Bhuvanagiri',
                avatarUrl: profile.avatarUrl || profile.user.avatarUrl,
                coverImageUrl: profile.coverImageUrl,
                isVerified: profile.isVerified,
                bio: profile.bio || '',
                followersCount: profile.followersCount,
                followingCount: profile.followingCount,
                vision: [
                  'Quality education for every child',
                  'Modern healthcare facilities in all villages',
                  'Employment opportunities through development',
                  'Complete road connectivity to all areas',
                ],
                achievements: [],
                events: [],
                office: {
                  address: 'Choutuppal, Yadadri Bhuvanagiri',
                  paContact: '+91 00000 00000',
                  officeHours: 'Mon-Sat: 10:00 AM - 5:00 PM',
                  email: 'contact@example.com',
                },
              }
            : undefined
        }
      />
    )
  }

  // ─── Render Individual Profile ───────────────────────────
  return (
    <IndividualProfilePage
      profileData={
        profile
          ? {
              id: profile.id,
              fullName: profile.user.fullName,
              profession: profile.publicFigureCategory === 'INFLUENCER'
                ? 'Influencer'
                : profile.publicFigureCategory === 'CELEBRITY'
                  ? 'Celebrity'
                  : 'Professional',
              city: 'Choutuppal',
              avatarUrl: profile.avatarUrl || profile.user.avatarUrl,
              coverImageUrl: profile.coverImageUrl,
              isVerified: profile.isVerified,
              bio: profile.bio || '',
              followersCount: profile.followersCount,
              followingCount: profile.followingCount,
              postsCount: 0,
              skills: [],
              services: [],
              reviews: [],
            }
          : undefined
      }
    />
  )
}
