'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Flag,
  Landmark,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Users,
  Share2,
  Quote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LeaderProfilePageProps {
  profileData?: {
    id: string
    fullName: string
    designation: string
    party: string
    partyColor: string
    constituency: string
    avatarUrl: string | null
    coverImageUrl: string | null
    isVerified: boolean
    bio: string
    followersCount: number
    followingCount: number
    vision: string[]
    achievements: Array<{
      id: string
      year: string
      title: string
      description: string
      status: 'completed' | 'in-progress' | 'planned'
    }>
    events: Array<{
      id: string
      title: string
      date: string
      location: string
      time: string
      isUpcoming: boolean
    }>
    office: {
      address: string
      paContact: string
      officeHours: string
      email: string
    }
  }
}

// ─── Placeholder Data ────────────────────────────────────────────────────────

const placeholderLeader = {
  id: '1',
  fullName: 'Komatireddy Venkat Reddy',
  designation: 'MLA - Choutuppal Constituency',
  party: 'Indian National Congress',
  partyColor: '#138808',
  constituency: 'Choutuppal, Yadadri Bhuvanagiri',
  avatarUrl: null,
  coverImageUrl: null,
  isVerified: true,
  bio: 'Serving the people of Choutuppal with dedication. Committed to development, education, and welfare of every citizen in our constituency.',
  followersCount: 15400,
  followingCount: 45,
  vision: [
    'Quality education for every child in Choutuppal',
    'Modern healthcare facilities in all villages',
    'Employment opportunities through industrial development',
    'Complete road connectivity to all remote areas',
  ],
  achievements: [
    {
      id: '1',
      year: '2024',
      title: 'New Government Hospital',
      description: 'Built a 100-bed government hospital serving 50+ villages',
      status: 'completed' as const,
    },
    {
      id: '2',
      year: '2024',
      title: 'Road Development Project',
      description: 'Laid 45km of new roads connecting remote villages',
      status: 'completed' as const,
    },
    {
      id: '3',
      year: '2025',
      title: 'Digital Literacy Center',
      description: 'Setting up 5 digital literacy centers across constituency',
      status: 'in-progress' as const,
    },
    {
      id: '4',
      year: '2025',
      title: 'Water Supply Enhancement',
      description: 'Pipeline expansion to cover 20 more villages',
      status: 'planned' as const,
    },
  ],
  events: [
    {
      id: '1',
      title: 'Village Development Review Meeting',
      date: '2025-03-20',
      location: 'Choutuppal Mandal Office',
      time: '10:00 AM',
      isUpcoming: true,
    },
    {
      id: '2',
      title: 'Education Scholarship Distribution',
      date: '2025-03-25',
      location: 'Zilla Parishad High School',
      time: '3:00 PM',
      isUpcoming: true,
    },
    {
      id: '3',
      title: 'Health Camp for Rural Areas',
      date: '2025-04-02',
      location: 'PHC Choutuppal',
      time: '9:00 AM',
      isUpcoming: true,
    },
  ],
  office: {
    address: 'MLA Camp Office, Main Road, Choutuppal, Yadadri Bhuvanagiri - 508252',
    paContact: '+91 98765 43210',
    officeHours: 'Mon-Sat: 10:00 AM - 5:00 PM',
    email: 'office.choutuppal@example.com',
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCount(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

function getPartyBadgeStyle(party: string, partyColor: string): string {
  const p = party.toLowerCase()
  if (p.includes('bjp')) return 'bg-[#FF9933]/15 text-[#FF9933] border-[#FF9933]/30'
  if (p.includes('congress')) return 'bg-[#138808]/15 text-[#138808] border-[#138808]/30'
  if (p.includes('trs') || p.includes('brs')) return 'bg-pink-500/15 text-pink-600 border-pink-500/30'
  if (p.includes('tdp')) return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30'
  // Default gold badge
  return 'bg-[#D4AF37]/15 text-[#B8962E] border-[#D4AF37]/30'
}

function getStatusConfig(status: string): {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof CheckCircle2
} {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: CheckCircle2,
      }
    case 'in-progress':
      return {
        label: 'In Progress',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: Clock,
      }
    case 'planned':
      return {
        label: 'Planned',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Circle,
      }
    default:
      return {
        label: status,
        color: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: Circle,
      }
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ─── Tab Types ───────────────────────────────────────────────────────────────

type TabKey = 'vision' | 'achievements' | 'events' | 'contact'

const TABS: { key: TabKey; label: string; icon: typeof Landmark }[] = [
  { key: 'vision', label: 'Vision', icon: Quote },
  { key: 'achievements', label: 'Achievements', icon: CheckCircle2 },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'contact', label: 'Contact Office', icon: Phone },
]

// ─── Main Component ──────────────────────────────────────────────────────────

export default function LeaderProfilePage({ profileData }: LeaderProfilePageProps) {
  const leader = profileData ?? placeholderLeader

  const navigateTo = useAppStore((s) => s.navigateTo)
  const { isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState<TabKey>('vision')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showPastEvents, setShowPastEvents] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // ─── Scroll listener for sticky header ──────────────────────────────────

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 120)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow this leader')
      return
    }
    setFollowLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 600))
    setIsFollowing(!isFollowing)
    setFollowLoading(false)
    toast.success(isFollowing ? 'Unfollowed successfully' : 'Following successfully')
  }

  const handleRaiseIssue = () => {
    toast.info('Feature coming soon!', {
      description: 'The "Raise an Issue" feature will be available shortly.',
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: leader.fullName,
          text: leader.designation,
          url: window.location.href,
        })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied to clipboard!')
    }
  }

  const partyBadgeStyle = getPartyBadgeStyle(leader.party, leader.partyColor)
  const leaderInitial = leader.fullName.charAt(0).toUpperCase()

  // ─── Past events placeholder ────────────────────────────────────────────

  const pastEvents = leader.events.filter((e) => !e.isUpcoming)
  const upcomingEvents = leader.events.filter((e) => e.isUpcoming)

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Sticky Compact Header ────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100">
          <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9"
              onClick={() => navigateTo('community')}
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {/* Compact Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-[#D4AF37]/40 shadow-sm shadow-[#D4AF37]/10">
              {leader.avatarUrl ? (
                <img
                  src={leader.avatarUrl}
                  alt={leader.fullName}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                leaderInitial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {leader.fullName}
                </h2>
                {leader.isVerified && (
                  <ShieldCheck className="h-4 w-4 text-[#D4AF37] shrink-0" />
                )}
              </div>
              <p className="text-xs font-medium text-[#FF9933] truncate">
                {leader.designation}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleFollow}
              disabled={followLoading}
              className={`shrink-0 rounded-lg text-xs font-semibold px-3 h-8 transition-all duration-300 active:scale-95 ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white hover:from-[#C5A131] hover:to-[#A68728]'
              }`}
            >
              {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Cover Photo ──────────────────────────────────────────────────── */}
      <div
        className={`relative transition-all duration-500 ease-in-out ${
          isScrolled ? 'h-0 overflow-hidden' : 'h-48 md:h-64'
        }`}
      >
        {/* Tricolor gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF9933]/15 via-white/10 to-[#138808]/15 z-10" />
        {/* Tricolor thin lines */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col">
          <div className="h-[3px] bg-[#FF9933]/40" />
          <div className="h-[3px] bg-white/50" />
          <div className="h-[3px] bg-[#138808]/40" />
        </div>
        {leader.coverImageUrl ? (
          <img
            src={leader.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a237e]/80 via-[#1a237e]/60 to-[#0d1642]" />
        )}

        {/* Back button on cover */}
        <div className="absolute top-3 left-3 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full"
            onClick={() => navigateTo('community')}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Share button on cover */}
        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full"
            onClick={handleShare}
            aria-label="Share profile"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── Profile Info Section ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Avatar + Name Block */}
        <div className="relative -mt-14 md:-mt-16 mb-4">
          <div className="flex items-end gap-4">
            {/* ROUNDED SQUARE Avatar */}
            <div
              className={`relative shrink-0 transition-all duration-500 ${
                isScrolled ? 'w-0 h-0 opacity-0 -mt-0' : 'w-28 h-28 md:w-32 md:h-32 -mt-0'
              }`}
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center text-white font-bold text-4xl md:text-5xl ring-4 ring-[#D4AF37] shadow-lg shadow-[#D4AF37]/20">
                {leader.avatarUrl ? (
                  <img
                    src={leader.avatarUrl}
                    alt={leader.fullName}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  leaderInitial
                )}
              </div>
              {/* Verified badge on avatar */}
              {leader.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37]" />
                </div>
              )}
            </div>

            {/* Name + Designation */}
            <div className="min-w-0 pb-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {leader.fullName}
                </h1>
                {leader.isVerified && (
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-[#D4AF37] shrink-0" />
                )}
              </div>
              <p className="text-sm font-semibold text-[#FF9933] mt-0.5">
                {leader.designation}
              </p>
              {/* Party badge */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={`${partyBadgeStyle} text-xs font-semibold gap-1`}
                >
                  <Flag className="h-3 w-3" />
                  {leader.party}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {leader.constituency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Follower Stats ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-900">
              {formatCount(leader.followersCount)}
            </span>
            <span className="text-xs text-gray-500">Followers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">
              {formatCount(leader.followingCount)}
            </span>
            <span className="text-xs text-gray-500">Following</span>
          </div>
        </div>

        {/* ─── Action Buttons Row ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 mb-6 flex-wrap">
          {/* Follow Button */}
          <Button
            onClick={handleFollow}
            disabled={followLoading}
            className={`rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 active:scale-95 ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 shadow-none'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white hover:from-[#C5A131] hover:to-[#A68728] shadow-md shadow-[#D4AF37]/20'
            }`}
          >
            {followLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </span>
            ) : isFollowing ? (
              'Following'
            ) : (
              'Follow'
            )}
          </Button>

          {/* Raise an Issue Button */}
          <Button
            variant="outline"
            onClick={handleRaiseIssue}
            className="rounded-lg px-4 py-2.5 font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 active:scale-95"
          >
            <AlertCircle className="h-4 w-4 mr-1.5" />
            Raise an Issue
          </Button>

          {/* Official Website Button */}
          <Button
            variant="outline"
            className="rounded-lg px-4 py-2.5 font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 active:scale-95"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Website
          </Button>

          {/* Share Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="rounded-lg h-10 w-10 border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-300 active:scale-95"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* ─── Tab Navigation ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tricolor line at top of tab bar */}
          <div className="flex flex-col">
            <div className="h-[3px] bg-[#FF9933]/60" />
            <div className="h-[3px] bg-gray-100" />
            <div className="h-[3px] bg-[#138808]/60" />
          </div>

          {/* Tab buttons */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
            {TABS.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 md:px-6 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-300 relative ${
                    isActive
                      ? 'text-[#D4AF37] font-semibold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                  {/* Active underline indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#D4AF37] rounded-full transition-all duration-300" />
                  )}
                </button>
              )
            })}
          </div>

          {/* ─── Tab Content ──────────────────────────────────────────────── */}
          <div className="p-4 md:p-6">
            {/* ===== VISION TAB ===== */}
            {activeTab === 'vision' && (
              <div className="space-y-6 transition-all duration-300">
                {/* Vision Statement */}
                <div className="relative bg-gradient-to-br from-[#1a237e]/5 to-[#D4AF37]/5 rounded-xl p-5 md:p-6 border border-[#D4AF37]/10">
                  <Quote className="absolute top-3 left-3 h-8 w-8 text-[#D4AF37]/20" />
                  <p className="text-gray-700 leading-relaxed italic pl-6 md:pl-8 text-sm md:text-base">
                    {leader.bio}
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-[#D4AF37]" />
                    About
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {leader.bio} With years of dedicated public service,{' '}
                    {leader.fullName.split(' ').pop()} has been at the forefront of transforming{' '}
                    {leader.constituency.split(',')[0]} into a model constituency. Known for
                    accessibility and commitment to grassroots development.
                  </p>
                </div>

                {/* My Vision Section */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-[#D4AF37]" />
                    My Vision for {leader.constituency.split(',')[0]}
                  </h3>
                  <div className="space-y-2.5">
                    {leader.vision.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex items-start gap-2 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals/Agenda */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                    Key Agenda Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      '100% school enrollment',
                      'Clean drinking water for all',
                      'Road connectivity to every village',
                      'Primary Health Center within 5km',
                      'Youth skill development centers',
                      'Farmer welfare & support',
                    ].map((goal, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1a237e]/5 rounded-lg border border-[#1a237e]/10"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#1a237e]" />
                        <span className="text-xs font-medium text-[#1a237e]">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== ACHIEVEMENTS TAB ===== */}
            {activeTab === 'achievements' && (
              <div className="transition-all duration-300">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                  Development Work & Achievements
                </h3>

                {/* Timeline Layout */}
                <div className="relative pl-6 md:pl-8">
                  {/* Vertical line */}
                  <div className="absolute left-[9px] md:left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#D4AF37] via-[#FF9933] to-[#138808]" />

                  <div className="space-y-6">
                    {leader.achievements.map((achievement, idx) => {
                      const statusConfig = getStatusConfig(achievement.status)
                      const StatusIcon = statusConfig.icon
                      return (
                        <div key={achievement.id} className="relative">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-6 md:-left-8 top-3 w-[18px] md:w-[22px] h-[18px] md:h-[22px] rounded-full border-2 border-white shadow-md flex items-center justify-center ${
                              achievement.status === 'completed'
                                ? 'bg-emerald-500'
                                : achievement.status === 'in-progress'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>

                          {/* Achievement Card */}
                          <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 hover:shadow-md transition-all duration-300 ml-1">
                            {/* Year badge + Status */}
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold bg-[#1a237e]/5 text-[#1a237e] border-[#1a237e]/20"
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {achievement.year}
                              </Badge>
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.color} ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <h4 className="text-sm font-bold text-gray-900 mb-1">
                              {achievement.title}
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-3">
                              {achievement.description}
                            </p>

                            {/* Before/After Photo Placeholders */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-200">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                  Before
                                </span>
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                                  <span className="text-gray-400 text-xs">📷</span>
                                </div>
                              </div>
                              <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-200">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                  After
                                </span>
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                    <p className="text-lg font-bold text-emerald-700">
                      {leader.achievements.filter((a) => a.status === 'completed').length}
                    </p>
                    <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">
                      Completed
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">
                      {leader.achievements.filter((a) => a.status === 'in-progress').length}
                    </p>
                    <p className="text-[10px] font-medium text-amber-600 uppercase tracking-wider">
                      In Progress
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                    <p className="text-lg font-bold text-blue-700">
                      {leader.achievements.filter((a) => a.status === 'planned').length}
                    </p>
                    <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">
                      Planned
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ===== EVENTS TAB ===== */}
            {activeTab === 'events' && (
              <div className="transition-all duration-300">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#D4AF37]" />
                  Upcoming Events & Rallies
                </h3>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-[#D4AF37]/20 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Date badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FF9933]/10 border border-[#FF9933]/20">
                                <Calendar className="h-4 w-4 text-[#FF9933]" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#FF9933]">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                            </div>
                            {/* Event Title */}
                            <h4 className="text-sm font-bold text-gray-900 mb-2">
                              {event.title}
                            </h4>
                            {/* Location & Time */}
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </span>
                            </div>
                          </div>
                          {/* Register Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 rounded-lg border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 text-xs font-semibold transition-all duration-300 active:scale-95"
                            onClick={() => toast.info('Registration coming soon!')}
                          >
                            Register
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No upcoming events</p>
                  </div>
                )}

                {/* Past Events Collapsible Section */}
                {pastEvents.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowPastEvents(!showPastEvents)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all duration-300"
                    >
                      {showPastEvents ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Past Events ({pastEvents.length})
                    </button>
                    {showPastEvents && (
                      <div className="mt-3 space-y-2">
                        {pastEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100 opacity-70"
                          >
                            <h4 className="text-sm font-medium text-gray-700">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {formatDate(event.date)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===== CONTACT OFFICE TAB ===== */}
            {activeTab === 'contact' && (
              <div className="transition-all duration-300">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#D4AF37]" />
                  Contact MLA Office
                </h3>

                <div className="space-y-3">
                  {/* Office Address */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1a237e]/10 shrink-0">
                        <MapPin className="h-5 w-5 text-[#1a237e]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Office Address
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {leader.office.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PA Contact */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 shrink-0">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          PA Contact
                        </h4>
                        <a
                          href={`tel:${leader.office.paContact.replace(/\s/g, '')}`}
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-all duration-300"
                        >
                          {leader.office.paContact}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 shrink-0">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Office Hours
                        </h4>
                        <p className="text-sm text-gray-700">{leader.office.officeHours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Email
                        </h4>
                        <a
                          href={`mailto:${leader.office.email}`}
                          className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-all duration-300"
                        >
                          {leader.office.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Meeting Button */}
                  <Button
                    className="w-full rounded-xl py-6 bg-gradient-to-r from-[#1a237e] to-[#283593] text-white font-semibold hover:from-[#151c6e] hover:to-[#1e2d7e] shadow-lg shadow-[#1a237e]/20 transition-all duration-300 active:scale-[0.98]"
                    onClick={() => toast.info('Meeting scheduling coming soon!')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule a Meeting
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom Spacer ───────────────────────────────────────────────── */}
      <div className="h-8" />
    </div>
  )
}
