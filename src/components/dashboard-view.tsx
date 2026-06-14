'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, Building2, Wallet, Settings, 
  Crown, Coins, Eye, Phone, Plus, Pencil,
  Gift, Zap, Star, MessageCircle, ChevronRight,
  Loader2, X, Image as ImageIcon, MapPin, Search,
  Heart, CreditCard, HelpCircle, LogOut, FileText,
  BadgeDollarSign, ArrowUpRight, Globe, CheckSquare, Square,
  Instagram, Facebook, Youtube, UploadCloud
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyListings } from '@/components/empty-states'
import dynamic from 'next/dynamic'
import { RichTextEditor } from '@/components/rich-text-editor'


// ─── Types ────────────────────────────────────────────────────────
interface UserListing {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  whatsappNumber: string | null
  images: string | null
  coverImage: string | null
  cityId: string
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  leadsCount?: number
  createdAt: string
  city?: { id: string; name: string; slug: string }
}

interface BannerAd {
  id: string
  title: string
  imageUrl: string | null
  shopName: string
  offerText: string | null
  linkUrl: string | null
  cityId: string | null
  isActive: boolean
}

interface CoinTransaction {
  id: string
  amount: number
  reason: string
  createdAt: string
}

interface City {
  id: string
  name: string
  slug: string
}

const CATEGORIES = [
  'Restaurant', 'Hotel', 'Hospital', 'School', 'Gym', 'Salon',
  'Electronics', 'Clothing', 'Grocery', 'Pharmacy', 'Auto Repair',
  'Real Estate', 'Legal', 'Financial', 'IT Services', 'Education',
  'Healthcare', 'Food & Beverage', 'Retail', 'Other',
]

const TAB_ITEMS = [
  { key: 'home', label: 'Home', icon: LayoutDashboard },
  { key: 'business', label: 'Business', icon: Store },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export default function DashboardView() {
  const [activeTab, setActiveTab] = useState('home')
  const { user, logout } = useAuth()
  const currentUser = user ? {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
    coinsBalance: user.coinsBalance,
    subscriptionTier: user.subscriptionTier,
  } : null

  // State
  const [listings, setListings] = useState<UserListing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [banners, setBanners] = useState<BannerAd[]>([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [coinBalance, setCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([])
  const [claimedToday, setClaimedToday] = useState(false)
  const [claimingDaily, setClaimingDaily] = useState(false)
  const [cities, setCities] = useState<City[]>([])

  // Creation State
  const [isCreatingListing, setIsCreatingListing] = useState(false)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [isCreatingBanner, setIsCreatingBanner] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '', category: '', description: '',
    phoneNumber: '', whatsappNumber: '', cityId: '', sameAsPhone: false,
    address: '',
    coverImage: '', logoUrl: '', gallery: [] as string[],
    instagramUrl: '', facebookUrl: '', youtubeUrl: ''
  })
  const [bannerData, setBannerData] = useState({
    title: '', shopName: '', offerText: '', linkUrl: '', imageUrl: '', cityId: ''
  })

  // Data Fetching
  const fetchListings = useCallback(() => {
    if (!currentUser) return
    setLoadingListings(true)
    fetch(`/api/listings?userId=${currentUser.id}&limit=50`)
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoadingListings(false))
  }, [currentUser])

  const fetchBanners = useCallback(() => {
    if (!currentUser) return
    setLoadingBanners(true)
    fetch(`/api/banners?userId=${currentUser.id}&all=true`)
      .then((res) => res.json())
      .then((data) => setBanners(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoadingBanners(false))
  }, [currentUser])

  const fetchCoins = useCallback(() => {
    if (!currentUser) return
    fetch(`/api/coins?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCoinBalance(data.balance ?? 0)
        setCoinTransactions(data.transactions ?? [])
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const hasClaimedToday = (data.transactions ?? []).some(
          (tx: CoinTransaction) => tx.reason === 'Daily login reward' && new Date(tx.createdAt) >= today
        )
        setClaimedToday(hasClaimedToday)
      })
      .catch(() => {})
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      fetchListings()
      fetchBanners()
      fetchCoins()
    }
  }, [currentUser, fetchListings, fetchBanners, fetchCoins])

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Handlers
  const handleDailyClaim = async () => {
    if (!currentUser) return
    setClaimingDaily(true)
    try {
      const res = await fetch('/api/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, action: 'dailyClaim' }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Claimed ${data.amount} coins!`)
        setClaimedToday(true)
        fetchCoins()
      } else {
        toast.error('Already claimed today')
      }
    } catch {
      toast.error('Failed to claim coins')
    } finally {
      setClaimingDaily(false)
    }
  }

      const compressAndUpload = async (file: File, folder: string) => {
    let fileToUpload = file
    if (file.type.startsWith('image/')) {
      try {
        const imageCompression = (await import('browser-image-compression')).default
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true, initialQuality: 0.6 }
        fileToUpload = await imageCompression(file, options)
      } catch (err) {
        console.error('Image compression error:', err)
      }
    }
    
    const uploadData = new FormData()
    uploadData.append('file', fileToUpload)
    uploadData.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', body: uploadData })
    if (!res.ok) throw new Error('Upload failed')
    return await res.json()
  }

  const handleListingFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    toast.info('Compressing image...')
    try {
      const data = await compressAndUpload(files[0], 'choutuppal/listings')
      setFormData(prev => ({ ...prev, coverImage: data.url }))
      toast.success('Cover uploaded successfully')
    } catch {
      toast.error('Failed to upload cover')
    }
    e.target.value = ''
  }

  const handleExtraUpload = async (file: File, type: 'logo' | 'gallery') => {
    toast.info('Compressing image...')
    try {
      const data = await compressAndUpload(file, 'choutuppal/listings')
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logoUrl: data.url }))
      } else {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, data.url] }))
      }
      toast.success('Uploaded successfully')
    } catch {
      toast.error('Upload failed')
    }
  }

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    toast.info('Compressing image...')
    try {
      const data = await compressAndUpload(files[0], 'choutuppal/banners')
      setBannerData({ title: '', shopName: '', offerText: '', linkUrl: '', imageUrl: data.url, cityId: '' })
      setIsCreatingBanner(true)
    } catch {
      toast.error('Failed to upload image')
    }
    e.target.value = ''
  }

  const submitListing = async () => {
    if (!currentUser || !formData.name || !formData.category) return
    console.log('Submitting:', formData)
    setUploading(true)
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cityId: formData.cityId || cities[0]?.id || 'default',
          slug,
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          phoneNumber: formData.phoneNumber || null,
          whatsappNumber: formData.sameAsPhone ? formData.phoneNumber : (formData.whatsappNumber || null),
          address: formData.address || null,
          coverImage: formData.coverImage || null,
          logoUrl: formData.logoUrl || null,
          gallery: formData.gallery.length > 0 ? formData.gallery : null,
          instagramUrl: formData.instagramUrl || null,
          facebookUrl: formData.facebookUrl || null,
          youtubeUrl: formData.youtubeUrl || null,
        }),
      })
      if (res.ok) {
        alert('Listing published successfully!')
        toast.success('Listing created successfully!')
        setIsCreatingListing(false)
        fetchListings()
        setFormData({
          name: '', category: '', description: '', phoneNumber: '', whatsappNumber: '', cityId: '', sameAsPhone: false, address: '',
          coverImage: '', logoUrl: '', gallery: [], instagramUrl: '', facebookUrl: '', youtubeUrl: ''
        })
      } else {
        alert('Failed to publish. Check console.')
        toast.error('Failed to create listing')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to publish. Check console.')
      toast.error('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const submitBanner = async () => {
    if (!currentUser || !bannerData.title) return
    setUploading(true)
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cityId: bannerData.cityId || cities[0]?.id || 'default',
          title: bannerData.title,
          shopName: bannerData.shopName,
          offerText: bannerData.offerText || null,
          linkUrl: bannerData.linkUrl || null,
          imageUrl: bannerData.imageUrl || null,
          isActive: true,
        }),
      })
      if (res.ok) {
        toast.success('Banner created successfully!')
        setIsCreatingBanner(false)
        fetchBanners()
      } else {
        toast.error('Failed to create banner')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted')
        setListings(listings.filter(l => l.id !== id))
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  // --- UI Renders ---
  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4169E1] to-[#D4AF37] p-1 shadow-md">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
            {currentUser?.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-800">{currentUser?.fullName?.[0] || 'U'}</span>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{currentUser?.fullName || 'User'}</h2>
          <p className="text-gray-500 flex items-center text-sm font-medium"><Phone className="w-3 h-3 mr-1"/> {currentUser?.phone}</p>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-[#4169E1] to-[#D4AF37] rounded-2xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-white/80 font-medium mb-1">Total Coins</p>
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8 text-yellow-300" />
              <span className="text-4xl font-black text-white">
                {coinBalance}
              </span>
            </div>
          </div>
          <Button 
            onClick={() => setActiveTab('wallet')}
            className="bg-white text-[#4169E1] hover:bg-gray-100 font-bold rounded-full shadow-md"
          >
            Earn More
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center flex flex-col items-center justify-center space-y-2 hover:shadow-md transition">
          <Store className="w-6 h-6 text-[#4169E1]" />
          <span className="text-2xl font-bold text-gray-900">{listings.length}</span>
          <span className="text-xs text-gray-500 font-medium">Listings</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center flex flex-col items-center justify-center space-y-2 hover:shadow-md transition">
          <Eye className="w-6 h-6 text-[#4169E1]" />
          <span className="text-2xl font-bold text-gray-900">{listings.reduce((acc, l) => acc + l.viewsCount, 0)}</span>
          <span className="text-xs text-gray-500 font-medium">Views</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center flex flex-col items-center justify-center space-y-2 hover:shadow-md transition">
          <BadgeDollarSign className="w-6 h-6 text-[#4169E1]" />
          <span className="text-2xl font-bold text-gray-900">{listings.reduce((acc, l) => acc + (l.leadsCount || 0), 0)}</span>
          <span className="text-xs text-gray-500 font-medium">Leads</span>
        </div>
      </div>
    </div>
  )

  
  const renderBusiness = () => {
    const businessListings = listings.filter(l => l.category !== 'Real Estate');
    const realEstateListings = listings.filter(l => l.category === 'Real Estate');

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        
        {/* Card 1: My Business Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <Store className="w-5 h-5 mr-2 text-[#4169E1]" /> 
              My Listings
            </h3>
            <Button size="sm" onClick={() => setIsPostMenuOpen(true)} className="bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-1" /> Add Listing
            </Button>
          </div>
          <div className="p-4 md:p-6">
            {loadingListings ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : businessListings.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-900 font-bold mb-1">No listings yet</h4>
                <p className="text-gray-500 text-sm">Create your first business listing to reach customers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {businessListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="flex p-4 gap-4">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                        <Image src={listing.images ? JSON.parse(listing.images)[0] : (listing.coverImage || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image')} alt={listing.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-bold text-gray-900 md:text-lg truncate">{listing.name}</h4>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{listing.category} • {listing.city?.name}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className={listing.isApproved ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                            {listing.isApproved ? 'Active' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: My Real Estate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-[#D4AF37]" /> 
              My Real Estate
            </h3>
            <Button size="sm" onClick={() => setIsPostMenuOpen(true)} className="bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-1" /> Add Property
            </Button>
          </div>
          <div className="p-4 md:p-6">
            {loadingListings ? (
              <div className="space-y-4">
                {[1].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : realEstateListings.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-900 font-bold mb-1">No properties listed yet</h4>
                <p className="text-gray-500 text-sm">Sell or rent your real estate properties easily.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {realEstateListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="flex p-4 gap-4">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                        <Image src={listing.images ? JSON.parse(listing.images)[0] : (listing.coverImage || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image')} alt={listing.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-bold text-gray-900 md:text-lg truncate">{listing.name}</h4>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{listing.city?.name}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className={listing.isApproved ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                            {listing.isApproved ? 'Active' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: My Banners */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-600" /> 
              My Banners
            </h3>
            <Button size="sm" onClick={() => setIsPostMenuOpen(true)} className="bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-1" /> Add Banner
            </Button>
          </div>
          <div className="p-4 md:p-6">
            {loadingBanners ? (
              <div className="space-y-4">
                {[1].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-gray-900 font-bold mb-1">No active banners</h4>
                <p className="text-gray-500 text-sm">Promote your business on the home page with a banner ad.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="h-32 relative bg-gray-100">
                      {banner.imageUrl && <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h4 className="font-bold text-white md:text-lg truncate">{banner.title}</h4>
                        {banner.offerText && <p className="text-[#D4AF37] font-bold text-sm">{banner.offerText}</p>}
                      </div>
                    </div>
                    <div className="p-3 bg-white flex justify-between items-center">
                      <Badge className={banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button (FAB) - Hidden on Desktop */}
        <button 
          onClick={() => setIsPostMenuOpen(true)}
          className="fixed bottom-24 right-6 md:hidden w-16 h-16 rounded-full bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white shadow-[0_8px_30px_rgba(65,105,225,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>
    )
  }


  const renderWallet = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Wallet Balance */}
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-yellow-100">
          <Coins className="w-10 h-10 text-[#D4AF37]" />
        </div>
        <p className="text-gray-500 font-medium mb-2">Available Balance</p>
        <h2 className="text-5xl font-black text-gray-900 mb-6">{coinBalance} <span className="text-xl text-gray-400">coins</span></h2>
        
        <Button 
          onClick={handleDailyClaim} 
          disabled={claimedToday || claimingDaily}
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white shadow-md disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500"
        >
          {claimingDaily ? <Loader2 className="w-6 h-6 animate-spin" /> : claimedToday ? 'Claimed Today' : 'Claim Daily Reward'}
        </Button>
      </div>

      {/* Upgrade Packages */}
      <div className="pt-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-[#4169E1]"/> Upgrade Packages</h3>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 relative overflow-hidden group hover:border-[#D4AF37] transition shadow-sm hover:shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl group-hover:bg-[#D4AF37]/20 transition-all"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <Badge className="bg-[#D4AF37]/20 text-[#B8962E] mb-2 hover:bg-[#D4AF37]/30">Most Popular</Badge>
                <h4 className="text-xl font-bold text-gray-900">Pro Business</h4>
                <p className="text-gray-500 text-sm mt-1">Get featured at the top</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#D4AF37]">500</span>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Coins / Month</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-gray-900 hover:bg-black text-white rounded-xl">Upgrade Now</Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden relative border-4 border-white shadow-md">
          {currentUser?.avatarUrl ? (
            <Image src={currentUser.avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
              {currentUser?.fullName?.[0] || 'U'}
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{currentUser?.fullName}</h2>
        <p className="text-gray-500 mb-6">{currentUser?.phone}</p>
        <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl h-12 font-bold shadow-none">
          Edit Profile
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button onClick={() => window.open('https://wa.me/919999999999', '_blank')} className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-green-50 transition text-green-700">
          <div className="flex items-center font-bold">
            <MessageCircle className="w-5 h-5 mr-3" />
            Chat with Admin
          </div>
          <ChevronRight className="w-5 h-5 opacity-50" />
        </button>
        <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition text-gray-700">
          <div className="flex items-center font-bold">
            <FileText className="w-5 h-5 mr-3 text-gray-400" />
            Terms & Conditions
          </div>
          <ChevronRight className="w-5 h-5 opacity-50" />
        </button>
        <button onClick={logout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition text-red-600">
          <div className="flex items-center font-bold">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen [&]:bg-gray-50 [&]:text-gray-900 md:flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-white md:border-r md:border-gray-200 md:shadow-sm md:z-40">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4169E1] to-[#D4AF37]">Choutuppal</h2>
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">Super App</p>
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-gradient-to-r from-[#4169E1]/10 to-[#D4AF37]/10 text-[#4169E1]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#4169E1]' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {user && (
            <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4169E1] to-[#D4AF37] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-gray-900 line-clamp-1">{user.fullName}</span>
                <span className="text-xs text-gray-500">{user.phone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
\n      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
      {/* Top Header */}
      <div className="bg-white px-6 py-4 sticky top-0 z-30 shadow-sm border-b border-gray-100 flex items-center justify-between md:hidden">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm font-medium text-gray-500">Manage your business</p>
        </div>
      </div>

      <div className="p-4 md:p-8 md:pb-12 max-w-lg md:max-w-5xl mx-auto w-full">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'business' && renderBusiness()}
        {activeTab === 'wallet' && renderWallet()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe-bottom z-40 md:hidden">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-[#4169E1]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all ${isActive ? 'bg-gradient-to-r from-[#4169E1]/10 to-[#D4AF37]/10' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#4169E1]' : ''}`} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      
      {/* Post Menu Popup */}
      <AnimatePresence>
        {isPostMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 flex items-end md:items-center justify-center p-4 md:p-0"
            onClick={() => setIsPostMenuOpen(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900">What do you want to post?</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsPostMenuOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => { setIsPostMenuOpen(false); setIsCreatingListing(true); setFormData(prev => ({...prev, category: ''})); }}
                  className="w-full flex items-center p-4 rounded-2xl border border-gray-100 hover:border-[#4169E1] hover:bg-blue-50 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Business Listing</h4>
                    <p className="text-sm text-gray-500">Add your shop, service, or business</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsPostMenuOpen(false); setIsCreatingListing(true); setFormData(prev => ({...prev, category: 'Real Estate'})); }}
                  className="w-full flex items-center p-4 rounded-2xl border border-gray-100 hover:border-[#D4AF37] hover:bg-yellow-50 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-100 text-[#D4AF37] flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Real Estate Property</h4>
                    <p className="text-sm text-gray-500">Sell or rent your property</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsPostMenuOpen(false); setIsCreatingBanner(true); }}
                  className="w-full flex items-center p-4 rounded-2xl border border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Banner Ad</h4>
                    <p className="text-sm text-gray-500">Promote offers on the home page</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Add Listing Full Screen Modal */}
      <AnimatePresence>
        {isCreatingListing && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white md:bg-black/50 flex flex-col md:items-center md:justify-center md:p-6"
          >
            <div className="flex flex-col w-full h-full md:h-auto md:max-h-[90vh] md:max-w-3xl md:bg-white md:rounded-2xl md:shadow-2xl md:overflow-hidden relative">\n            {/* Header */}
            <div className="p-4 pt-safe-top flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => setIsCreatingListing(false)}>
                <X className="w-6 h-6" />
              </Button>
              <span className="text-gray-900 font-black text-lg">New Listing</span>
              <div className="w-10"></div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-32">
              <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
                
                {/* Single Cover Upload */}
                <div className="flex flex-col gap-2">
                  <span className="text-gray-800 font-bold text-sm">Cover Photo *</span>
                  <label className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl h-32 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative">
                    {formData.coverImage ? (
                      <Image src={formData.coverImage} alt="Cover" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-6 h-6 text-[#4169E1]" />
                        <span className="font-bold text-sm">Upload Cover</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleListingFileChange} />
                  </label>
                </div>

                {/* Gallery Upload */}
                <div className="flex flex-col gap-2">
                  <span className="text-gray-800 font-bold text-sm flex justify-between">
                    <span>Gallery Photos (Up to 5)</span>
                    <span className="text-[#4169E1] bg-[#4169E1]/10 px-2 py-0.5 rounded text-xs">{formData.gallery.length}/5</span>
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {formData.gallery.map((img, i) => (
                      <div key={i} className="w-20 h-20 shrink-0 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                        <Image src={img} alt="Gallery" fill className="object-cover" />
                      </div>
                    ))}
                    {formData.gallery.length < 5 && (
                      <label className="w-20 h-20 shrink-0 flex flex-col items-center justify-center gap-1 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-400 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <Plus className="w-6 h-6" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleExtraUpload(e.target.files[0], 'gallery')} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-800 font-bold text-sm">Business Name *</span>
                    <Input placeholder="Enter business name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 focus-visible:ring-[#4169E1]" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-800 font-bold text-sm">Category *</span>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl h-12 px-4 focus:ring-2 focus:ring-[#4169E1] focus:outline-none appearance-none"
                    >
                      <option value="" disabled>Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-800 font-bold text-sm">Phone Number *</span>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <Input placeholder="e.g., 9876543210" type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-[#4169E1]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-800 font-bold text-sm flex items-center justify-between">
                      WhatsApp Number
                      <label className="flex items-center gap-1.5 text-xs text-[#4169E1] font-bold cursor-pointer bg-[#4169E1]/5 px-2 py-1 rounded select-none">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 accent-[#4169E1] rounded border-gray-300"
                          checked={formData.sameAsPhone}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData({
                              ...formData, 
                              sameAsPhone: isChecked, 
                              whatsappNumber: isChecked ? formData.phoneNumber : formData.whatsappNumber
                            });
                          }}
                        />
                        <span>Same as Phone</span>
                      </label>
                    </span>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <Input 
                        placeholder="WhatsApp Number" 
                        type="tel" 
                        value={formData.sameAsPhone ? formData.phoneNumber : formData.whatsappNumber} 
                        onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} 
                        disabled={formData.sameAsPhone}
                        className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-[#25D366] disabled:bg-gray-100 disabled:text-gray-500" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-800 font-bold text-sm">Address / Maps Link</span>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <Input placeholder="Full address or Google Maps link" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-[#4169E1]" />
                    </div>
                  </div>
                </div>

                {/* Rich Text Description */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="text-gray-800 font-bold text-sm">Description</span>
                    <RichTextEditor
                      content={formData.description}
                      onChange={val => setFormData({...formData, description: val})}
                      placeholder="Write a stylish description using bold, italics, bullets..."
                    />
                </div>
                
                {/* Social Links */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <span className="text-gray-800 font-bold text-sm">Social Media (Optional)</span>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-3.5 w-5 h-5 text-pink-500" />
                    <Input placeholder="Instagram Profile URL" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-pink-500" />
                  </div>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-3.5 w-5 h-5 text-blue-600" />
                    <Input placeholder="Facebook Page URL" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-blue-600" />
                  </div>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-3.5 w-5 h-5 text-red-600" />
                    <Input placeholder="YouTube Channel URL" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-red-600" />
                  </div>
                </div>

              </div>
            </div>

            {/* Sticky Submit Button */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe-bottom z-30">
              <Button onClick={submitListing} disabled={uploading || !formData.name || !formData.category} className="w-full max-w-lg mx-auto h-14 text-lg font-extrabold rounded-xl bg-gradient-to-r from-[#4169E1] to-[#D4AF37] text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publish Listing'}
              </Button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Form Modal */}
      <AnimatePresence>
        {isCreatingBanner && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white md:bg-black/50 flex flex-col md:items-center md:justify-center md:p-6"
          >
            <div className="flex flex-col w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md md:bg-white md:rounded-2xl md:shadow-2xl md:overflow-hidden relative">
            <div className="p-4 pt-safe-top flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => setIsCreatingBanner(false)}>
                <X className="w-6 h-6" />
              </Button>
              <span className="text-gray-900 font-black text-lg">New Banner Ad</span>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-32">
              <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
                
                <div className="flex flex-col gap-2">
                  <span className="text-gray-800 font-bold text-sm">Banner Image *</span>
                  <label className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl h-32 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative">
                    {bannerData.imageUrl ? (
                      <Image src={bannerData.imageUrl} alt="Banner" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <UploadCloud className="w-6 h-6 text-purple-500" />
                        <span className="font-bold text-sm">Upload Banner</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
                  </label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-800 font-bold text-sm">Target Link / URL</span>
                  <Input placeholder="https://..." value={bannerData.linkUrl || ''} onChange={e => setBannerData({...bannerData, linkUrl: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 focus-visible:ring-purple-500" />
                </div>
                
                {/* Fallback required field */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-gray-800 font-bold text-sm">Internal Title *</span>
                  <Input placeholder="E.g., Diwali Sale" value={bannerData.title || ''} onChange={e => setBannerData({...bannerData, title: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 focus-visible:ring-purple-500" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe-bottom z-30">
              <Button onClick={submitBanner} disabled={uploading || !bannerData.title || !bannerData.imageUrl} className="w-full max-w-lg mx-auto h-14 text-lg font-extrabold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Publish Banner'}
              </Button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
