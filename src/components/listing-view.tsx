'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Star, Share2,
  Phone, Eye, MessageCircle, Instagram, Facebook, Youtube, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
  services?: string | null
  coverImage: string | null
  logoUrl: string | null
  gallery: string[] | null
  instagramUrl: string | null
  instagramUsername: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  isPremium: boolean
  isFeatured: boolean
  isClaimed: boolean
  viewsCount: number
  rating: number
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Claim logic
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [claimPhone, setClaimPhone] = useState('')
  const [claimSubmitting, setClaimSubmitting] = useState(false)

  const handleClaimSubmit = async () => {
    if (!claimPhone) {
      toast.error('Please enter your phone number.')
      return
    }
    if (!user) {
      toast.error('Please login to claim a business.')
      return
    }
    setClaimSubmitting(true)
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing?.id, phoneNumber: claimPhone, userId: user.id }),
      })
      if (res.ok) {
        toast.success('Claim request submitted successfully! Admin will review shortly.')
        setShowClaimDialog(false)
        setClaimPhone('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit claim.')
      }
    } catch {
      toast.error('Network error.')
    } finally {
      setClaimSubmitting(false)
    }
  }

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

      <div className="max-w-6xl mx-auto px-4 mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-8">
          <div className="space-y-6">
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight flex items-center gap-2">
              {listing.name}
              {listing.isPremium && <Badge className="bg-[#D4AF37] text-white border-none shrink-0 text-xs">Verified</Badge>}
            </h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-[#4169E1]/10 text-[#4169E1] hover:bg-[#4169E1]/20">
                {listing.category}
              </Badge>
              {listing.isClaimed === false && (
                <Badge 
                  onClick={() => setShowClaimDialog(true)}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer animate-pulse"
                >
                  🎯 Claim This Business
                </Badge>
              )}
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100 text-yellow-700">
                <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-bold">{listing.rating || 5.0}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 mt-4 md:mt-0">
            {phoneToCall && (
              <Button onClick={() => window.location.href = `tel:${phoneToCall}`} className="bg-[#4169E1] hover:bg-[#3151b0] text-white">
                <Phone className="size-4 mr-2" /> Call
              </Button>
            )}
            {phoneToWA && (
              <Button onClick={() => window.open(`https://wa.me/${phoneToWA}?text=Hi%2C%20I%20saw%20your%20business%20on%20Choutuppal%20App`)} className="bg-[#25D366] hover:bg-[#1DA851] text-white">
                <MessageCircle className="size-4 mr-2" /> WhatsApp
              </Button>
            )}
            <Button variant="outline" onClick={generateVCard} className="border-gray-200 hover:bg-gray-50">
              <Download className="size-4 mr-2" /> Save
            </Button>
                        <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${listing.latitude ? listing.latitude + ',' + listing.longitude : encodeURIComponent(listing.address || listing.name)}`)} className="border-gray-200 hover:bg-gray-50">
              <MapPin className="size-4 mr-2" /> Location
            </Button>
            <Button variant="outline" onClick={handleShare} className="border-gray-200 hover:bg-gray-50">
              <Share2 className="size-4 mr-2" /> Share
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0 md:hidden text-sm text-gray-500 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-100">
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
              className="prose prose-sm md:prose-base prose-ul:list-disc prose-li:marker:text-[#D4AF37] max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
          </div>
        )}

                {/* Services Section */}
        {listing.services && JSON.parse(listing.services).length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#4169E1] to-[#D4AF37] rounded-full"></div>
              Our Services
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {JSON.parse(listing.services).map((service: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <div className="mt-1 size-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                  <span className="text-sm font-medium">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gallery Section */}
                {/* Services Section */}
        {listing.services && JSON.parse(listing.services).length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#4169E1] to-[#D4AF37] rounded-full"></div>
              Our Services
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {JSON.parse(listing.services).map((service: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <div className="mt-1 size-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                  <span className="text-sm font-medium">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gallery Section */}
        {galleryImages.length > 0 && (          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-5 md:p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#4169E1] to-[#D4AF37] rounded-full"></div>
              Gallery
            </h2>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
              {galleryImages.map((img: string, idx: number) => (
                <div key={idx} onClick={() => setSelectedImage(img)} className="relative aspect-[4/3] min-w-[200px] sm:min-w-[250px] snap-start rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group">
                  <OptimizedImage
                    src={img}
                    alt={`${listing.name} gallery ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instagram Integration Section */}
        {listing.instagramUsername && (
          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-pink-100 p-5 md:p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-pink-200 pb-3">
              <Instagram className="size-6 text-pink-500" />
              Follow Us on Instagram
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-gray-700 mb-4 font-medium text-sm sm:text-base">Check out our latest updates, offers, and gallery on Instagram!</p>
                <a 
                  href={`https://instagram.com/${listing.instagramUsername.replace('@', '')}`}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                  <Instagram className="size-5" />
                  @{listing.instagramUsername.replace('@', '')}
                </a>
              </div>
              <div className="w-full sm:w-1/2 flex justify-center">
                <div 
                  className="w-full max-w-[300px] aspect-[4/3] bg-white rounded-xl shadow-lg p-1 relative overflow-hidden cursor-pointer group"
                  onClick={() => window.open(`https://instagram.com/${listing.instagramUsername?.replace('@', '')}`, '_blank')}
                >
                   <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1">
                      <div className="rounded-lg w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="rounded-lg w-full h-full bg-gradient-to-br from-yellow-200 to-orange-200 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="rounded-lg w-full h-full bg-gradient-to-br from-orange-200 to-pink-200 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="rounded-lg w-full h-full flex items-center justify-center bg-gray-50 border border-pink-100 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-pink-500 font-bold text-sm">View More</span>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] flex items-center justify-center group-hover:backdrop-blur-none transition-all">
                      <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-pink-600 shadow-xl flex items-center gap-2">
                         <Instagram className="size-4" /> Open App
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Related Listings (Dummy) */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-5 md:p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-3">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#4169E1] to-[#D4AF37] rounded-full"></div>
                ఇంకా ఇవి కూడా చూడండి
              </h2>
              <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[160px] border border-gray-100 rounded-xl p-3 shadow-sm snap-start">
                    <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2"></div>
                    <p className="font-bold text-sm truncate">Related Business {i}</p>
                    <p className="text-xs text-gray-500">Category</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-4"></div>
          </div>
          
          <div className="space-y-6 md:mt-0">
            {/* Right Sidebar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hidden md:flex flex-col gap-4 sticky top-20">
              <h3 className="font-bold text-lg mb-2">Contact Business</h3>
              <div className="flex flex-col gap-3">
                {phoneToCall && <Button onClick={() => window.location.href = `tel:${phoneToCall}`} className="w-full bg-[#4169E1] hover:bg-[#3151b0] text-white"><Phone className="size-4 mr-2" /> Call</Button>}
                {phoneToWA && <Button onClick={() => window.open(`https://wa.me/${phoneToWA}`)} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white"><MessageCircle className="size-4 mr-2" /> WhatsApp</Button>}
                <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${listing.latitude ? listing.latitude + ',' + listing.longitude : encodeURIComponent(listing.address || listing.name)}`)} className="w-full"><MapPin className="size-4 mr-2" /> Location</Button>
                <Button variant="outline" onClick={generateVCard} className="w-full"><Download className="size-4 mr-2" /> Save Contact</Button>
                <Button variant="outline" onClick={handleShare} className="w-full"><Share2 className="size-4 mr-2" /> Share</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer: 5-button pill */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] rounded-t-2xl p-3 flex items-center justify-around">
        <button onClick={() => phoneToCall && (window.location.href = `tel:${phoneToCall}`)} className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#4169E1] transition-colors">
          <Phone className="size-5 mb-0.5" />
          <span className="text-[9px] font-semibold">Call</span>
        </button>
        <button onClick={() => phoneToWA && window.open(`https://wa.me/${phoneToWA}`)} className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#25D366] transition-colors">
          <MessageCircle className="size-5 mb-0.5" />
          <span className="text-[9px] font-semibold">WhatsApp</span>
        </button>
        
        {/* Center Gradient Button */}
        <button onClick={handleShare} className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white p-3 rounded-full shadow-lg active:scale-75 transition-transform">
          <Share2 className="size-5" />
        </button>

        <button onClick={generateVCard} className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-500 transition-colors">
          <Download className="size-5 mb-0.5" />
          <span className="text-[9px] font-semibold">Save</span>
        </button>
        <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${listing.latitude ? listing.latitude + ',' + listing.longitude : encodeURIComponent(listing.address || listing.name)}`)} className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-red-500 transition-colors">
          <MapPin className="size-5 mb-0.5" />
          <span className="text-[9px] font-semibold">Location</span>
        </button>
      </div>

            {/* Lightbox Dialog */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="relative w-full max-w-5xl aspect-square md:aspect-video" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Gallery image fullscreen" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
      
      {/* Claim Business Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Claim Your Business</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              Are you the owner of <b>{listing.name}</b>? Please provide your contact number. Our team will verify and transfer ownership to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Your Phone Number</Label>
              <Input 
                id="phone"
                placeholder="e.g. 9876543210" 
                value={claimPhone}
                onChange={(e) => setClaimPhone(e.target.value)}
                className="bg-gray-50"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowClaimDialog(false)}>Cancel</Button>
            <Button 
              className="bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white" 
              onClick={handleClaimSubmit}
              disabled={claimSubmitting}
            >
              {claimSubmitting ? 'Submitting...' : 'Submit Claim Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
