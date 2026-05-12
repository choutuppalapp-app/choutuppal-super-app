'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/glass-card'
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react'

interface BannerAd {
  id: string
  title: string
  imageUrl: string | null
  linkUrl: string | null
  isActive: boolean
}

const FALLBACK_ADS = [
  {
    id: 'fallback-1',
    title: '🎯 List Your Business — Just ₹99/Day!',
    imageUrl: null,
    linkUrl: null,
    isActive: true,
  },
  {
    id: 'fallback-2',
    title: '🏠 Premium Real Estate Listings — Explore Now!',
    imageUrl: null,
    linkUrl: null,
    isActive: true,
  },
  {
    id: 'fallback-3',
    title: '📢 Advertise With Us — Reach 10,000+ Locals!',
    imageUrl: null,
    linkUrl: null,
    isActive: true,
  },
]

export function BannerAds() {
  const [ads, setAds] = useState<BannerAd[]>(FALLBACK_ADS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch ads
  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          // We don't have a dedicated ads API, so use fallback
          // In a real app, this would be /api/banner-ads
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [])

  // Auto-scroll
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ads.length)
  }, [ads.length])

  useEffect(() => {
    const interval = setInterval(goToNext, 3000)
    return () => clearInterval(interval)
  }, [goToNext])

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
  }

  if (loading) {
    return (
      <section className="px-4 py-3">
        <div className="h-32 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/30 animate-pulse" />
      </section>
    )
  }

  return (
    <section className="px-4 py-3">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard className="!p-0 overflow-hidden">
              <div className="relative h-28 sm:h-32 md:h-36 bg-gradient-to-r from-[#D4AF37]/20 via-[#4169E1]/10 to-[#D4AF37]/20 flex items-center justify-between px-6">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.3) 10px, rgba(212,175,55,0.3) 11px)',
                  }} />
                </div>

                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="size-4 text-[#D4AF37]" />
                    <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                    {ads[currentIndex]?.title}
                  </h3>
                </div>

                {/* Price badge */}
                <div className="relative z-10 flex-shrink-0 ml-4">
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold text-sm shadow-lg">
                    ₹99/Day
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-sm hover:bg-white/80 transition-colors"
          aria-label="Previous ad"
        >
          <ChevronLeft className="size-4 text-gray-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-sm hover:bg-white/80 transition-colors"
          aria-label="Next ad"
        >
          <ChevronRight className="size-4 text-gray-600" />
        </motion.button>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-5 bg-[#D4AF37]'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
