'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  User,
  Briefcase,
  MessageCircle,
  Share2,
  Star,
  MapPin,
  ShieldCheck,
  Eye,
  Search,
  Globe,
  Target,
  ChevronLeft,
  Phone,
  Heart,
  Clock,
  Award,
  ArrowLeft,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceItem {
  id: string
  title: string
  description: string
  price: string
  icon: string
}

interface ReviewItem {
  id: string
  name: string
  rating: number
  text: string
  time: string
}

interface IndividualProfilePageProps {
  profileData?: {
    id: string
    fullName: string
    profession: string
    city: string
    avatarUrl: string | null
    coverImageUrl: string | null
    isVerified: boolean
    bio: string
    followersCount: number
    followingCount: number
    postsCount: number
    skills: string[]
    services: ServiceItem[]
    reviews: ReviewItem[]
  }
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────

const placeholderProfile = {
  id: '1',
  fullName: 'Rajesh Kumar',
  profession: 'Digital Marketer & SEO Expert',
  city: 'Choutuppal',
  avatarUrl: null as string | null,
  coverImageUrl: null as string | null,
  isVerified: true,
  bio: 'Helping local businesses grow their online presence. 5+ years of experience in digital marketing, SEO, and social media management.',
  followersCount: 2450,
  followingCount: 180,
  postsCount: 67,
  skills: ['SEO', 'Social Media', 'Google Ads', 'Content Marketing', 'Web Design'],
  services: [
    { id: '1', title: 'SEO Optimization', description: 'Rank your business on Google first page', price: '4,999', icon: 'Search' },
    { id: '2', title: 'Social Media Management', description: 'Complete social media handling', price: '7,999', icon: 'Share2' },
    { id: '3', title: 'Google Ads Campaign', description: 'Targeted ad campaigns for local businesses', price: '3,499', icon: 'Target' },
    { id: '4', title: 'Website Design', description: 'Modern responsive websites', price: '9,999', icon: 'Globe' },
  ],
  reviews: [
    { id: '1', name: 'Suresh Reddy', rating: 5, text: 'Excellent work on our website SEO. Results were visible within 2 months!', time: '2 weeks ago' },
    { id: '2', name: 'Lakshmi Devi', rating: 4, text: 'Good social media management. Very professional approach.', time: '1 month ago' },
    { id: '3', name: 'Venkat Rao', rating: 5, text: 'Helped my tailoring shop get online orders. Amazing results!', time: '2 months ago' },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function getServiceIcon(iconName: string) {
  const map: Record<string, React.ElementType> = {
    Search,
    Share2,
    Target,
    Globe,
    Briefcase,
    User,
    Phone,
    Award,
  }
  return map[iconName] ?? Briefcase
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
    </div>
  )
}

// ─── Experience Timeline ──────────────────────────────────────────────────────

const timelineItems = [
  { year: '2024 – Present', role: 'Senior SEO Consultant', company: 'Freelance' },
  { year: '2022 – 2024', role: 'Digital Marketing Lead', company: 'LocalBiz Solutions' },
  { year: '2019 – 2022', role: 'SEO Specialist', company: 'WebRank Pro' },
]

// ─── Gallery Placeholders ─────────────────────────────────────────────────────

const galleryColors = [
  'from-[#4169E1] to-[#6B8DD6]',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IndividualProfilePage({ profileData }: IndividualProfilePageProps) {
  const data = profileData ?? placeholderProfile

  // Store & Auth
  const navigateTo = useAppStore((s) => s.navigateTo)
  const { isAuthenticated } = useAuth()

  // Local state
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'gallery' | 'reviews'>('about')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({
    about: null,
    services: null,
    gallery: null,
    reviews: null,
  })

  // ─── Scroll listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ─── Tab indicator position ───────────────────────────────────────────────
  useEffect(() => {
    const currentRef = tabRefs.current[activeTab]
    if (currentRef) {
      setTabIndicator({
        left: currentRef.offsetLeft,
        width: currentRef.offsetWidth,
      })
    }
  }, [activeTab])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFollow = useCallback(() => {
    if (!isAuthenticated) {
      toast.error('Please login to follow')
      return
    }
    setIsFollowing((prev) => !prev)
    toast.success(isFollowing ? 'Unfollowed' : 'Following!')
  }, [isAuthenticated, isFollowing])

  const handleMessage = useCallback(() => {
    toast.success('Opening WhatsApp chat...')
  }, [])

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${data.fullName} — Profile`,
        text: `Check out ${data.fullName}'s profile on our platform!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied!')
    }
  }, [data.fullName])

  const handleBack = useCallback(() => {
    navigateTo('community')
  }, [navigateTo])

  // ─── Derived ──────────────────────────────────────────────────────────────
  const averageRating =
    data.reviews.length > 0
      ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
      : 0

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* ─── Sticky Header ──────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled ? 'shadow-sm' : 'border-transparent'
        }`}
      >
        {/* Back row (always visible, higher when not scrolled) */}
        <div className="flex items-center px-4 pt-3 pb-1">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>

          {/* Collapsed header info — only shows when scrolled */}
          <div
            className={`flex items-center gap-3 ml-3 transition-all duration-300 overflow-hidden ${
              isScrolled ? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'
            }`}
          >
            {/* Mini avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4169E1] to-[#6B8DD6] flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm shrink-0">
              {data.avatarUrl ? (
                <img
                  src={data.avatarUrl}
                  alt={data.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(data.fullName)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-gray-900 truncate">{data.fullName}</h2>
                {data.isVerified && (
                  <ShieldCheck size={14} className="text-[#4169E1] shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">{data.profession}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Cover Photo ────────────────────────────────────────────────── */}
      <div
        className={`relative w-full transition-all duration-300 ${
          isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-40 md:h-52 opacity-100'
        }`}
      >
        {data.coverImageUrl ? (
          <img
            src={data.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#4169E1] via-[#6B8DD6] to-[#4169E1]" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
      </div>

      {/* ─── Profile Info Section ───────────────────────────────────────── */}
      <div className="relative max-w-2xl mx-auto px-4">
        {/* Avatar */}
        <div
          className={`relative z-10 transition-all duration-300 ${
            isScrolled ? '-mt-0 opacity-0 h-0 overflow-hidden' : '-mt-12 opacity-100'
          }`}
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#4169E1] to-[#6B8DD6] flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white shadow-lg">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(data.fullName)
            )}
            {/* Verified badge */}
            {data.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                <ShieldCheck size={20} className="text-[#4169E1]" />
              </span>
            )}
          </div>
        </div>

        {/* Name, profession, city, stats — hide when scrolled (shown in header) */}
        <div
          className={`transition-all duration-300 ${
            isScrolled ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[500px]'
          }`}
        >
          <div className="mt-3">
            {/* Name */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{data.fullName}</h1>
              {data.isVerified && (
                <ShieldCheck size={20} className="text-[#4169E1] shrink-0" />
              )}
            </div>

            {/* Profession */}
            <p className="text-sm text-gray-500 mt-0.5">{data.profession}</p>

            {/* City */}
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">{data.city}</span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">{formatCount(data.postsCount)}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">{formatCount(data.followersCount)}</div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">{formatCount(data.followingCount)}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>
          </div>

          {/* ─── Action Buttons ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mt-5">
            {/* Follow / Following */}
            <Button
              onClick={handleFollow}
              className={`rounded-full px-6 py-2.5 font-semibold text-sm transition-all duration-300 active:scale-95 ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 shadow-none'
                  : 'bg-gradient-to-r from-[#4169E1] to-[#6B8DD6] text-white hover:shadow-lg shadow-md'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>

            {/* Message (WhatsApp) */}
            <Button
              variant="outline"
              onClick={handleMessage}
              className="rounded-full px-4 py-2.5 text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400 transition-all duration-200 active:scale-95"
            >
              <MessageCircle size={16} className="text-green-600" />
              <span className="hidden sm:inline text-sm">Message</span>
            </Button>

            {/* Share */}
            <Button
              variant="outline"
              onClick={handleShare}
              className="rounded-full px-4 py-2.5 hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline text-sm">Share</span>
            </Button>
          </div>
        </div>

        {/* ─── Content Tabs ──────────────────────────────────────────────── */}
        <div className="mt-6">
          {/* Tab bar */}
          <div className="relative border-b border-gray-200">
            <div className="flex items-center gap-1">
              {(['about', 'services', 'gallery', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  ref={(el) => { tabRefs.current[tab] = el }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 capitalize ${
                    activeTab === tab
                      ? 'text-[#4169E1]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sliding underline indicator */}
            <div
              className="absolute bottom-0 h-0.5 bg-[#4169E1] rounded-full transition-all duration-300"
              style={{
                left: `${tabIndicator.left}px`,
                width: `${tabIndicator.width}px`,
              }}
            />
          </div>

          {/* ─── Tab Content ─────────────────────────────────────────────── */}
          <div className="py-5">
            {/* ── About Tab ─────────────────────────────────────────────── */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{data.bio}</p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 hover:bg-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Experience</h3>
                  <div className="relative space-y-0">
                    {timelineItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full shrink-0 ${
                              idx === 0 ? 'bg-[#4169E1] ring-4 ring-blue-100' : 'bg-gray-300'
                            }`}
                          />
                          {idx < timelineItems.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-1 -mt-0.5">
                          <p className="text-sm font-medium text-gray-900">{item.role}</p>
                          <p className="text-xs text-gray-500">{item.company}</p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            {item.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Services Tab ────────────────────────────────────────────── */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.services.map((service) => {
                  const IconComponent = getServiceIcon(service.icon)
                  return (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl overflow-hidden p-4 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-all duration-300">
                          <IconComponent size={18} className="text-[#4169E1]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {service.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#4169E1]">
                          Starting ₹{service.price}
                        </span>
                        <Button
                          size="sm"
                          className="rounded-full bg-gradient-to-r from-[#4169E1] to-[#6B8DD6] text-white text-xs px-3 py-1 h-7 hover:shadow-md transition-all duration-200 active:scale-95"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Gallery Tab ─────────────────────────────────────────────── */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                {galleryColors.map((gradient, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square group cursor-pointer overflow-hidden ${
                      idx === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <div
                      className={`w-full h-full bg-gradient-to-br ${gradient} transition-all duration-500 group-hover:scale-105`}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <Eye
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Reviews Tab ─────────────────────────────────────────────── */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Overall rating */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                      </div>
                      <StarRating rating={Math.round(averageRating)} size={14} />
                      <p className="text-xs text-gray-400 mt-1">
                        {data.reviews.length} review{data.reviews.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {/* Rating bars */}
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = data.reviews.filter((r) => r.rating === star).length
                        const pct = data.reviews.length > 0 ? (count / data.reviews.length) * 100 : 0
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-500">{star}</span>
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-5 text-gray-400 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual reviews */}
                <div className="space-y-3">
                  {data.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        {/* Reviewer avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xs shrink-0">
                          {getInitials(review.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {review.name}
                            </h4>
                            <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                              <Clock size={10} />
                              {review.time}
                            </span>
                          </div>
                          <div className="mt-0.5">
                            <StarRating rating={review.rating} size={12} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile safe area */}
      <div className="h-20" />
    </div>
  )
}
