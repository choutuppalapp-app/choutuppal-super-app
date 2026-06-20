'use client'

import { useEffect, useState } from 'react'
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
  coverImage?: string | null
  logoUrl?: string | null
  whatsappNumber: string | null
  address: string | null
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  rating: number
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
  const selectedCity = useAppStore((s) => s.selectedCity)
  const setSelectedListing = useAppStore((s) => s.setSelectedListing)
  const navigateTo = useAppStore((s) => s.navigateTo)
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
          const apiListings = data.listings || []
          // Use API data only
          setListings(apiListings)
        }
      } catch {
        setListings([])
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

  const getFirstImage = (images: string | null
  coverImage?: string | null
  logoUrl?: string | null): string => {
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

  // Category icon colors for dummy cards
  const categoryColors: Record<string, string> = {
    Tiffin: 'from-orange-400 to-orange-600',
    Medicals: 'from-red-400 to-red-600',
    Salons: 'from-purple-400 to-purple-600',
    Electronics: 'from-indigo-400 to-indigo-600',
    Plumbers: 'from-blue-400 to-blue-600',
    Education: 'from-teal-400 to-teal-600',
    Tailors: 'from-pink-400 to-pink-600',
    Automobiles: 'from-gray-400 to-gray-600',
    Services: 'from-[#4169E1] to-[#6B8DD6]',
    'Real Estate': 'from-[#D4AF37] to-[#FFD700]',
  }

  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">
          ⭐ Featured Listings
        </h2>
        <button
          onClick={() => navigateTo('explore')}
          className="flex items-center gap-1 text-sm text-[#4169E1] font-medium hover:underline active:scale-95 transition-transform"
        >
          View All <ArrowRight className="size-4" />
        </button>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing, index) => {
            const img = listing.coverImage || listing.logoUrl || getFirstImage(listing.images)
            const hasImage = !!img
            const gradientClass = categoryColors[listing.category] || 'from-[#4169E1] to-[#D4AF37]'

            return (
              <div
                key={listing.id}
                onClick={() => handleCardClick(listing.slug)}
                className="transform transition-all duration-200 hover:shadow-lg active:scale-[0.97] cursor-pointer"
              >
                <GlassCard
                  variant={listing.isPremium ? 'gold' : 'default'}
                  className="!p-0 overflow-hidden group"
                >
                  {/* Image or gradient placeholder */}
                  <div className="relative aspect-video w-full bg-gray-100 overflow-hidden">
                    {hasImage ? (
                      <OptimizedImage
                        src={img || placeholderImg}
                        alt={listing.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                        <span className="text-white text-3xl font-bold opacity-50">
                          {listing.name.charAt(0)}
                        </span>
                      </div>
                    )}

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
                    
                    <Badge variant="secondary" className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-[10px] py-0">
                      {listing.category}
                    </Badge>

                    {listing.address && (
                      <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <MapPin className="size-3 flex-shrink-0" />
                        <span className="text-[11px] truncate">{listing.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-1">
                      <Star className="size-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="text-xs font-semibold text-gray-700">
                        {listing.rating || 5.0}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        ({listing._count?.reviews || 0} reviews)
                      </span>
                    </div>

                    {/* WhatsApp Button */}
                    {listing.whatsappNumber && (
                      <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                        <button className="w-full flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 rounded-md transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                          WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
