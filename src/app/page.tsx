'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

// Layout
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { DesktopSidebar } from '@/components/desktop-sidebar'
import { SosButton } from '@/components/sos-button'
import { Footer } from '@/components/footer'
import { SpinWheel } from '@/components/spin-wheel'
import { LeadCaptureForm } from '@/components/lead-capture-form'
import { VoiceSearchModal } from '@/components/voice-search-modal'

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

function HomeView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-6"
    >
      <HeroSection />
      <StoriesSection />
      <DailySpinSection />
      <SosBanner />
      <BannerAds />
      <CategoriesSection />
      <FeaturedListings />
      <RealEstateSection />
      <NewsSection />
      <TestimonialsSection />
      <PricingSection />
    </motion.div>
  )
}

export default function Home() {
  const { currentView, currentUser, setCurrentUser } = useAppStore()

  // Fetch current user data on mount
  useEffect(() => {
    // Set a demo user for the app to work
    if (!currentUser) {
      setCurrentUser({
        id: 'demo-user-1',
        fullName: 'Guest User',
        role: 'user',
        coinsBalance: 50,
        subscriptionTier: 'free',
      })
    }
  }, [currentUser, setCurrentUser])

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
        return <DashboardView />
      case 'admin':
        return <AdminView />
      case 'search':
        return <SearchView />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <DesktopSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-[72px] xl:ml-[240px] min-h-0">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>
          <Footer />
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <BottomNav />
      
      {/* Floating Components */}
      <SosButton />
      <SpinWheel />
      <LeadCaptureForm />
      <VoiceSearchModal />
      
      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  )
}
