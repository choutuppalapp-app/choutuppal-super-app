'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

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

export default function Home() {
  const { currentView } = useAppStore()

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
    <div className={`w-full max-w-7xl mx-auto ${isDetailPage ? 'pb-24 md:pb-8' : 'pb-20 md:pb-8'}`}>
      <div className="px-3 md:px-6 py-3 md:py-6">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}
