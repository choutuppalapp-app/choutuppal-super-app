'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Star, Share2,
  BadgeCheck, Phone, Eye, MessageCircle,
  Instagram, Facebook, Youtube, Download, Link2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { GlassCard } from '@/components/glass-card'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { OptimizedImage } from '@/components/optimized-image'
import { ListingDetailSkeleton } from '@/components/skeleton-loaders'
import DOMPurify from 'dompurify'

interface ListingData {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  coverImage: string | null
  logoUrl: string | null
  gallery: string[] | null
  instagramUrl: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
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
}

interface ReviewStats {
  total: number
  averageRating: number
}

const PLACEHOLDER_COVER = 'https://placehold.co/800x400/D4AF37/ffffff?text=No+Cover'
const PLACEHOLDER_LOGO = 'https://placehold.co/200x200/D4AF37/ffffff?text=Logo'

export default function ListingView() {
  const selectedListingSlug = useAppStore((s) => s.selectedListingSlug)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const { user } = useAuth()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ total: 0, averageRating: 0 })
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchListing = useCallback(async () => {
    if (!selectedListingSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${selectedListingSlug}`)
      if (res.ok) {
        const data = await res.json()
        setListing(data)

        const reviewRes = await fetch(`/api/reviews?listingId=${data.id}`)
        if (reviewRes.ok) {
          const reviewData = await reviewRes.json()
          setReviewStats(reviewData.stats || { total: 0, averageRating: 0 })
        }

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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/listing/${listing?.slug || ''}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.name || 'Check out this listing',
          text: `Check out ${listing?.name} on Choutuppal App!`,
          url: shareUrl,
        })
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleShareStatus = () => {
    const shareUrl = `${window.location.origin}/listing/${listing?.slug || ''}`
    const text = `Check out ${listing?.name} on Choutuppal App! ${shareUrl}`
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`)
  }

  const generateVCard = () => {
    if (!listing) return
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${listing.name}
TEL:${listing.whatsappNumber || listing.user.phone}
URL:${window.location.origin}/listing/${listing.slug}
END:VCARD`
    const blob = new Blob([vcard], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${listing.name.replace(/\s+/g, '_')}.vcf`
    a.click()
    URL.revokeObjectURL(url)
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
          userId: user?.id || `guest-${Date.now()}`,
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

  if (loading) return <ListingDetailSkeleton />
  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Listing not found</p>
        <Button onClick={() => navigateTo('explore')} className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white">
          <ArrowLeft className="size-4 mr-2" /> Back to Explore
        </Button>
      </div>
    )
  }

  const cleanDescription = listing.description ? (typeof window !== 'undefined' ? DOMPurify.sanitize(listing.description) : listing.description) : ''
  const galleryImages = Array.isArray(listing.gallery) && listing.gallery.length > 0 ? listing.gallery : []

  return (
    <div className="pb-36 md:pb-36 bg-gray-50 min-h-screen">
      {/* Cover Photo Header */}
      <div className="relative h-64 sm:h-80 w-full">
        <OptimizedImage
          src={listing.coverImage || PLACEHOLDER_COVER}
          alt={`${listing.name} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Back button overlay */}
        <motion.div whileTap={{ scale: 0.95 }} className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('explore')} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/40 rounded-full size-10">
            <ArrowLeft className="size-5" />
          </Button>
        </motion.div>

        {/* Premium badge */}
        {listing.isPremium && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-[#D4AF37] text-white border-none shadow-lg gap-1 px-3 py-1">
              <BadgeCheck className="size-3.5" />
              Premium
            </Badge>
          </div>
        )}

        {/* Overlapping Logo */}
        <div className="absolute -bottom-12 left-6">
          <div className="size-24 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative">
            <OptimizedImage
              src={listing.logoUrl || PLACEHOLDER_LOGO}
              alt={`${listing.name} logo`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-16 relative z-10 space-y-6">
        {/* Business Header Info */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-2">
            {listing.name}
            {listing.isPremium && <BadgeCheck className="size-6 text-[#D4AF37]" />}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-[#4169E1]/10 text-[#4169E1] px-3 py-1 text-sm rounded-full">
              {listing.category}
            </Badge>
            {reviewStats.total > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <Star className="size-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-bold text-gray-800">{reviewStats.averageRating}</span>
                <span className="text-sm text-gray-500">({reviewStats.total})</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Eye className="size-4" />
              {listing.viewsCount} views
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(listing.instagramUrl || listing.facebookUrl || listing.youtubeUrl) && (
          <div className="flex items-center gap-3">
            {listing.instagramUrl && (
              <a href={listing.instagramUrl} target="_blank" rel="noreferrer" className="p-2 bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition">
                <Instagram className="size-5" />
              </a>
            )}
            {listing.facebookUrl && (
              <a href={listing.facebookUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition">
                <Facebook className="size-5" />
              </a>
            )}
            {listing.youtubeUrl && (
              <a href={listing.youtubeUrl} target="_blank" rel="noreferrer" className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition">
                <Youtube className="size-5" />
              </a>
            )}
          </div>
        )}

        {/* About Section (HTML) */}
        {cleanDescription && (
          <GlassCard>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">About Us</h2>
            <div 
              className="prose prose-sm max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
            
            <div className="mt-4 space-y-3 pt-3 border-t">
              {listing.address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 rounded-full text-red-500 shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{listing.address}</p>
                  </div>
                </div>
              )}
              {listing.operatingHours && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-500 shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Timing</p>
                    <p className="text-sm text-gray-600">{listing.operatingHours}</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Photo Gallery Carousel */}
        {galleryImages.length > 0 && (
          <GlassCard>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Gallery</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {galleryImages.map((img: string, idx: number) => (
                  <CarouselItem key={idx} className="basis-[80%] md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                        <OptimizedImage
                          src={img}
                          alt={`${listing.name} gallery ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </GlassCard>
        )}

        {/* Reviews Section */}
        <GlassCard>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Reviews</h2>
          {reviewStats.total > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {(listing.reviews || []).map((review) => (
                <div key={review.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-900">{review.user.fullName}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-3.5 ${i < review.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-700 mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No reviews yet. Be the first to review!</p>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MessageCircle className="size-5 text-[#4169E1]" />
              Write a Review
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <Input placeholder="Your Name" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required className="bg-white" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} onClick={() => setReviewRating(i + 1)} className={`size-8 cursor-pointer transition-colors ${i < reviewRating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-200'}`} />
                ))}
              </div>
              <Textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} className="bg-white resize-none" />
              <Button type="submit" disabled={submittingReview || !reviewName} className="w-full bg-[#4169E1] text-white rounded-xl">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        </GlassCard>

        <div className="h-10"></div>
      </div>

      {/* Sticky Action Footer (2-Row Layout) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 flex flex-col gap-2">
        {/* Row 1: Direct Communication */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${listing.whatsappNumber || listing.user.whatsappNumber}?text=Hi%2C%20I%20saw%20your%20business%20on%20Choutuppal%20App`}
            target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
          >
            <MessageCircle className="size-5" />
            WhatsApp
          </a>
          <a
            href={`tel:${listing.whatsappNumber || listing.user.phone}`}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors"
          >
            <Phone className="size-5" />
            Call
          </a>
          {listing.latitude && listing.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`}
              target="_blank" rel="noreferrer"
              className="flex-none flex items-center justify-center p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors aspect-square"
            >
              <MapPin className="size-5" />
            </a>
          )}
        </div>

        {/* Row 2: Smart Share Options */}
        <div className="flex items-center gap-2">
          <button onClick={handleShareStatus} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200">
            <MessageCircle className="size-4" />
            Status
          </button>
          <button onClick={generateVCard} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200">
            <Download className="size-4" />
            Save
          </button>
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors border border-purple-200">
            <Share2 className="size-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}
