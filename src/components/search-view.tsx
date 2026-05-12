'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Search, Star, MapPin, BadgeCheck, Phone,
  Store, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/glass-card'
import { OptimizedImage } from '@/components/optimized-image'
import { useAppStore } from '@/lib/store'

interface SearchResult {
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
  city: {
    id: string
    name: string
    slug: string
  }
  _count: {
    reviews: number
    leads: number
  }
}

const PLACEHOLDER_IMG = 'https://placehold.co/400x250/4169E1/ffffff?text=Business'

export function SearchView() {
  const { searchQuery, setSearchQuery, selectedCity, setSelectedListing, navigateTo, setShowLeadForm, setLeadFormListingId } = useAppStore()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [cities, setCities] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [cityId, setCityId] = useState('')

  // Fetch cities
  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCities(data)
          const matched = data.find((c) => c.slug === selectedCity)
          setCityId(matched?.id || '')
        }
      })
      .catch(() => {})
  }, [selectedCity])

  // Search listings
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('search', query)
      params.set('limit', '20')
      if (cityId) params.set('cityId', cityId)

      const res = await fetch(`/api/listings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.listings || [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [cityId])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim()) {
        performSearch(localQuery)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery, performSearch])

  // Trigger initial search if query exists
  useEffect(() => {
    if (searchQuery) {
      setLocalQuery(searchQuery)
      performSearch(searchQuery)
    }
  }, [])

  const handleCardClick = (slug: string) => {
    setSelectedListing(slug)
    navigateTo('listing')
  }

  const handleGetQuote = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation()
    setLeadFormListingId(listingId)
    setShowLeadForm(true)
  }

  const handleClearSearch = () => {
    setLocalQuery('')
    setSearchQuery('')
    setResults([])
  }

  // Skeleton
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <Skeleton className="w-full h-36 rounded-t-2xl" />
          <div className="p-4 space-y-2 bg-white/40 backdrop-blur-xl">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Search bar */}
      <GlassCard className="!p-4">
        <div className="flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo('home')}
              className="shrink-0 hover:bg-white/50"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </motion.div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search businesses, services, categories..."
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value)
                setSearchQuery(e.target.value)
              }}
              autoFocus
              className="pl-10 pr-10 bg-white/50 border-white/40 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20 text-base"
            />
            {localQuery && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="size-4 text-gray-400 hover:text-gray-600" />
              </motion.button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Results info */}
      {localQuery.trim() && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? (
              'Searching...'
            ) : (
              <>
                <span className="font-medium text-gray-700">{results.length}</span> result{results.length !== 1 ? 's' : ''} for &ldquo;
                <span className="font-medium text-[#4169E1]">{localQuery}</span>&rdquo;
              </>
            )}
          </p>
        </div>
      )}

      {/* Results */}
      {!localQuery.trim() ? (
        <GlassCard className="text-center py-16">
          <Search className="size-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">Search Choutuppal</p>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Find businesses, services, restaurants, and more in your city
          </p>
          {/* Popular categories */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['Tiffin', 'Medical', 'Salon', 'Plumber', 'Education', 'Electronics'].map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setLocalQuery(cat)
                  setSearchQuery(cat)
                }}
                className="px-4 py-2 rounded-xl bg-white/50 border border-white/40 text-sm text-gray-600 hover:bg-white/70 transition-colors"
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </GlassCard>
      ) : loading ? (
        <SkeletonGrid />
      ) : results.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Store className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No results found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try a different search term or browse categories
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((listing, idx) => {
            const images = listing.images
              ? (() => {
                  try {
                    const parsed = JSON.parse(listing.images)
                    return Array.isArray(parsed) ? parsed : []
                  } catch {
                    return []
                  }
                })()
              : []
            const coverImg = images[0] || PLACEHOLDER_IMG

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCardClick(listing.slug)}
                className="cursor-pointer"
              >
                <GlassCard
                  variant={listing.isPremium ? 'gold' : 'default'}
                  className="!p-0 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-36 overflow-hidden">
                    <OptimizedImage
                      src={coverImg}
                      alt={listing.name}
                      fill
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {listing.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-[#D4AF37] text-white border-none text-xs">
                        <BadgeCheck className="size-3 mr-0.5" />
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {listing.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs"
                      >
                        {listing.category}
                      </Badge>
                      {listing._count.reviews > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="size-3 text-[#D4AF37] fill-[#D4AF37]" />
                          {listing._count.reviews}
                        </div>
                      )}
                    </div>
                    {listing.address && (
                      <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" />
                        {listing.address}
                      </p>
                    )}
                    <div className="pt-1">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={(e) => handleGetQuote(e, listing.id)}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white text-xs h-8"
                        >
                          <Phone className="size-3 mr-1" />
                          Get Quote
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
