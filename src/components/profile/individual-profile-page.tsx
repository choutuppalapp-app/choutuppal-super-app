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
  Phone,
  Heart,
  Clock,
  Award,
  ArrowLeft,
} from 'lucide-react'

// --- Types ---

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
  currentUserId?: string | null
}

// --- Placeholder Data ---

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

// --- Helpers ---

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function getServiceIcon(iconName: string) {
  const map: Record<string, React.ElementType> = {
    Search, Share2, Target, Globe, Briefcase, User, Phone, Award,
  }
  return map[iconName] ?? Briefcase
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

// --- Star Rating ---

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
      ))}
    </div>
  )
}

// --- Main Component ---

export default function IndividualProfilePage({ profileData, currentUserId }: IndividualProfilePageProps) {
  const isRealProfile = !!profileData
  const data = profileData ?? placeholderProfile

  const navigateTo = useAppStore((s) => s.navigateTo)
  const { isAuthenticated } = useAuth()

  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'gallery' | 'reviews'>('about')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [liveFollowersCount, setLiveFollowersCount] = useState(data.followersCount)
  const [isScrolled, setIsScrolled] = useState(false)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({ about: null, services: null, gallery: null, reviews: null })

  useEffect(() => {
    if (!currentUserId || !data.id || currentUserId === data.id) return
    fetch(`/api/social/follows?followerId=${currentUserId}&followingId=${data.id}`)
      .then((res) => res.ok ? res.json() : { following: false })
      .then((json) => setIsFollowing(json.following === true))
      .catch(() => {})
  }, [currentUserId, data.id])

  useEffect(() => { setLiveFollowersCount(data.followersCount) }, [data.followersCount])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const el = tabRefs.current[activeTab]
    if (el) setTabIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [activeTab])

  const handleFollow = useCallback(async () => {
    if (!isAuthenticated) { toast.error('Please login to follow'); return }
    if (!currentUserId || currentUserId === data.id) return
    const willFollow = !isFollowing
    setIsFollowing(willFollow)
    setLiveFollowersCount((c) => willFollow ? c + 1 : Math.max(0, c - 1))
    setFollowLoading(true)
    try {
      const res = await fetch('/api/social/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUserId, followingId: data.id }),
      })
      if (res.ok) {
        const json = await res.json()
        setIsFollowing(json.following)
        toast.success(json.following ? 'Following!' : 'Unfollowed')
      } else {
        setIsFollowing(!willFollow)
        setLiveFollowersCount((c) => willFollow ? Math.max(0, c - 1) : c + 1)
        toast.error('Could not update follow status')
      }
    } catch {
      setIsFollowing(!willFollow)
      setLiveFollowersCount((c) => willFollow ? Math.max(0, c - 1) : c + 1)
    }
    setFollowLoading(false)
  }, [isAuthenticated, isFollowing, currentUserId, data.id])

  const handleMessage = useCallback(() => { toast.success('Opening WhatsApp chat...') }, [])
  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `${data.fullName} - Profile`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Profile link copied!')
    }
  }, [data.fullName])
  const handleBack = useCallback(() => navigateTo('community'), [navigateTo])

  const averageRating = data.reviews.length > 0
    ? data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length : 0
  const displaySkills = isRealProfile ? data.skills : data.skills
  const displayServices = isRealProfile ? data.services : data.services
  const displayReviews = isRealProfile ? data.reviews : data.reviews

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${isScrolled ? 'shadow-sm' : 'border-transparent'}`}>
        <div className="flex items-center px-4 pt-3 pb-1">
          <button onClick={handleBack} className="flex items-center justify-center w-9 h-9 rounded-full bg-white/80 hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-sm" aria-label="Go back">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className={`flex items-center gap-3 ml-3 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-w-[500px] opacity-100' : 'max-w-0 opacity-0'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4169E1] to-[#6B8DD6] flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm shrink-0">
              {data.avatarUrl ? <img src={data.avatarUrl} alt={data.fullName} className="w-full h-full rounded-full object-cover" /> : getInitials(data.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-gray-900 truncate">{data.fullName}</h2>
                {data.isVerified && <ShieldCheck size={14} className="text-[#4169E1] shrink-0" />}
              </div>
              <p className="text-xs text-gray-400 truncate">{data.profession}</p>
            </div>
          </div>
        </div>
      </header>

      <div className={`relative w-full transition-all duration-300 ${isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-40 md:h-52 opacity-100'}`}>
        {data.coverImageUrl ? (
          <img src={data.coverImageUrl} alt="Cover" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#4169E1] via-[#6B8DD6] to-[#4169E1]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4">
        <div className={`relative z-10 transition-all duration-300 ${isScrolled ? '-mt-0 opacity-0 h-0 overflow-hidden' : '-mt-12 opacity-100'}`}>
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#4169E1] to-[#6B8DD6] flex items-center justify-center text-white font-bold text-3xl ring-4 ring-white shadow-lg relative">
            {data.avatarUrl ? <img src={data.avatarUrl} alt={data.fullName} className="w-full h-full rounded-full object-cover" /> : getInitials(data.fullName)}
            {data.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                <ShieldCheck size={20} className="text-[#4169E1]" />
              </span>
            )}
          </div>
        </div>

        <div className={`transition-all duration-300 ${isScrolled ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-[500px]'}`}>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{data.fullName}</h1>
              {data.isVerified && <ShieldCheck size={20} className="text-[#4169E1] shrink-0" />}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{data.profession}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">{data.city}</span>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">{formatCount(data.postsCount)}</div>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">{formatCount(liveFollowersCount)}</div>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">{formatCount(data.followingCount)}</div>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <Button
              onClick={handleFollow}
              disabled={followLoading || !currentUserId || currentUserId === data.id}
              className={`rounded-full px-6 py-2.5 font-semibold text-sm transition-all duration-300 active:scale-95 ${isFollowing ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 shadow-none' : 'bg-gradient-to-r from-[#4169E1] to-[#6B8DD6] text-white hover:shadow-lg shadow-md'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {followLoading ? (
                <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Loading...</span>
              ) : isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" onClick={handleMessage} className="rounded-full px-4 py-2.5 text-green-600 border-green-300 hover:bg-green-50 hover:border-green-400 transition-all duration-200 active:scale-95">
              <MessageCircle size={16} className="text-green-600" />
              <span className="hidden sm:inline text-sm">Message</span>
            </Button>
            <Button variant="outline" onClick={handleShare} className="rounded-full px-4 py-2.5 hover:bg-gray-50 transition-all duration-200 active:scale-95">
              <Share2 size={16} />
              <span className="hidden sm:inline text-sm">Share</span>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative border-b border-gray-200">
            <div className="flex items-center gap-1">
              {(['about', 'services', 'gallery', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  ref={(el) => { tabRefs.current[tab] = el }}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 capitalize ${activeTab === tab ? 'text-[#4169E1]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 h-0.5 bg-[#4169E1] rounded-full transition-all duration-300" style={{ left: `${tabIndicator.left}px`, width: `${tabIndicator.width}px` }} />
          </div>

          <div className="py-5">
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{data.bio || 'No bio available.'}</p>
                </div>
                {displaySkills.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {displaySkills.map((skill) => (
                        <span key={skill} className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 hover:bg-blue-100">{skill}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">No skills listed yet.</div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              displayServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayServices.map((service) => {
                    const IconComponent = getServiceIcon(service.icon)
                    return (
                      <div key={service.id} className="bg-white rounded-2xl overflow-hidden p-4 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-all duration-300">
                            <IconComponent size={18} className="text-[#4169E1]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">{service.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#4169E1]">Starting Rs.{service.price}</span>
                          <Button size="sm" className="rounded-full bg-gradient-to-r from-[#4169E1] to-[#6B8DD6] text-white text-xs px-3 py-1 h-7 hover:shadow-md transition-all duration-200 active:scale-95">Book Now</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No services listed yet.</p>
                </div>
              )
            )}

            {activeTab === 'gallery' && (
              <div className="text-center py-12 text-gray-400">
                <Eye size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No gallery photos yet.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              displayReviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                        <StarRating rating={Math.round(averageRating)} size={14} />
                        <p className="text-xs text-gray-400 mt-1">{displayReviews.length} review{displayReviews.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = displayReviews.filter((r) => r.rating === star).length
                          const pct = displayReviews.length > 0 ? (count / displayReviews.length) * 100 : 0
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-gray-500">{star}</span>
                              <Star size={10} className="fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-5 text-gray-400 text-right">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {displayReviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xs shrink-0">{getInitials(review.name)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">{review.name}</h4>
                              <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1"><Clock size={10} />{review.time}</span>
                            </div>
                            <div className="mt-0.5"><StarRating rating={review.rating} size={12} /></div>
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Star size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No reviews yet.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="h-20" />
    </div>
  )
}
