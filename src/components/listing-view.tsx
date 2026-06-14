'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Star, Share2,
  Phone, Eye, MessageCircle, Instagram, Facebook, Youtube, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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
  phoneNumber: string | null
  whatsappNumber: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  operatingHours: string | null
  user: {
    id: string
    fullName: string
    phone: string
    whatsappNumber: string | null
  }
}

const PLACEHOLDER_COVER = 'https://placehold.co/800x400/D4AF37/ffffff?text=No+Cover'
const PLACEHOLDER_LOGO = 'https://placehold.co/200x200/D4AF37/ffffff?text=Logo'

export default function ListingView() {
  const selectedListingSlug = useAppStore((s) => s.selectedListingSlug)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const { user } = useAuth()
  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchListing = useCallback(async () => {
    if (!selectedListingSlug) return
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${selectedListingSlug}`)
      if (res.ok) {
        const data = await res.json()
        setListing(data)
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

  const handleShareGroup = () => {
    const shareUrl = `${window.location.origin}/listing/${listing?.slug || ''}`
    const text = `Hey group, check out ${listing?.name} on Choutuppal App! ${shareUrl}`
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`)
  }

  const generateVCard = () => {
    if (!listing) return
    const phone = listing.phoneNumber || listing.whatsappNumber || listing.user.phone
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${listing.name}
TEL:${phone}
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

  if (loading) return <ListingDetailSkeleton />
  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-500 text-lg">Listing not found</p>
        <Button onClick={() => navigateTo('explore')} className="bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white font-bold rounded-xl shadow-lg">
          <ArrowLeft className="size-4 mr-2" /> Back to Explore
        </Button>
      </div>
    )
  }

  const cleanDescription = listing.description ? (typeof window !== 'undefined' ? DOMPurify.sanitize(listing.description) : listing.description) : ''
  const galleryImages = Array.isArray(listing.gallery) && listing.gallery.length > 0 ? listing.gallery : []
  const phoneToCall = listing.phoneNumber || listing.whatsappNumber || listing.user.phone
  const phoneToWA = listing.whatsappNumber || listing.phoneNumber || listing.user.whatsappNumber || listing.user.phone

  return (
    <div className="pb-40 bg-gray-50 min-h-screen text-gray-900">
      {/* Header: Full-width Cover Photo */}
      <div className="relative h-64 sm:h-80 w-full bg-gray-200">
        <OptimizedImage
          src={listing.coverImage || PLACEHOLDER_COVER}
          alt={`${listing.name} cover`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        <motion.div whileTap={{ scale: 0.95 }} className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('explore')} className="bg-white/20 backdrop-blur-md text-white hover:bg-white/40 rounded-full size-10 shadow-sm border border-white/30">
            <ArrowLeft className="size-5" />
          </Button>
        </motion.div>

        {/* Business Logo overlapping */}
        <div className="absolute -bottom-12 left-4 md:left-8 z-20">
          <div className="size-24 md:size-32 rounded-full border-4 border-white bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative">
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
        {/* Profile Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
            {listing.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-[#4169E1] text-white hover:bg-[#3151b0] px-3 py-1 rounded-md text-sm font-medium shadow-sm">
              {listing.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
              <Eye className="size-4" />
              {listing.viewsCount} views
            </div>
          </div>
          {listing.address && (
            <div className="flex items-start gap-2 text-gray-600 mt-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <MapPin className="size-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <span className="text-sm font-medium leading-relaxed">{listing.address}</span>
            </div>
          )}
        </div>

        {/* Social Bar */}
        {(listing.instagramUrl || listing.facebookUrl || listing.youtubeUrl) && (
          <div className="flex items-center gap-3">
            {listing.instagramUrl && (
              <a href={listing.instagramUrl} target="_blank" rel="noreferrer" className="size-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm border border-gray-100 hover:scale-110 transition-transform">
                <Instagram className="size-5" />
              </a>
            )}
            {listing.facebookUrl && (
              <a href={listing.facebookUrl} target="_blank" rel="noreferrer" className="size-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 hover:scale-110 transition-transform">
                <Facebook className="size-5" />
              </a>
            )}
            {listing.youtubeUrl && (
              <a href={listing.youtubeUrl} target="_blank" rel="noreferrer" className="size-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm border border-gray-100 hover:scale-110 transition-transform">
                <Youtube className="size-5" />
              </a>
            )}
          </div>
        )}

        {/* Description Section */}
        {cleanDescription && (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#4169E1] to-[#D4AF37] rounded-full"></div>
              About Us
            </h2>
            <div 
              className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
          </div>
        )}

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-5 md:p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#4169E1] to-[#D4AF37] rounded-full"></div>
              Gallery
            </h2>
            <Carousel className="w-full">
              <CarouselContent className="-ml-2">
                {galleryImages.map((img: string, idx: number) => (
                  <CarouselItem key={idx} className="pl-2 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <OptimizedImage
                        src={img}
                        alt={`${listing.name} gallery ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* Sticky Action Footer (2 Rows) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Top Row: Communication */}
          <div className="flex items-center gap-2 h-14">
            <a
              href={`tel:${phoneToCall}`}
              className="flex-1 h-full flex items-center justify-center gap-2 rounded-xl bg-[#4169E1] hover:bg-[#3151b0] text-white font-bold transition-colors shadow-sm"
            >
              <Phone className="size-5" />
              <span className="text-sm">Call</span>
            </a>
            <a
              href={`https://wa.me/${phoneToWA}?text=Hi%2C%20I%20saw%20your%20business%20on%20Choutuppal%20App`}
              target="_blank" rel="noreferrer"
              className="flex-1 h-full flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white font-bold transition-colors shadow-sm"
            >
              <MessageCircle className="size-5" />
              <span className="text-sm">WhatsApp</span>
            </a>
            {listing.latitude && listing.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`}
                target="_blank" rel="noreferrer"
                className="w-14 h-full flex items-center justify-center rounded-xl bg-[#EA4335] hover:bg-[#C5221F] text-white transition-colors shadow-sm shrink-0"
              >
                <MapPin className="size-5" />
              </a>
            )}
          </div>

          {/* Bottom Row: Smart Sharing */}
          <div className="flex items-center gap-2 h-11">
            <button onClick={handleShareStatus} className="flex-1 h-full flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors">
              <MessageCircle className="size-3.5" />
              Status
            </button>
            <button onClick={handleShareGroup} className="flex-1 h-full flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-200 hover:bg-green-100 transition-colors">
              <MessageCircle className="size-3.5" />
              Group
            </button>
            <button onClick={generateVCard} className="flex-1 h-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors">
              <Download className="size-3.5" />
              Save Contact
            </button>
            <button onClick={handleShare} className="flex-1 h-full flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 text-gray-700 text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-colors">
              <Share2 className="size-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
