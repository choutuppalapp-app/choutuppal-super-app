'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { useAppConfig } from '@/hooks/use-app-config'
import { ErrorBoundary } from '@/components/error-boundary'

// ─── Static imports (lightweight, needed immediately) ───────────────────
import { StoriesSection } from '@/components/home/stories-section'
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
import { FeaturedProfiles } from '@/components/home/featured-profiles'
import { ForbiddenPage } from '@/components/auth/forbidden-page'
import { DashboardHeaderSkeleton } from '@/components/skeleton-loaders'

// ─── Dynamic imports (ssr: false) ──────────────────────────────────────
// ALL view components use DEFAULT exports and simple import() without .then()
// This prevents "Invalid Element Type" errors from fragile .then() patterns.
//
// PATTERN: dynamic(() => import('...'), { ssr: false })

// HeroSection
const DynamicHeroSection = dynamic(
  () => import('@/components/home/hero-section'),
  {
    ssr: false,
    loading: () => (
      <div className="relative overflow-hidden max-h-[300px] mt-4 bg-gray-100 animate-pulse rounded-xl" />
    ),
  }
)

// Views — lazy-loaded to reduce initial compilation memory
const ListingView = dynamic(
  () => import('@/components/listing-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-40 rounded-xl bg-gray-100 animate-pulse" /><div className="h-8 w-3/4 rounded bg-gray-100 animate-pulse" /></div> }
)

const ExploreView = dynamic(
  () => import('@/components/explore-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-20 rounded-xl bg-gray-100 animate-pulse" /><div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}</div></div> }
)

const NewsView = dynamic(
  () => import('@/components/news-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-8 w-1/2 rounded bg-gray-100 animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />)}</div></div> }
)

const DashboardView = dynamic(
  () => import('@/components/dashboard-view'),
  { ssr: false, loading: () => <div className="max-w-5xl mx-auto px-4 py-6 space-y-6"><DashboardHeaderSkeleton /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}</div></div> }
)

const AgentDashboard = dynamic(
  () => import('@/components/agent-dashboard'),
  { ssr: false, loading: () => <div className="max-w-5xl mx-auto px-4 py-6 space-y-6"><DashboardHeaderSkeleton /></div> }
)

const SearchView = dynamic(
  () => import('@/components/search-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-12 rounded-xl bg-gray-100 animate-pulse" /></div> }
)

const BlogView = dynamic(
  () => import('@/components/blog-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-8 w-1/2 rounded bg-gray-100 animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />)}</div></div> }
)

const BlogDetailView = dynamic(
  () => import('@/components/blog-detail-view'),
  { ssr: false, loading: () => <div className="max-w-3xl mx-auto p-6 space-y-4"><div className="h-48 rounded-xl bg-gray-100 animate-pulse" /><div className="h-8 w-3/4 rounded bg-gray-100 animate-pulse" /><div className="h-4 w-full rounded bg-gray-100 animate-pulse" /></div> }
)

const LearnView = dynamic(
  () => import('@/components/learn-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-8 w-1/2 rounded bg-gray-100 animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />)}</div></div> }
)

const VideoPlayerView = dynamic(
  () => import('@/components/video-player-view'),
  { ssr: false, loading: () => <div className="aspect-video w-full bg-gray-100 animate-pulse rounded-xl" /> }
)

const AdminView = dynamic(
  () => import('@/components/admin-view'),
  { ssr: false, loading: () => <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto"><div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" /><div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" /></div> }
)

const SuperAdminSettings = dynamic(
  () => import('@/components/super-admin-settings'),
  { ssr: false, loading: () => <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto"><div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" /><div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" /></div> }
)

const CommunityFeed = dynamic(
  () => import('@/components/community-feed'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-20 rounded-xl bg-gray-100 animate-pulse" />{[1,2].map(i => <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />)}</div> }
)

const ProfileView = dynamic(
  () => import('@/components/profile-view'),
  { ssr: false, loading: () => <div className="p-6 space-y-4"><div className="h-24 rounded-xl bg-gray-100 animate-pulse" /><div className="h-48 rounded-xl bg-gray-100 animate-pulse" /></div> }
)

const ManaShortsFeed = dynamic(
  () => import('@/components/shorts-feed'),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-gray-50 animate-pulse rounded-xl" /> }
)

const IndividualProfilePage = dynamic(
  () => import('@/components/profile/individual-profile-page'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 md:h-52 bg-gray-200" />
        <div className="px-4 -mt-12">
          <div className="w-24 h-24 rounded-full bg-gray-300" />
        </div>
        <div className="px-4 space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    ),
  }
)

const LeaderProfilePage = dynamic(
  () => import('@/components/profile/leader-profile-page'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 md:h-64 bg-gray-200" />
        <div className="px-4 -mt-14">
          <div className="w-28 h-28 rounded-2xl bg-gray-300" />
        </div>
        <div className="px-4 space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-64 bg-gray-100 rounded" />
        </div>
      </div>
    ),
  }
)

const Footer = dynamic(
  () => import('@/components/footer'),
  { ssr: false, loading: () => <div className="h-20 bg-gray-50 animate-pulse" /> }
)

const MaintenancePage = dynamic(
  () => import('@/components/maintenance-page'),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-gray-900 animate-pulse" /> }
)

/**
 * HomeView — ONLY rendered when currentView === 'home'.
 * When currentView !== 'home', this component DOES NOT EXIST in the DOM.
 * The hero image inside this component CANNOT bleed into other views.
 *
 * FEATURE TOGGLES: Each section is conditionally rendered based on useAppConfig().
 * - enableListings → CategoriesSection, FeaturedListings
 * - enableRealEstate → RealEstateSection
 * - enableShorts → ManaShortsFeed (view-level, not here)
 * - enableLeaderProfiles → FeaturedProfiles
 * - enableSpinAndWin → DailySpinSection
 * - enableBlog → NewsSection
 */
function HomeView() {
  const { config } = useAppConfig()

  return (
    <div className="space-y-4 md:space-y-8">
      <ErrorBoundary name="StoriesSection"><StoriesSection /></ErrorBoundary>
      <ErrorBoundary name="BannerAds"><BannerAds /></ErrorBoundary>
      <ErrorBoundary name="AnnouncementTicker"><AnnouncementTicker /></ErrorBoundary>
      <ErrorBoundary name="HeroSection"><DynamicHeroSection /></ErrorBoundary>
      {config.enableLeaderProfiles && (
        <ErrorBoundary name="FeaturedProfiles"><FeaturedProfiles /></ErrorBoundary>
      )}
      <ErrorBoundary name="WhatsAppCommunitySection"><WhatsAppCommunitySection /></ErrorBoundary>
      {config.enableSpinAndWin && (
        <ErrorBoundary name="DailySpinSection"><DailySpinSection /></ErrorBoundary>
      )}
      {config.enableListings && (
        <>
          <ErrorBoundary name="CategoriesSection"><CategoriesSection /></ErrorBoundary>
          <ErrorBoundary name="FeaturedListings"><FeaturedListings /></ErrorBoundary>
        </>
      )}
      {config.enableRealEstate && (
        <ErrorBoundary name="RealEstateSection"><RealEstateSection /></ErrorBoundary>
      )}
      {config.enableBlog && (
        <ErrorBoundary name="NewsSection"><NewsSection /></ErrorBoundary>
      )}
      <ErrorBoundary name="TestimonialsSection"><TestimonialsSection /></ErrorBoundary>
      <ErrorBoundary name="PricingSection"><PricingSection /></ErrorBoundary>
      <ErrorBoundary name="BecomeAdminCta"><BecomeAdminCta /></ErrorBoundary>
    </div>
  )
}

function ProtectedDashboard() {
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

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

  const role = user?.role?.toLowerCase() || '';
  if (role === 'super_admin') return <SuperAdminSettings />
  if (role === 'city_admin' || role === 'admin') return <AdminView />
  if (role === 'agent') return <AgentDashboard />
  return <DashboardView />
}

function ProtectedAdmin() {
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

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

  const role = user?.role?.toLowerCase() || '';
  if (role !== 'super_admin' && role !== 'city_admin' && role !== 'admin') {
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
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()
  const autoLoginAttempted = useRef(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

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

  const role = user?.role?.toLowerCase() || ''
  const isSuperAdmin = role === 'super_admin'
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
 *
 * 4. ALL views are dynamically imported with ssr: false.
 *    This reduces initial compilation memory and prevents OOM crashes.
 *    Each view is lazy-loaded when the user navigates to it.
 * ═══════════════════════════════════════════════════════════════
 */
export default function CityPage() {
  const params = useParams()
  const cityName = params.cityName as string
  // CRITICAL: Use individual selectors, NOT useAppStore() — subscribing to the
  // entire store re-renders on EVERY state change (even unrelated ones)
  const currentView = useAppStore((s) => s.currentView)
  const selectedCity = useAppStore((s) => s.selectedCity)
  const setCity = useAppStore((s) => s.setCity)
  const setAvailableCities = useAppStore((s) => s.setAvailableCities)
  const currentCity = useAppStore((s) => s.currentCity)
  const fetchSiteSettings = useAppStore((s) => s.fetchSiteSettings)
  const fetchPlatformSettings = useAppStore((s) => s.fetchPlatformSettings)

  // Feature toggle config
  const { config, isLoaded: configLoaded } = useAppConfig()
  const { user } = useAuth()

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
        'individual-profile': 'Professional Profile',
        'leader-profile': 'Leader Profile',
        shorts: 'Mana Shorts',
        learn: 'Mana Learn',
        'video-player': 'Watch Video',
      }
      document.title = titles[currentView] || titles.home
    } catch { /* non-critical */ }
  }, [currentView, currentCity.brandName])

  /**
   * renderView — STRICT ONE-TO-ONE MAPPING with FEATURE TOGGLES.
   *
   * This is a plain switch statement. NO AnimatePresence.
   * NO exit animations. NO transition delays.
   *
   * Feature toggles are enforced here:
   * - enableShorts === false → 'shorts' view redirects to HomeView
   * - enableListings === false → 'explore' view redirects to HomeView
   * - enableRealEstate === false → 'explore' with 'Real Estate' query → HomeView
   * - enableBlog === false → 'blog'/'blog-detail'/'news' → HomeView
   * - enableLeaderProfiles === false → 'leader-profile' → HomeView
   */
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'explore':
        // If listings are disabled, don't show explore view
        if (!config.enableListings && !config.enableRealEstate) return <HomeView />
        return <ErrorBoundary name="ExploreView"><ExploreView /></ErrorBoundary>
      case 'news':
        if (!config.enableBlog) return <HomeView />
        return <ErrorBoundary name="NewsView"><NewsView /></ErrorBoundary>
      case 'listing':
        if (!config.enableListings) return <HomeView />
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
        if (!config.enableBlog) return <HomeView />
        return <ErrorBoundary name="BlogView"><BlogView /></ErrorBoundary>
      case 'blog-detail':
        if (!config.enableBlog) return <HomeView />
        return <ErrorBoundary name="BlogDetailView"><BlogDetailView /></ErrorBoundary>
      case 'community':
        return <ErrorBoundary name="CommunityFeed"><CommunityFeed /></ErrorBoundary>
      case 'profile':
        return <ErrorBoundary name="ProfileView"><ProfileView /></ErrorBoundary>
      case 'individual-profile':
        return <ErrorBoundary name="IndividualProfilePage"><IndividualProfilePage /></ErrorBoundary>
      case 'leader-profile':
        if (!config.enableLeaderProfiles) return <HomeView />
        return <ErrorBoundary name="LeaderProfilePage"><LeaderProfilePage /></ErrorBoundary>
      case 'shorts':
        if (!config.enableShorts) return <HomeView />
        return <ErrorBoundary name="ManaShortsFeed"><ManaShortsFeed /></ErrorBoundary>
      case 'learn':
        return <ErrorBoundary name="LearnView"><LearnView /></ErrorBoundary>
      case 'video-player':
        return <ErrorBoundary name="VideoPlayerView"><VideoPlayerView /></ErrorBoundary>
      default:
        return <HomeView />
    }
  }

  // ── Maintenance Mode: Show MaintenancePage to non-Super-Admin users ───
  // Super Admins always bypass maintenance mode.
  // Also bypass if we're on admin/super-admin views (so admin can still manage).
  const isSuperAdmin = user?.role === 'super_admin'
  const isAdminView = currentView === 'admin' || currentView === 'super-admin'
  if (
    configLoaded &&
    config.maintenanceMode &&
    !isSuperAdmin &&
    !isAdminView
  ) {
    return (
      <ErrorBoundary name="MaintenancePage">
        <MaintenancePage />
      </ErrorBoundary>
    )
  }

  // Full-screen views (no container padding, no footer, no max-width)
  const isFullScreenView = currentView === 'shorts' || currentView === 'individual-profile' || currentView === 'leader-profile'

  if (isFullScreenView) {
    return (
      <div className={currentView === 'shorts' ? 'w-full h-[calc(100dvh-3.5rem)] md:h-screen' : 'w-full min-h-screen'}>
        <ErrorBoundary name="FullScreenView">
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
