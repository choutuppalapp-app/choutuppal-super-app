'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { ErrorBoundary } from '@/components/error-boundary'

// Home sections
import { HeroSection } from '@/components/home/hero-section'
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

// Views
import { ListingView } from '@/components/listing-view'
import { ExploreView } from '@/components/explore-view'
import { NewsView } from '@/components/news-view'
import { DashboardView } from '@/components/dashboard-view'
import { AgentDashboard } from '@/components/agent-dashboard'
import dynamic from 'next/dynamic'
const AdminView = dynamic(() => import('@/components/admin-view').then((mod) => ({ default: mod.AdminView })), { ssr: false })
const SuperAdminSettings = dynamic(() => import('@/components/super-admin-settings').then((mod) => ({ default: mod.SuperAdminSettings })), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="h-80 w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
    </div>
  ),
})
import { SearchView } from '@/components/search-view'
import { BlogView } from '@/components/blog-view'
import { BlogDetailView } from '@/components/blog-detail-view'
const CommunityFeed = dynamic(() => import('@/components/community-feed').then((mod) => ({ default: mod.CommunityFeed })), { ssr: false })
const ProfileView = dynamic(() => import('@/components/profile-view').then((mod) => ({ default: mod.ProfileView })), { ssr: false })
import { LearnView } from '@/components/learn-view'
import { VideoPlayerView } from '@/components/video-player-view'
const ManaShortsFeed = dynamic(() => import('@/components/shorts-feed').then((mod) => ({ default: mod.ManaShortsFeed })), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-50 animate-pulse rounded-xl" />,
})
import { Footer } from '@/components/footer'

// Auth & Polish
import { ForbiddenPage } from '@/components/auth/forbidden-page'
import { ListingDetailSkeleton, DashboardHeaderSkeleton } from '@/components/skeleton-loaders'

/**
 * HomeView — ONLY rendered when currentView === 'home'
 * Completely separate from any other view.
 */
function HomeView() {
  return (
    <div className="space-y-4 md:space-y-8">
      <ErrorBoundary name="StoriesSection"><StoriesSection /></ErrorBoundary>
      <ErrorBoundary name="BannerAds"><BannerAds /></ErrorBoundary>
      <ErrorBoundary name="AnnouncementTicker"><AnnouncementTicker /></ErrorBoundary>
      <ErrorBoundary name="HeroSection"><HeroSection /></ErrorBoundary>
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
 * CityPage — COMPLETE REWRITE of view routing
 *
 * RULES ENFORCED:
 * 1. Use `currentView` from Zustand store as the SOLE source of truth
 * 2. Each view is rendered with a UNIQUE KEY based on currentView
 *    so React completely unmounts the old view and mounts the new one
 * 3. AnimatePresence mode="wait" ensures exit before enter
 * 4. If currentView === 'home', ONLY <HomeView /> is in the DOM
 * 5. If currentView === 'news', ONLY <NewsView /> is in the DOM
 * 6. HomeView is NEVER rendered alongside any other view
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
   * renderView — STRICT one-to-one mapping.
   * Each case returns EXACTLY ONE component with a unique key.
   * The HomeView is ONLY rendered when currentView === 'home'.
   * The previous view is COMPLETELY removed from the DOM.
   */
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><HomeView /></motion.div>
      case 'explore':
        return <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ExploreView"><ExploreView /></ErrorBoundary></motion.div>
      case 'news':
        return <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="NewsView"><NewsView /></ErrorBoundary></motion.div>
      case 'listing':
        return <motion.div key="listing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ListingView"><ListingView /></ErrorBoundary></motion.div>
      case 'dashboard':
        return <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ProtectedDashboard"><ProtectedDashboard /></ErrorBoundary></motion.div>
      case 'admin':
        return <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ProtectedAdmin"><ProtectedAdmin /></ErrorBoundary></motion.div>
      case 'super-admin':
        return <motion.div key="super-admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ProtectedSuperAdmin"><ProtectedSuperAdmin /></ErrorBoundary></motion.div>
      case 'search':
        return <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="SearchView"><SearchView /></ErrorBoundary></motion.div>
      case 'blog':
        return <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="BlogView"><BlogView /></ErrorBoundary></motion.div>
      case 'blog-detail':
        return <motion.div key="blog-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="BlogDetailView"><BlogDetailView /></ErrorBoundary></motion.div>
      case 'community':
        return <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="CommunityFeed"><CommunityFeed /></ErrorBoundary></motion.div>
      case 'profile':
        return <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ProfileView"><ProfileView /></ErrorBoundary></motion.div>
      case 'shorts':
        return <motion.div key="shorts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="ManaShortsFeed"><ManaShortsFeed /></ErrorBoundary></motion.div>
      case 'learn':
        return <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="LearnView"><LearnView /></ErrorBoundary></motion.div>
      case 'video-player':
        return <motion.div key="video-player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><ErrorBoundary name="VideoPlayerView"><VideoPlayerView /></ErrorBoundary></motion.div>
      default:
        return <motion.div key="home-default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}><HomeView /></motion.div>
    }
  }

  // Shorts view: full-screen layout
  if (currentView === 'shorts') {
    return (
      <div className="w-full h-[calc(100dvh-3.5rem)] md:h-screen">
        <ErrorBoundary name="ShortsFullView">
          <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 py-3 md:py-6 pb-20 md:pb-6">
        <ErrorBoundary name="MainContent">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </ErrorBoundary>
      </div>
      <ErrorBoundary name="Footer"><Footer /></ErrorBoundary>
    </div>
  )
}
