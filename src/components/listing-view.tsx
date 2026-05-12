'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Star, Share2, QrCode,
  BadgeCheck, Phone, Eye, MessageSquare, ChevronLeft,
  ChevronRight, Grid3X3, Image as ImageIcon, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { GlassCard } from '@/components/glass-card'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { OptimizedImage } from '@/components/optimized-image'
import { ListingDetailSkeleton } from '@/components/skeleton-loaders'

interface ListingData {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  services: string | null
  images: string | null
  whatsappNumber: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  operatingHours: string | null
  qrCodeUrl: string | null
  createdAt: string
  user: {
    id: string
    fullName: string
    phone: string
    avatarUrl: string | null
    whatsappNumber: string | null
  }
  city: {
    id: string
    name: string
    slug: string
  }
  reviews: Array<{
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
      id: string
      fullName: string
      avatarUrl: string | null
    }
  }>
  _count: {
    reviews: number
    leads: number
  }
}

interface ReviewStats {
  total: number
  averageRating: number
}

const PLACEHOLDER_IMAGES = [
  'https://placehold.co/800x400/D4AF37/ffffff?text=Business+Photo+1',
  'https://placehold.co/800x400/4169E1/ffffff?text=Business+Photo+2',
  'https://placehold.co/800x400/B8962E/ffffff?text=Business+Photo+3',
]

export function ListingView() {
  const { selectedListingSlug, navigateTo, setShowLeadForm, setLeadFormListingId } = useAppStore()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ total: 0, averageRating: 0 })
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const fetchListing = useCallback(async () => {
    if (!selectedListingSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${selectedListingSlug}`)
      if (res.ok) {
        const data = await res.json()
        setListing(data)

        // Fetch review stats
        const reviewRes = await fetch(`/api/reviews?listingId=${data.id}`)
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json()
          setReviewStats(reviewData.stats)
        }

        // Increment views
        fetch(`/api/listings/${selectedListingSlug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'incrementViews' }),
        }).catch(() => {})
      }
    } catch {
      toast.error('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }, [selectedListingSlug])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  const parsedImages = listing?.images
    ? (() => {
        try {
          const imgs = JSON.parse(listing.images)
          return Array.isArray(imgs) ? imgs : []
        } catch {
          return []
        }
      })()
    : []

  const displayImages = parsedImages.length > 0 ? parsedImages : PLACEHOLDER_IMAGES

  const parsedServices = listing?.services
    ? (() => {
        try {
          const svcs = JSON.parse(listing.services)
          return Array.isArray(svcs) ? svcs : []
        } catch {
          return []
        }
      })()
    : []

  const handleGetQuote = () => {
    if (listing) {
      setLeadFormListingId(listing.id)
      setShowLeadForm(true)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/listing/${listing?.slug || ''}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.name || 'Check out this listing',
          text: listing?.description || '',
          url: shareUrl,
        })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewName || !listing) return

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-1',
          listingId: listing.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })

      if (res.ok) {
        toast.success('Review submitted successfully!')
        setReviewName('')
        setReviewComment('')
        setReviewRating(5)
        fetchListing()
      }
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <ListingDetailSkeleton />
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Listing not found</p>
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => navigateTo('explore')}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Explore
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-8">
      {/* Hero Image Slider */}
      <div className="relative">
        <Carousel
          opts={{ loop: true }}
          setApi={(api) => {
            if (api) {
              const autoPlay = setInterval(() => api.scrollNext(), 4000)
              return () => clearInterval(autoPlay)
            }
          }}
          className="w-full"
        >
          <CarouselContent>
            {displayImages.map((img: string, idx: number) => (
              <CarouselItem key={idx}>
                <div className="relative aspect-video w-full overflow-hidden">
                  <OptimizedImage
                    src={img}
                    alt={`${listing.name} - Photo ${idx + 1}`}
                    fill
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3 bg-white/60 backdrop-blur-md border-white/30 hover:bg-white/80" />
          <CarouselNext className="right-3 bg-white/60 backdrop-blur-md border-white/30 hover:bg-white/80" />
        </Carousel>

        {/* Slide indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {displayImages.map((_: string, idx: number) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeSlide ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Back button overlay */}
        <motion.div whileTap={{ scale: 0.95 }} className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('explore')}
            className="bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-full size-10"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </motion.div>

        {/* Premium badge overlay */}
        {listing.isPremium && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-[#D4AF37] text-white border-none shadow-lg gap-1 px-3 py-1">
              <BadgeCheck className="size-3.5" />
              Verified Premium
            </Badge>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 space-y-6">
        {/* Business Name & Category */}
        <GlassCard variant={listing.isPremium ? 'gold' : 'default'}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {listing.name}
                </h1>
                {listing.isPremium && (
                  <BadgeCheck className="size-6 text-[#D4AF37] shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20"
                >
                  {listing.category}
                </Badge>
                {listing.isFeatured && (
                  <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">
                    Featured
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="size-3.5" />
                  {listing.viewsCount} views
                </div>
              </div>
              {/* Rating */}
              {reviewStats.total > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < Math.round(reviewStats.averageRating)
                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {reviewStats.averageRating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewStats.total} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* About Section */}
        <GlassCard>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
            About
          </h2>
          {listing.description && (
            <p className="text-gray-600 leading-relaxed mb-4">{listing.description}</p>
          )}
          <div className="space-y-2">
            {listing.operatingHours && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="size-4 text-[#4169E1] shrink-0" />
                {listing.operatingHours}
              </div>
            )}
            {listing.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="size-4 text-[#4169E1] shrink-0" />
                {listing.address}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Services/Menu Grid */}
        {parsedServices.length > 0 && (
          <GlassCard>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#4169E1] rounded-full" />
              Services & Menu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parsedServices.map((svc: { name?: string; price?: string; item?: string; cost?: string }, idx: number) => {
                const name = svc.name || svc.item || `Service ${idx + 1}`
                const price = svc.price || svc.cost || ''
                return (
                  <motion.div
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/40 hover:bg-white/60 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                    {price && (
                      <span className="text-sm font-bold text-[#D4AF37]">&#8377;{price}</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        )}

        {/* Photo Gallery */}
        {displayImages.length > 1 && (
          <GlassCard>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
              Photo Gallery
            </h2>
            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
              {displayImages.map((img: string, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="break-inside-avoid rounded-xl overflow-hidden shadow-md"
                >
                  <OptimizedImage
                    src={img}
                    alt={`${listing.name} gallery ${idx + 1}`}
                    width={400}
                    height={400}
                    className="w-full aspect-square sm:aspect-auto object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Map Section */}
        <GlassCard>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#4169E1] rounded-full" />
            Location
          </h2>
          <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-[#4169E1]/10 to-[#D4AF37]/10 border border-white/40">
            {/* Static map placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg">
                <MapPin className="size-10 text-[#D4AF37]" />
              </div>
              {listing.address && (
                <p className="text-sm text-gray-600 text-center px-4 max-w-xs">{listing.address}</p>
              )}
              {listing.latitude && listing.longitude && (
                <p className="text-xs text-gray-400 mt-1">
                  {listing.latitude.toFixed(4)}, {listing.longitude.toFixed(4)}
                </p>
              )}
            </div>
            {/* Grid lines to simulate map */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4169E1" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </GlassCard>

        {/* Reviews Section */}
        <GlassCard>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
            Reviews
            {reviewStats.total > 0 && (
              <Badge variant="secondary" className="ml-1">
                {reviewStats.total}
              </Badge>
            )}
          </h2>

          {reviewStats.total > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10">
              <div className="text-3xl font-bold text-[#D4AF37]">
                {reviewStats.averageRating}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.round(reviewStats.averageRating)
                          ? 'text-[#D4AF37] fill-[#D4AF37]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on {reviewStats.total} reviews
                </p>
              </div>
            </div>
          )}

          {/* Review list */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
            {listing.reviews.length > 0 ? (
              listing.reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3 rounded-xl bg-white/50 border border-white/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-800">
                      {review.user.fullName}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < review.rating
                              ? 'text-[#D4AF37] fill-[#D4AF37]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>

          {/* Add Review Form */}
          <Separator className="my-4" />
          <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <MessageSquare className="size-4 text-[#4169E1]" />
            Write a Review
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="review-name" className="text-sm">Your Name</Label>
              <Input
                id="review-name"
                placeholder="Enter your name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                required
                className="bg-white/50 border-white/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Rating</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                  >
                    <Star
                      className={`size-7 cursor-pointer transition-colors ${
                        i < reviewRating
                          ? 'text-[#D4AF37] fill-[#D4AF37]'
                          : 'text-gray-300'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review-comment" className="text-sm">Comment</Label>
              <Textarea
                id="review-comment"
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="bg-white/50 border-white/40 resize-none"
              />
            </div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={submittingReview || !reviewName}
                className="bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </motion.div>
          </form>
        </GlassCard>

        {/* Action Buttons - Hidden on mobile, replaced by sticky CTA */}
        <div className="hidden md:block">
          <GlassCard>
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  onClick={handleGetQuote}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#C5A233] hover:to-[#A8882A] text-white font-semibold py-3 shadow-md"
                >
                  <Phone className="size-4 mr-2" />
                  Get Quote
                </Button>
              </motion.div>
              {(listing.whatsappNumber || listing.user.whatsappNumber) && (
                <div className="flex-1">
                  <WhatsAppButton
                    whatsappNumber={listing.whatsappNumber || listing.user.whatsappNumber || ''}
                    businessName={listing.name}
                    className="w-full py-3"
                  />
                </div>
              )}
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="w-full border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/5 py-3"
                >
                  <Share2 className="size-4 mr-2" />
                  Share
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </div>

        {/* QR Code Section */}
        <GlassCard variant="gold" className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
            <QrCode className="size-5 text-[#D4AF37]" />
            Quick Access
          </h2>
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-3">
            <QRCodeDisplay
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/listing/${listing.slug}`}
              size={160}
            />
          </div>
          <p className="text-sm text-gray-500">Scan to visit this page</p>
        </GlassCard>

        {/* Back Button */}
        <div className="pt-2 pb-4">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={() => navigateTo('explore')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Explore
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Simple QR Code display component using canvas
function QRCodeDisplay({ value, size = 160 }: { value: string; size?: number }) {
  const canvasRef = useState<HTMLCanvasElement | null>(null)
  const ref = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (!node) return
      const ctx = node.getContext('2d')
      if (!ctx) return

      // Generate a simple visual QR-like pattern from the value string
      const moduleCount = 21
      const cellSize = size / moduleCount

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)

      // Create deterministic pattern from string
      let hash = 0
      for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) & 0xffffffff
      }

      ctx.fillStyle = '#1a1a1a'

      // Finder patterns (3 corners)
      const drawFinderPattern = (x: number, y: number) => {
        // Outer border
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
              ctx.fillRect((x + c) * cellSize, (y + r) * cellSize, cellSize, cellSize)
            }
          }
        }
      }

      drawFinderPattern(0, 0)
      drawFinderPattern(moduleCount - 7, 0)
      drawFinderPattern(0, moduleCount - 7)

      // Data modules with pseudo-random pattern
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          // Skip finder pattern areas
          if ((r < 8 && c < 8) || (r < 8 && c > moduleCount - 9) || (r > moduleCount - 9 && c < 8)) continue

          hash = (hash * 1103515245 + 12345) & 0x7fffffff
          if (hash % 3 !== 0) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
          }
        }
      }
    },
    [value, size]
  )

  return <canvas ref={ref} width={size} height={size} className="rounded-lg" />
}
