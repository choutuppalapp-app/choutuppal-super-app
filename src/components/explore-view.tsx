'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search, SlidersHorizontal, Star, MapPin, BadgeCheck,
  Phone, ChevronDown, Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GlassCard } from '@/components/glass-card'
import { OptimizedImage } from '@/components/optimized-image'
import { useAppStore } from '@/lib/store'

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

interface City {
  id: string
  name: string
  slug: string
}

const CATEGORIES = [
  'All',
  'Tiffin',
  'Medical',
  'Salon',
  'Plumber',
  'Real Estate',
  'Services',
  'Electronics',
  'Automobile',
  'Tailor',
  'Hardware',
  'Education',
]

const PLACEHOLDER_IMG = 'https://placehold.co/400x250/D4AF37/ffffff?text=Business'

export function ExploreView() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const selectedCity = useAppStore((s) => s.selectedCity)
  const setSelectedListing = useAppStore((s) => s.setSelectedListing)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const setShowLeadForm = useAppStore((s) => s.setShowLeadForm)
  const setLeadFormListingId = useAppStore((s) => s.setLeadFormListingId)
  const [listings, setListings] = useState<Listing[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCityId, setSelectedCityId] = useState('')

  // Fetch cities
  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCities(data)
          if (data.length > 0 && !selectedCityId) {
            const matched = data.find((c: City) => c.slug === selectedCity)
            setSelectedCityId(matched?.id || data[0]?.id || '')
          }
        }
      })
      .catch(() => {})
  }, [selectedCity, selectedCityId])

  // Fetch listings
  const fetchListings = useCallback(
    async (pageNum: number, reset = false) => {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      try {
        const params = new URLSearchParams()
        params.set('page', pageNum.toString())
        params.set('limit', '12')
        if (selectedCityId) params.set('cityId', selectedCityId)
        if (category && category !== 'All') params.set('category', category)
        if (search) params.set('search', search)

        const res = await fetch(`/api/listings?${params}`)
        if (res.ok) {
          const data = await res.json()
          const listingsData = Array.isArray(data?.listings) ? data.listings : []
          const totalPagesNum = data?.pagination?.totalPages || 1
          setListings((prev) => (reset ? listingsData : [...prev, ...listingsData]))
          setTotalPages(totalPagesNum)
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [selectedCityId, category, search]
  )

  useEffect(() => {
    setPage(1)
    fetchListings(1, true)
  }, [fetchListings])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchListings(nextPage)
  }

  const handleCardClick = (slug: string) => {
    setSelectedListing(slug)
    navigateTo('listing')
  }

  const handleGetQuote = (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation()
    setLeadFormListingId(listingId)
    setShowLeadForm(true)
  }

  // Skeleton grid
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden">
          <Skeleton className="w-full aspect-video rounded-t-xl" />
          <div className="p-4 space-y-2 bg-white/40 backdrop-blur-xl">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Search & Filter Bar */}
      <GlassCard className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search businesses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/50 border-white/40 focus:border-[#D4AF37]/50 focus:ring-[#D4AF37]/20"
            />
          </div>
          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[150px] bg-white/50 border-white/40">
                <SlidersHorizontal className="size-4 mr-1 text-gray-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cities.length > 0 && (
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger className="w-[140px] bg-white/50 border-white/40">
                  <MapPin className="size-4 mr-1 text-gray-400" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white shadow-md'
                  : 'bg-white/50 text-gray-600 border border-white/40 hover:bg-white/70'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Explore Businesses
          {!loading && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              {listings.length} found
            </span>
          )}
        </h2>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : listings.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Store className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No businesses found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your filters or search term
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing, idx) => {
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
                    {/* Image — aspect-video w-full object-cover */}
                    <div className="relative aspect-video w-full overflow-hidden">
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
                      {listing.isFeatured && !listing.isPremium && (
                        <Badge className="absolute top-2 right-2 bg-[#4169E1] text-white border-none text-xs">
                          Featured
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
                        {listing._count?.reviews > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="size-3 text-[#D4AF37] fill-[#D4AF37]" />
                            {listing._count?.reviews}
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

          {/* Load More */}
          {page < totalPages && (
            <div className="text-center pt-4">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 px-8"
                >
                  {loadingMore ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="size-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full mr-2"
                    />
                  ) : (
                    <ChevronDown className="size-4 mr-1" />
                  )}
                  Load More
                </Button>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
