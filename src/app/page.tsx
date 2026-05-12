'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'

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

// Views
import { ListingView } from '@/components/listing-view'
import { ExploreView } from '@/components/explore-view'
import { NewsView } from '@/components/news-view'
import { DashboardView } from '@/components/dashboard-view'
import { AdminView } from '@/components/admin-view'
import { SearchView } from '@/components/search-view'
import { Footer } from '@/components/footer'

// Auth & Polish
import { ForbiddenPage } from '@/components/auth/forbidden-page'
import { ListingDetailSkeleton, DashboardHeaderSkeleton } from '@/components/skeleton-loaders'

function HomeView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 md:space-y-8"
    >
      <StoriesSection />
      <BannerAds />
      <HeroSection />
      <SosBanner />
      <DailySpinSection />
      <CategoriesSection />
      <FeaturedListings />
      <RealEstateSection />
      <NewsSection />
      <TestimonialsSection />
      <PricingSection />
    </motion.div>
  )
}

// Protected Dashboard wrapper
function ProtectedDashboard() {
  const { isAuthenticated, setShowLoginModal, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-500 mb-3">Please sign in to access your dashboard</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  return <DashboardView />
}

// Protected Admin wrapper
function ProtectedAdmin() {
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeaderSkeleton />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-500 mb-3">Please sign in as admin to access this page</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm"
          >
            Sign In as Admin
          </button>
        </motion.div>
      </div>
    )
  }

  // Role check: Only admin can access
  if (user?.role !== 'admin') {
    return <ForbiddenPage />
  }

  return <AdminView />
}

export default function Home() {
  const { currentView } = useAppStore()

  // Update document title based on current view (SEO)
  useEffect(() => {
    const titles: Record<string, string> = {
      home: 'Choutuppal 2.0 - Your Hyper-Local Super App',
      explore: 'Explore Businesses - Choutuppal 2.0',
      news: 'Local News - Choutuppal 2.0',
      listing: 'Business Listing - Choutuppal 2.0',
      dashboard: 'My Dashboard - Choutuppal 2.0',
      admin: 'Admin Panel - Choutuppal 2.0',
      search: 'Search - Choutuppal 2.0',
    }
    document.title = titles[currentView] || titles.home

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      const descriptions: Record<string, string> = {
        home: 'Discover businesses, services, real estate, and local news in Choutuppal.',
        explore: 'Browse all businesses and services in Choutuppal.',
        news: 'Latest local news and updates from Choutuppal.',
        dashboard: 'Manage your listings, coins, and subscriptions.',
        admin: 'Admin dashboard for managing Choutuppal 2.0.',
        search: 'Search for businesses and services in Choutuppal.',
      }
      metaDesc.setAttribute('content', descriptions[currentView] || descriptions.home)
    }
  }, [currentView])

  const isDetailPage = currentView === 'listing'

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'explore':
        return <ExploreView />
      case 'news':
        return <NewsView />
      case 'listing':
        return <ListingView />
      case 'dashboard':
        return <ProtectedDashboard />
      case 'admin':
        return <ProtectedAdmin />
      case 'search':
        return <SearchView />
      default:
        return <HomeView />
    }
  }

  return (
    <div className={`w-full max-w-7xl mx-auto pb-20 md:pb-6`}>
      <div className="px-3 md:px-6 py-3 md:py-6">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}
