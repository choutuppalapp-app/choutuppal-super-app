'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

// ─── Realistic dummy listings for Explore view ─────────────────────────
const DUMMY_LISTINGS: Listing[] = [
  {
    id: 'ex1',
    slug: 'sri-venkateshwara-tiffin',
    name: 'Sri Venkateshwara Tiffin Center',
    category: 'Tiffin',
    description: 'Best dosa and idli in Choutuppal',
    images: null,
    whatsappNumber: '918790083706',
    address: 'Main Road, Choutuppal',
    isPremium: true,
    isFeatured: true,
    viewsCount: 1240,
    user: { id: 'u1', fullName: 'Venkatesh Goud', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 24, leads: 18 },
  },
  {
    id: 'ex2',
    slug: 'lakshmi-medical-store',
    name: 'Lakshmi Medical & General Store',
    category: 'Medical',
    description: 'Complete pharmacy with 24/7 availability',
    images: null,
    whatsappNumber: '919876543210',
    address: 'Bus Stand Road, Choutuppal',
    isPremium: false,
    isFeatured: true,
    viewsCount: 890,
    user: { id: 'u2', fullName: 'Ramesh Babu', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 15, leads: 10 },
  },
  {
    id: 'ex3',
    slug: 'rajeshwari-salon',
    name: 'Rajeshwari Beauty Salon',
    category: 'Salon',
    description: 'Professional hair cuts, facials, and bridal makeup',
    images: null,
    whatsappNumber: '919123456789',
    address: 'Market Center, Choutuppal',
    isPremium: true,
    isFeatured: true,
    viewsCount: 670,
    user: { id: 'u3', fullName: 'Rajeshwari Devi', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 19, leads: 12 },
  },
  {
    id: 'ex4',
    slug: 'sai-ram-plumbing',
    name: 'Sai Ram Plumbing Works',
    category: 'Plumber',
    description: 'Expert plumbing services',
    images: null,
    whatsappNumber: '918765432109',
    address: 'Colony Area, Choutuppal',
    isPremium: false,
    isFeatured: true,
    viewsCount: 320,
    user: { id: 'u5', fullName: 'Ramu Nayak', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 6, leads: 22 },
  },
  {
    id: 'ex5',
    slug: 'choutuppal-real-estate',
    name: 'Choutuppal Real Estate Agency',
    category: 'Real Estate',
    description: 'Buy, sell, rent properties in Choutuppal area',
    images: null,
    whatsappNumber: '919440123456',
    address: 'NH-65 Road, Choutuppal',
    isPremium: true,
    isFeatured: true,
    viewsCount: 1500,
    user: { id: 'u6', fullName: 'Srinivas Reddy', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 30, leads: 45 },
  },
  {
    id: 'ex6',
    slug: 'patel-electronics',
    name: 'Patel Electronics & Mobiles',
    category: 'Electronics',
    description: 'Mobile phones, laptops, accessories, and repairs',
    images: null,
    whatsappNumber: '919988776655',
    address: 'Market Road, Choutuppal',
    isPremium: false,
    isFeatured: true,
    viewsCount: 540,
    user: { id: 'u4', fullName: 'Suresh Kumar', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 8, leads: 15 },
  },
  {
    id: 'ex7',
    slug: 'auto-care-center',
    name: 'Auto Care Service Center',
    category: 'Automobile',
    description: 'Bike and car servicing, oil change, and general repairs',
    images: null,
    whatsappNumber: '919998887776',
    address: 'Highway Road, Choutuppal',
    isPremium: false,
    isFeatured: true,
    viewsCount: 380,
    user: { id: 'u8', fullName: 'Mohan Reddy', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 7, leads: 20 },
  },
  {
    id: 'ex8',
    slug: 'sri-krishna-tailors',
    name: 'Sri Krishna Tailors & Textiles',
    category: 'Tailor',
    description: 'Custom stitching for men and women',
    images: null,
    whatsappNumber: '919988770055',
    address: 'Old Market, Choutuppal',
    isPremium: false,
    isFeatured: true,
    viewsCount: 450,
    user: { id: 'u7', fullName: 'Krishna Murthy', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 11, leads: 30 },
  },
  {
    id: 'ex9',
    slug: 'rr-hardware',
    name: 'RR Hardware & Paints',
    category: 'Hardware',
    description: 'Building materials, paints, plumbing, and electrical supplies',
    images: null,
    whatsappNumber: '919440112233',
    address: 'Main Road, Choutuppal',
    isPremium: false,
    isFeatured: false,
    viewsCount: 290,
    user: { id: 'u9', fullName: 'Ravi Kumar', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 5, leads: 16 },
  },
  {
    id: 'ex10',
    slug: 'vidya-bharathi-school',
    name: 'Vidya Bharathi High School',
    category: 'Education',
    description: 'Top-rated school — Nursery to 10th, CBSE & State syllabus',
    images: null,
    whatsappNumber: '919440123456',
    address: 'NH-65 Road, Choutuppal',
    isPremium: true,
    isFeatured: true,
    viewsCount: 2100,
    user: { id: 'u6', fullName: 'Principal Sharma', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 32, leads: 45 },
  },
  {
    id: 'ex11',
    slug: 'mana-services',
    name: 'Mana Home Services',
    category: 'Services',
    description: 'AC repair, pest control, cleaning, and home maintenance',
    images: null,
    whatsappNumber: '918765001122',
    address: 'Bus Stand Area, Choutuppal',
    isPremium: false,
    isFeatured: true,
    viewsCount: 610,
    user: { id: 'u10', fullName: 'Sridhar Rao', avatarUrl: null },
    city: { id: '', name: 'Choutuppal', slug: 'choutuppal' },
    _count: { reviews: 14, leads: 35 },
  },
]

export default function ExploreView() {
  const selectedCity = useAppStore((s) => s.selectedCity)
  const storeSearchQuery = useAppStore((s) => s.searchQuery)
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
  const syncAttempted = useRef(false)

  // Sync store's searchQuery to local state on mount
  // When user clicks "Real Estate" in bottom nav, it sets store.searchQuery
  // We need to pick that up here and apply it as a category filter
  useEffect(() => {
    if (syncAttempted.current) return
    syncAttempted.current = true

    if (storeSearchQuery) {
      // Check if the searchQuery matches a category name
      const matchedCategory = CATEGORIES.find(
        (cat) => cat !== 'All' && cat.toLowerCase() === storeSearchQuery.toLowerCase()
      )
      if (matchedCategory) {
        setCategory(matchedCategory)
      } else {
        setSearch(storeSearchQuery)
      }
    }
  }, [storeSearchQuery])

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

          if (reset) {
            // Use API data if available, otherwise fall back to dummy data filtered by category
            if (listingsData.length > 0) {
              setListings(listingsData)
            } else {
              // Filter dummy data by category and search
              const filtered = DUMMY_LISTINGS.filter((l) => {
                const matchesCategory = category === 'All' || l.category === category
                const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase())
                return matchesCategory && matchesSearch
              })
              setListings(filtered)
            }
            setTotalPages(listingsData.length > 0 ? totalPagesNum : 1)
          } else {
            setListings((prev) => [...prev, ...listingsData])
            setTotalPages(totalPagesNum)
          }
        }
      } catch {
        // Fall back to dummy data
        const filtered = DUMMY_LISTINGS.filter((l) => {
          const matchesCategory = category === 'All' || l.category === category
          const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase())
          return matchesCategory && matchesSearch
        })
        setListings(filtered)
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

  // Category icon colors for dummy cards
  const categoryColors: Record<string, string> = {
    Tiffin: 'from-orange-400 to-orange-600',
    Medical: 'from-red-400 to-red-600',
    Salon: 'from-purple-400 to-purple-600',
    Plumber: 'from-blue-400 to-blue-600',
    'Real Estate': 'from-[#D4AF37] to-[#FFD700]',
    Services: 'from-[#4169E1] to-[#6B8DD6]',
    Electronics: 'from-indigo-400 to-indigo-600',
    Automobile: 'from-gray-400 to-gray-600',
    Tailor: 'from-pink-400 to-pink-600',
    Hardware: 'from-amber-400 to-amber-600',
    Education: 'from-teal-400 to-teal-600',
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
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors active:scale-95 ${
                category === cat
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white shadow-md'
                  : 'bg-white/50 text-gray-600 border border-white/40 hover:bg-white/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {category !== 'All' ? `${category} ` : ''}Explore Businesses
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
              const coverImg = images[0] || ''
              const hasImage = !!coverImg
              const gradientClass = categoryColors[listing.category] || 'from-[#4169E1] to-[#D4AF37]'

              return (
                <div
                  key={listing.id}
                  onClick={() => handleCardClick(listing.slug)}
                  className="cursor-pointer transform transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
                >
                  <GlassCard
                    variant={listing.isPremium ? 'gold' : 'default'}
                    className="!p-0 overflow-hidden"
                  >
                    {/* Image or gradient placeholder */}
                    <div className="relative aspect-video w-full overflow-hidden">
                      {hasImage ? (
                        <OptimizedImage
                          src={coverImg}
                          alt={listing.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                          <span className="text-white text-3xl font-bold opacity-40">
                            {listing.name.charAt(0)}
                          </span>
                        </div>
                      )}
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
                        <Button
                          size="sm"
                          onClick={(e) => handleGetQuote(e, listing.id)}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white text-xs h-8 active:scale-95 transition-transform"
                        >
                          <Phone className="size-3 mr-1" />
                          Get Quote
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          {page < totalPages && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 px-8 active:scale-95 transition-transform"
              >
                {loadingMore ? (
                  <div className="size-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full mr-2 animate-spin" />
                ) : (
                  <ChevronDown className="size-4 mr-1" />
                )}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
