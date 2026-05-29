'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'

// Home sections
import { StoriesSection } from '@/components/home/stories-section'
import { SosBanner } from '@/components/home/sos-banner'
import { BannerAds } from '@/components/home/banner-ads'
import { CategoriesSection } from '@/components/home/categories-section'
import { FeaturedListings } from '@/components/home/featured-listings'
import { RealEstateSection } from '@/components/home/real-estate-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { PricingSection } from '@/components/home/pricing-section'
import { NewsSection } from '@/components/home/news-section'
import { DailySpinSection } from '@/components/home/daily-spin-section'
import { WhatsAppCommunitySection } from '@/components/home/whatsapp-community-section'
import { AnnouncementTicker } from '@/components/home/announcement-ticker'
import { BecomeAdminCta } from '@/components/home/become-admin-cta'

// Views (static imports)
import { ListingView } from '@/components/listing-view'
import { ExploreView } from '@/components/explore-view'
import { NewsView } from '@/components/news-view'
import { DashboardView } from '@/components/dashboard-view'
import { AgentDashboard } from '@/components/agent-dashboard'
import { SearchView } from '@/components/search-view'
import { BlogView } from '@/components/blog-view'
import { BlogDetailView } from '@/components/blog-detail-view'
import { LearnView } from '@/components/learn-view'
import { VideoPlayerView } from '@/components/video-player-view'
import { Footer } from '@/components/footer'

// Auth & Polish
import { ForbiddenPage } from '@/components/auth/forbidden-page'
import { ListingDetailSkeleton, DashboardHeaderSkeleton } from '@/components/skeleton-loaders'

// ─── Dynamic imports (ssr: false) ─────────────────────────────────
// All dynamic imports grouped AFTER all static imports.
// This prevents Turbopack HMR module graph errors.

const DynamicHeroSection = dynamic(
  () => import('@/components/home/hero-section').then((mod) => ({ default: mod.HeroSection })),
  {
    ssr: false,
    loading: () => (
      <div className="relative overflow-hidden max-h-[300px] mt-4 bg-gray-100 animate-pulse rounded-xl" />
    ),
  }
)

const AdminView = dynamic(
  () => import('@/components/admin-view').then((mod) => ({ default: mod.AdminView })),
  { ssr: false }
)

const SuperAdminSettings = dynamic(
  () => import('@/components/super-admin-settings').then((mod) => ({ default: mod.SuperAdminSettings })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
        <div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-80 w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
      </div>
    ),
  }
)

const CommunityFeed = dynamic(
  () => import('@/components/community-feed').then((mod) => ({ default: mod.CommunityFeed })),
  { ssr: false }
)

const ProfileView = dynamic(
  () => import('@/components/profile-view').then((mod) => ({ default: mod.ProfileView })),
  { ssr: false }
)

const ManaShortsFeed = dynamic(
  () => import('@/components/shorts-feed').then((mod) => ({ default: mod.ManaShortsFeed })),
  {
    ssr: false,
    loading: () => <div className="w-full h-[500px] bg-gray-50 animate-pulse rounded-xl" />,
  }
)

/**
 * HomeView — ONLY rendered when currentView === 'home'.
 * When currentView !== 'home', this component DOES NOT EXIST in the DOM.
 * The hero image inside this component CANNOT bleed into other views.
 */
function HomeView() {
  return (
    <div className="space-y-4 md:space-y-8">
      <ErrorBoundary name="StoriesSection"><StoriesSection /></ErrorBoundary>
      <ErrorBoundary name="BannerAds"><BannerAds /></ErrorBoundary>
      <ErrorBoundary name="AnnouncementTicker"><AnnouncementTicker /></ErrorBoundary>
      <ErrorBoundary name="HeroSection"><DynamicHeroSection /></ErrorBoundary>
      <ErrorBoundary name="WhatsAppCommunitySection"><WhatsAppCommunitySection /></ErrorBoundary>
      <ErrorBoundary name="SosBanner"><SosBanner /></ErrorBoundary>
      <ErrorBoundary name="DailySpinSection"><DailySpinSection /></ErrorBoundary>
      <ErrorBoundary name="CategoriesSection"><CategoriesSection /></ErrorBoundary>
      <ErrorBoundary name="FeaturedListings"><FeaturedListings /></ErrorBoundary>
      <ErrorBoundary name="RealEstateSection"><RealEstateSection /></ErrorBoundary>
      <ErrorBoundary name="NewsSection"><NewsSection /></ErrorBoundary>
      <ErrorBoundary name="TestimonialsSection"><TestimonialsSection /></ErrorBoundary>
      <ErrorBoundary name="PricingSection"><PricingSection /></ErrorBoundary>
      <ErrorBoundary name="BecomeAdminCta"><BecomeAdminCta /></ErrorBoundary>
    </div>
  )
}

function ProtectedDashboard() {
  const { isAuthenticated, user, setShowLoginModal, isLoading, login } = useAuth()
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      if (process.env.NODE_ENV === 'development') { login('8888888888', '1234') }
      else { setShowLoginModal(true) }
    }
  }, [isAuthenticated, isLoading, setShowLoginModal, login])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (<div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Please sign in to access your dashboard</p>
          <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm">Sign In</button>
        </div>
      </div>
    )
  }

  if (user?.role === 'agent') return <AgentDashboard />
  return <DashboardView />
}

function ProtectedAdmin() {
  const { isAuthenticated, user, setShowLoginModal, isLoading, login } = useAuth()
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      if (process.env.NODE_ENV === 'development') { login('9999999999', '1234') }
      else { setShowLoginModal(true) }
    }
  }, [isAuthenticated, isLoading, setShowLoginModal, login])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeaderSkeleton />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (<div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Please sign in as admin to access this page</p>
          <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm">Sign In as Admin</button>
        </div>
      </div>
    )
  }

  const isAdminRole = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'city_admin'
  if (!isAdminRole) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="mx-4 mt-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
            <AlertTriangle className="size-4 shrink-0" />
            Dev Mode: Viewing admin panel as non-admin user.
          </div>
          <AdminView />
        </div>
      )
    }
    return <ForbiddenPage />
  }

  return <AdminView />
}

function ProtectedSuperAdmin() {
  const { isAuthenticated, user, setShowLoginModal, isLoading, login } = useAuth()
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      if (process.env.NODE_ENV === 'development') { login('9999999999', '1234') }
      else { setShowLoginModal(true) }
    }
  }, [isAuthenticated, isLoading, setShowLoginModal, login])

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
        <div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-80 w-full rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Please sign in as Super Admin to access this page</p>
          <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm">Sign In as Super Admin</button>
        </div>
      </div>
    )
  }

  const isSuperAdmin = user?.role === 'super_admin'
  if (!isSuperAdmin) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="mx-4 mt-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
            <AlertTriangle className="size-4 shrink-0" />
            Dev Mode: Viewing Super Admin settings as non-super-admin user.
          </div>
          <SuperAdminSettings />
        </div>
      )
    }
    return <ForbiddenPage />
  }

  return <SuperAdminSettings />
}

/**
 * CityPage — BULLETPROOF View Routing
 *
 * ═══════════════════════════════════════════════════════════════
 * CRITICAL RULES ENFORCED:
 *
 * 1. NO AnimatePresence on the main content area.
 *    AnimatePresence keeps old views in the DOM during exit animation,
 *    which causes the HomeView hero image to bleed into other views.
 *    REMOVED ENTIRELY.
 *
 * 2. STRICT conditional rendering via switch statement.
 *    Only ONE view component exists in the DOM at any time.
 *    When currentView === 'news', HomeView returns null and
 *    its hero image is COMPLETELY REMOVED from the DOM.
 *
 * 3. Zero exit animations. The previous view is destroyed instantly.
 *    No fade-out, no slide-out, no delay. Instant swap.
 * ═══════════════════════════════════════════════════════════════
 */
export default function CityPage() {
  const params = useParams()
  const cityName = params.cityName as string
  const {
    currentView, selectedCity, setCity, setAvailableCities,
    currentCity, fetchSiteSettings, fetchPlatformSettings,
  } = useAppStore()

  // Sync URL slug → store on mount and when URL changes
  useEffect(() => {
    if (cityName && cityName !== selectedCity) {
      setCity(cityName, cityName.charAt(0).toUpperCase() + cityName.slice(1))
    }
  }, [cityName, selectedCity, setCity])

  // Fetch cities and settings on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/cities')
        if (res.ok) {
          const data = await res.json()
          const cities = Array.isArray(data) ? data : (data?.data || [])
          setAvailableCities(cities)
          const match = cities.find((c: { slug: string }) => c.slug === cityName)
          if (match) {
            setCity(match.slug, match.name)
          }
        }
      } catch { /* non-critical */ }
    }
    init()
    fetchSiteSettings()
    fetchPlatformSettings()
  }, [cityName, setCity, setAvailableCities, fetchSiteSettings, fetchPlatformSettings])

  // Update document title
  useEffect(() => {
    try {
      const titles: Record<string, string> = {
        home: `${currentCity.brandName || 'Choutuppal'} 2.0 - Your Hyper-Local Super App`,
        explore: 'Explore Businesses',
        news: 'Local News',
        listing: 'Business Listing',
        dashboard: 'My Dashboard',
        admin: 'Admin Panel',
        'super-admin': 'Super Admin Settings',
        search: 'Search',
        blog: 'Blog',
        'blog-detail': 'Blog Article',
        community: 'Community',
        profile: 'Profile',
        shorts: 'Mana Shorts',
        learn: 'Mana Learn',
        'video-player': 'Watch Video',
      }
      document.title = titles[currentView] || titles.home
    } catch { /* non-critical */ }
  }, [currentView, currentCity.brandName])

  /**
   * renderView — STRICT ONE-TO-ONE MAPPING.
   *
   * This is a plain switch statement. NO AnimatePresence.
   * NO exit animations. NO transition delays.
   *
   * When currentView === 'home' → ONLY <HomeView /> in DOM
   * When currentView === 'news' → ONLY <NewsView /> in DOM
   *   → HomeView is COMPLETELY DESTROYED (not hidden, not faded, DESTROYED)
   *   → Hero image does NOT exist in the DOM
   */
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'explore':
        return <ErrorBoundary name="ExploreView"><ExploreView /></ErrorBoundary>
      case 'news':
        return <ErrorBoundary name="NewsView"><NewsView /></ErrorBoundary>
      case 'listing':
        return <ErrorBoundary name="ListingView"><ListingView /></ErrorBoundary>
      case 'dashboard':
        return <ErrorBoundary name="ProtectedDashboard"><ProtectedDashboard /></ErrorBoundary>
      case 'admin':
        return <ErrorBoundary name="ProtectedAdmin"><ProtectedAdmin /></ErrorBoundary>
      case 'super-admin':
        return <ErrorBoundary name="ProtectedSuperAdmin"><ProtectedSuperAdmin /></ErrorBoundary>
      case 'search':
        return <ErrorBoundary name="SearchView"><SearchView /></ErrorBoundary>
      case 'blog':
        return <ErrorBoundary name="BlogView"><BlogView /></ErrorBoundary>
      case 'blog-detail':
        return <ErrorBoundary name="BlogDetailView"><BlogDetailView /></ErrorBoundary>
      case 'community':
        return <ErrorBoundary name="CommunityFeed"><CommunityFeed /></ErrorBoundary>
      case 'profile':
        return <ErrorBoundary name="ProfileView"><ProfileView /></ErrorBoundary>
      case 'shorts':
        return <ErrorBoundary name="ManaShortsFeed"><ManaShortsFeed /></ErrorBoundary>
      case 'learn':
        return <ErrorBoundary name="LearnView"><LearnView /></ErrorBoundary>
      case 'video-player':
        return <ErrorBoundary name="VideoPlayerView"><VideoPlayerView /></ErrorBoundary>
      default:
        return <HomeView />
    }
  }

  // Shorts view: full-screen layout (also NO AnimatePresence)
  if (currentView === 'shorts') {
    return (
      <div className="w-full h-[calc(100dvh-3.5rem)] md:h-screen">
        <ErrorBoundary name="ShortsFullView">
          {renderView()}
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 py-3 md:py-6 pb-20 md:pb-6">
        <ErrorBoundary name="MainContent">
          {renderView()}
        </ErrorBoundary>
      </div>
      <ErrorBoundary name="Footer"><Footer /></ErrorBoundary>
    </div>
  )
}
