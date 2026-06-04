'use client'

import { useState, useEffect } from 'react'
import { Phone, MessageCircle, MapPin } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ListingData {
  id: string
  name: string
  category: string
  whatsappNumber: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  user: {
    phone: string
    whatsappNumber: string | null
  }
}

// ─── Category detection ───────────────────────────────────────────────────────
const REAL_ESTATE_KEYWORDS = [
  'real estate',
  'property',
  'properties',
  'real-estate',
  'land',
  'plot',
  'villa',
  'apartment',
  'flat',
  'house',
  'construction',
  'builder',
]

function isRealEstateCategory(category: string): boolean {
  const lower = category.toLowerCase()
  return REAL_ESTATE_KEYWORDS.some((kw) => lower.includes(kw))
}

// ─── WhatsApp message builder ─────────────────────────────────────────────────
function buildWhatsAppMessage(title: string, category: string): string {
  if (isRealEstateCategory(category)) {
    return `Hi, I saw your property listing '${title}' on Mana Cities App. Is it still available? Can you share more details and the exact location?`
  }
  return `Hi, I am interested in your ad '${title}' on Mana Cities App. Is this still available? Please let me know the details and price.`
}

// ─── Google Maps URL builder ──────────────────────────────────────────────────
function buildMapsUrl(lat: number | null, lng: number | null, address: string | null): string | null {
  if (lat !== null && lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }
  return null
}

/**
 * ListingActionBar — Sticky bottom action bar for listing detail pages.
 *
 * Shows 3 buttons: Call, WhatsApp, Location
 * - WhatsApp message is customized based on listing category
 * - Location button opens Google Maps or shows toast if no location
 * - ZERO Framer Motion — uses Tailwind CSS transitions only
 * - Fixed at bottom, safe area aware
 *
 * This component fetches its own listing data from the API using
 * the selectedListingSlug from the store, so it works independently
 * of the main ListingView component.
 */
export function ListingActionBar() {
  const selectedListingSlug = useAppStore((s) => s.selectedListingSlug)
  const [listing, setListing] = useState<ListingData | null>(null)

  // Fetch listing data for phone/whatsapp/location
  useEffect(() => {
    if (!selectedListingSlug) return
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/listings/${selectedListingSlug}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          setListing(data)
        }
      } catch {
        // Silently fail — buttons will be disabled
      }
    }
    load()
    return () => { cancelled = true }
  }, [selectedListingSlug])

  // ─── Derived values ────────────────────────────────────────────────────
  const phone = listing?.user?.phone || ''
  const whatsappNumber = listing?.whatsappNumber || listing?.user?.whatsappNumber || ''
  const title = listing?.name || ''
  const category = listing?.category || ''
  const mapsUrl = buildMapsUrl(
    listing?.latitude ?? null,
    listing?.longitude ?? null,
    listing?.address ?? null
  )
  const hasLocation = mapsUrl !== null

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleCall = () => {
    if (!phone) {
      toast.error('Phone number not available')
      return
    }
    window.open(`tel:${phone}`, '_self')
  }

  const handleWhatsApp = () => {
    if (!whatsappNumber) {
      toast.error('WhatsApp number not available')
      return
    }
    const message = buildWhatsAppMessage(title, category)
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleLocation = () => {
    if (!hasLocation) {
      toast.error('Location not provided by the lister')
      return
    }
    window.open(mapsUrl, '_blank')
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch gap-2 p-3">
        {/* Call Button */}
        <button
          onClick={handleCall}
          disabled={!phone}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-all duration-200 active:scale-95 shadow-sm ${
            phone
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span>Call</span>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsApp}
          disabled={!whatsappNumber}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-all duration-200 active:scale-95 shadow-sm ${
            whatsappNumber
              ? 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp</span>
        </button>

        {/* Location Button */}
        <button
          onClick={handleLocation}
          disabled={!hasLocation}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-all duration-200 active:scale-95 shadow-sm ${
            hasLocation
              ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Location</span>
        </button>
      </div>
    </div>
  )
}
