'use client'

import { useState, useEffect, useCallback } from 'react'
import { OptimizedImage } from '@/components/optimized-image'
import { useAppStore } from '@/lib/store'

interface BannerAd {
  id: string
  title: string
  imageUrl: string | null
  shopName: string
  offerText: string | null
  linkUrl: string | null
  isActive: boolean
}

// Fallback ads with gradient backgrounds (no weird stock photos)
const FALLBACK_ADS = [
  {
    id: 'fallback-1',
    title: '🎯 List Your Business — Just ₹99/Day!',
    imageUrl: null,
    shopName: 'Choutuppal Super App',
    offerText: 'ఉచితంగా లిస్ట్ చేయండి!',
    linkUrl: null,
    isActive: true,
  },
  {
    id: 'fallback-2',
    title: '🏠 Premium Real Estate Listings',
    imageUrl: null,
    shopName: 'Choutuppal Premium',
    offerText: '3x ఎక్కువ ఎంక్వైరీలు!',
    linkUrl: null,
    isActive: true,
  },
  {
    id: 'fallback-3',
    title: '📱 Get Your Business Online',
    imageUrl: null,
    shopName: 'Daily Spin Wheel',
    offerText: 'రోజూ కాయిన్స్ గెలుచ్చి!',
    linkUrl: null,
    isActive: true,
  },
]

// Gradient backgrounds for fallback ads (when no image)
const AD_GRADIENTS = [
  'from-[#D4AF37]/30 via-[#4169E1]/10 to-[#D4AF37]/20',
  'from-[#4169E1]/30 via-[#D4AF37]/10 to-[#4169E1]/20',
  'from-[#D4AF37]/20 via-[#4169E1]/20 to-[#D4AF37]/30',
]

export function BannerAds() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const selectedCity = useAppStore((s) => s.selectedCity)
  const [ads, setAds] = useState(FALLBACK_ADS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch real ads from API
  useEffect(() => {
    async function fetchAds() {
      try {
        const url = selectedCity ? `/api/banners?citySlug=${selectedCity}&active=true` : `/api/banners?active=true`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setAds(data)
          }
        }
      } catch {
        // Use fallback
      } finally {
        setLoading(false)
      }
    }
    fetchAds()
  }, [selectedCity])

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
          <div className="w-full max-h-[250px] aspect-[2/1] md:aspect-[3/1] rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    )
  }

  const currentAd = ads[currentIndex]
  const hasImage = currentAd?.imageUrl

  return (
    /* Banner container: z-10 (lower than Stories z-20) */
    <div className="w-full bg-white py-3 relative z-10">
      <div className="relative w-full overflow-hidden px-4">
          <div
            key={currentIndex}
            onClick={() => {
              if (currentAd?.linkUrl) window.open(currentAd.linkUrl, '_blank')
            }}
            className="w-full max-h-[250px] aspect-[2/1] md:aspect-[3/1] rounded-xl overflow-hidden relative shadow-sm cursor-pointer transition-opacity duration-300 border-2 border-transparent"
            style={{
              backgroundClip: 'padding-box, border-box',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4169E1, #D4AF37)'
            }}
          >
            {/* Image or gradient background */}
            {hasImage ? (
              <OptimizedImage
                src={currentAd.imageUrl!}
                alt={currentAd.title || 'Promotion'}
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-r ${AD_GRADIENTS[currentIndex % AD_GRADIENTS.length]} flex items-center justify-center`}>
                {/* Decorative diagonal lines */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(212,175,55,0.3) 10px, rgba(212,175,55,0.3) 11px)',
                }} />
                <div className="relative z-10 text-center px-6">
                  {currentAd?.offerText && (
                    <p className="text-xs sm:text-sm font-bold text-[#D4AF37] mb-1">
                      {currentAd.offerText}
                    </p>
                  )}
                  <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                    {currentAd?.title}
                  </p>
                </div>
              </div>
            )}

            {/* Offer badge */}
            {currentAd?.offerText && (
              <div className="absolute top-2 right-2 bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                {currentAd.offerText}
              </div>
            )}

            {/* Glassmorphism Bottom Bar for Shop Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md p-2 z-10">
              <p className="text-xs font-bold text-gray-900 truncate">
                {currentAd?.shopName || currentAd?.title || 'Choutuppal Super App'}
              </p>
              <p className="text-[10px] text-gray-700 truncate">
                {currentAd?.shopName ? currentAd.title : 'Promoted listing on Choutuppal'}
              </p>
            </div>
          </div>
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
