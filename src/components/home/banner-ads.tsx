'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BannerAd {
  id: string
  title: string
  imageUrl: string | null
  linkUrl: string | null
  isActive: boolean
}

// Fallback ads with realistic shop data
const FALLBACK_ADS = [
  {
    id: 'fallback-1',
    title: '🎯 List Your Business — Just ₹99/Day!',
    imageUrl: null,
    linkUrl: null,
    isActive: true,
    shopName: 'Choutuppal Super App',
    offerText: 'Reach 10,000+ locals daily — Advertise now!',
  },
  {
    id: 'fallback-2',
    title: '🏠 Premium Real Estate Listings',
    imageUrl: null,
    linkUrl: null,
    isActive: true,
    shopName: 'Royal Properties',
    offerText: '3BHK flats from ₹45L — Limited units!',
  },
  {
    id: 'fallback-3',
    title: '📱 Get Your Business Online',
    imageUrl: null,
    linkUrl: null,
    isActive: true,
    shopName: 'Digital Choutuppal',
    offerText: 'Free listing for first 100 businesses!',
  },
]

// Gradient backgrounds for fallback ads (when no image)
const AD_GRADIENTS = [
  'from-[#D4AF37]/30 via-[#4169E1]/10 to-[#D4AF37]/20',
  'from-[#4169E1]/30 via-[#D4AF37]/10 to-[#4169E1]/20',
  'from-[#D4AF37]/20 via-[#4169E1]/20 to-[#D4AF37]/30',
]

export function BannerAds() {
  const [ads, setAds] = useState(FALLBACK_ADS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch ads
  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          // No dedicated ads API yet — use fallback
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [])

  // Auto-scroll logic (3 seconds interval)
  const adsCount = ads.length
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % adsCount)
  }, [adsCount])

  useEffect(() => {
    const interval = setInterval(goToNext, 3000)
    return () => clearInterval(interval)
  }, [goToNext])

  if (loading) {
    return (
      <div className="w-full bg-white py-3">
        <div className="px-4">
          <div className="w-full aspect-[2/1] rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    )
  }

  const currentAd = ads[currentIndex]
  const hasImage = currentAd?.imageUrl

  return (
    <div className="w-full bg-white py-3">
      <div className="relative w-full overflow-hidden px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full aspect-[2/1] rounded-2xl overflow-hidden relative shadow-sm cursor-pointer"
          >
            {/* Image or gradient background */}
            {hasImage ? (
              <img
                src={currentAd.imageUrl!}
                alt="Promotion"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-r ${AD_GRADIENTS[currentIndex % AD_GRADIENTS.length]} flex items-center justify-center`}>
                {/* Decorative diagonal lines */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.3) 10px, rgba(212,175,55,0.3) 11px)',
                }} />
                <div className="relative z-10 text-center px-6">
                  <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                    {currentAd?.title}
                  </p>
                </div>
              </div>
            )}

            {/* ₹99/Day Badge */}
            <div className="absolute top-2 right-2 bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
              ₹99/Day
            </div>

            {/* Glassmorphism Bottom Bar for Shop Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md p-2">
              <p className="text-xs font-bold text-gray-900 truncate">
                {currentAd?.shopName || currentAd?.title}
              </p>
              <p className="text-[10px] text-gray-700 truncate">
                {currentAd?.offerText || 'Promoted listing on Choutuppal'}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Dot Indicators */}
      <div className="flex justify-center items-center gap-1 mt-2">
        {ads.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-4 bg-[#D4AF37]'
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
