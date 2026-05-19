'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { GlassCard } from '@/components/glass-card'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { OptimizedImage } from '@/components/optimized-image'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Listing {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  images: string | null
  whatsappNumber: string | null
  address: string | null
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
  _count: {
    reviews: number
    leads: number
  }
}

export function FeaturedListings() {
  const { selectedCity, setSelectedListing, navigateTo } = useAppStore()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [cityId, setCityId] = useState<string | null>(null)

  // Fetch cityId from slug
  useEffect(() => {
    async function fetchCity() {
      try {
        const res = await fetch('/api/cities')
        if (res.ok) {
          const cities = await res.json()
          const cityArr = Array.isArray(cities) ? cities : (cities?.data || [])
          const city = cityArr.find((c: { slug: string; id: string }) => c.slug === selectedCity)
          if (city) setCityId(city.id)
        }
      } catch {
        // ignore
      }
    }
    fetchCity()
  }, [selectedCity])

  // Fetch featured listings
  useEffect(() => {
    async function fetchListings() {
      if (!cityId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/listings?cityId=${cityId}&isFeatured=true&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [cityId])

  const handleCardClick = (slug: string) => {
    setSelectedListing(slug)
    navigateTo('listing')
  }

  const getFirstImage = (images: string | null): string => {
    if (!images) return ''
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : ''
    } catch {
      return ''
    }
  }

  // Placeholder image SVG
  const placeholderImg =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxMDAiIHk9IjY1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRDRBRjM3IiBmb250LXNpemU9IjIwIj7wn5GAPC90ZXh0Pjwvc3ZnPg=='

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-lg font-bold text-gray-800"
        >
          ⭐ Featured Listings
        </motion.h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateTo('explore')}
          className="flex items-center gap-1 text-sm text-[#4169E1] font-medium hover:underline"
        >
          View All <ArrowRight className="size-4" />
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video rounded-t-xl" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <GlassCard className="!p-6 text-center">
          <p className="text-gray-500 text-sm">No featured listings yet. Be the first to list your business!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing, index) => {
            const img = getFirstImage(listing.images)
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCardClick(listing.slug)}
              >
                <GlassCard
                  variant={listing.isPremium ? 'gold' : 'default'}
                  className="!p-0 overflow-hidden cursor-pointer group"
                >
                  {/* Image — aspect-video w-full object-cover rounded-t-xl */}
                  <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                    <OptimizedImage
                      src={img || placeholderImg}
                      alt={listing.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    {/* Category badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-white/80 backdrop-blur-sm text-gray-700 text-[10px] border-0 shadow-sm">
                        {listing.category}
                      </Badge>
                    </div>
                    {/* Premium badge */}
                    {listing.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-[10px] border-0 shadow-sm">
                          👑 Premium
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-1.5">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                      {listing.name}
                    </h3>

                    {listing.address && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="size-3 flex-shrink-0" />
                        <span className="text-[11px] truncate">{listing.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                        <span className="text-xs text-gray-600">
                          {(listing._count?.reviews || 0) > 0 ? `${listing._count?.reviews} reviews` : 'New'}
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp Button */}
                    {listing.whatsappNumber && (
                      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                        <WhatsAppButton
                          whatsappNumber={listing.whatsappNumber}
                          businessName={listing.name}
                          className="!px-3 !py-1.5 !text-[11px] w-full justify-center"
                        />
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
