'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Store, Building2, Wallet, Settings, 
  Crown, Coins, Eye, Phone, Plus, Pencil, Edit2, Trash2,
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
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyListings } from '@/components/empty-states'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/rich-text-editor').then(mod => mod.RichTextEditor), { ssr: false })


// ─── Types ────────────────────────────────────────────────────────
interface UserListing {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  phoneNumber: string | null
  whatsappNumber: string | null
  images: string | null
  coverImage: string | null
  logoUrl: string | null
  instagramUrl: string | null
  instagramUsername: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  address: string | null
  cityId: string
  status: string
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  leadsCount?: number
  createdAt: string
  city?: { id: string; name: string; slug: string }
}

interface RealEstateListing {
  id: string
  title: string
  price: string
  images?: string | null
  ownerPhone: string
  bedroomCount?: number | null
  area?: string | null
  status: string
  isApproved: boolean
  isFeatured: boolean
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
  status: string
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
  [key: string]: any // allow dynamic fields for edit
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
  const [realEstateListings, setRealEstateListings] = useState<RealEstateListing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [banners, setBanners] = useState<BannerAd[]>([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [coinBalance, setCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([])
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/categories?active=true')
      .then(r => r.json())
      .then(data => setDynamicCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])
  const [claimedToday, setClaimedToday] = useState(false)
  const [claimingDaily, setClaimingDaily] = useState(false)
  const [cities, setCities] = useState<City[]>([])

  // Creation State
  const [isCreatingListing, setIsCreatingListing] = useState(false)
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false)
  const [isCreatingBanner, setIsCreatingBanner] = useState(false)
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '', category: '', description: '',
    phoneNumber: '', whatsappNumber: '', cityId: '', sameAsPhone: false,
    address: '',
    coverImage: '', logoUrl: '', gallery: [] as string[],
    instagramUrl: '', instagramUsername: '', facebookUrl: '', youtubeUrl: '',
    price: '', bedroomCount: '', area: '', rating: 5, operatingHours: '9:00 AM - 9:00 PM', googleMapsUrl: ''
  })
  const [bannerData, setBannerData] = useState({
    title: '', shopName: '', offerText: '', linkUrl: '', imageUrl: '', cityId: ''
  })

  const fetcher = (url: string) => fetch(url).then(res => res.json())

  // Data Fetching with SWR
  const { data: listingsData, isLoading: loadingListingsSWR, mutate: fetchListings } = useSWR(
    currentUser ? `/api/listings?userId=${currentUser.id}&limit=50` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnMount: true, revalidateIfStale: true }
  )

  const { data: realEstateData, mutate: fetchRealEstate } = useSWR(
    currentUser ? `/api/realestate?userId=${currentUser.id}&limit=50` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnMount: true, revalidateIfStale: true }
  )

  const { data: bannersData, isLoading: loadingBannersSWR, mutate: fetchBanners } = useSWR(
    currentUser ? `/api/banners?userId=${currentUser.id}&all=true` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnMount: true, revalidateIfStale: true }
  )

  const { data: coinsData, mutate: fetchCoins } = useSWR(
    currentUser ? `/api/coins?userId=${currentUser.id}` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnMount: true, revalidateIfStale: true }
  )

  const { data: citiesData } = useSWR('/api/cities', fetcher, { dedupingInterval: 60000, revalidateOnMount: true, revalidateIfStale: true })

  useEffect(() => {
    if (listingsData) {
      setListings(listingsData.listings || [])
      setLoadingListings(false)
    }
  }, [listingsData])

  useEffect(() => {
    if (realEstateData) {
      setRealEstateListings(realEstateData.listings || [])
    }
  }, [realEstateData])

  useEffect(() => {
    if (bannersData) {
      setBanners(Array.isArray(bannersData) ? bannersData : [])
      setLoadingBanners(false)
    }
  }, [bannersData])

  useEffect(() => {
    if (coinsData) {
      setCoinBalance(coinsData.balance ?? 0)
      setCoinTransactions(coinsData.transactions ?? [])
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const hasClaimedToday = (coinsData.transactions ?? []).some(
        (tx: CoinTransaction) => tx.reason === 'Daily login reward' && new Date(tx.createdAt) >= today
      )
      setClaimedToday(hasClaimedToday)
    }
  }, [coinsData])

  useEffect(() => {
    if (citiesData) {
      setCities(Array.isArray(citiesData) ? citiesData : [])
    }
  }, [citiesData])

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
    
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(`${folder}/${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '')}`, fileToUpload, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Upload error:', error);
      alert('Image upload failed: ' + error.message);
      throw new Error('Upload failed');
    }
    const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(data.path);
    return { url: urlData.publicUrl };
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

  const handleExtraUpload = async (file: File, type: 'logo') => {
    toast.info('Compressing image...')
    try {
      const data = await compressAndUpload(file, 'choutuppal/listings')
      setFormData(prev => ({ ...prev, logoUrl: data.url }))
      toast.success('Uploaded successfully')
    } catch {
      toast.error('Upload failed')
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    toast.info('Uploading images...');
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const compressedFiles = await Promise.all(files.map(file => imageCompression(file, { maxSizeMB: 1 })));
      const uploadPromises = compressedFiles.map(async (file) => {
        const fileName = `gallery/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage.from('listing-images').upload(fileName, file);
        if (error) { console.error('Upload error:', error); return null; }
        return supabase.storage.from('listing-images').getPublicUrl(data.path).data.publicUrl;
      });
      const urls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];
      
      // CRITICAL FIX: Use callback to append to previous state safely
      setFormData(prevData => ({
        ...prevData,
        gallery: [...(prevData.gallery || []), ...urls] // Ensure it's always an array
      }));
      toast.success('Gallery uploaded successfully');
    } catch (error) {
      console.error('Gallery upload error:', error);
      toast.error('Upload failed');
    }
  };

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
      let url = editingListingId ? `/api/listings/${editingListingId}` : '/api/listings'
      const method = editingListingId ? 'PUT' : 'POST'
      let body: any = {
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
        instagramUsername: formData.instagramUsername || null,
        facebookUrl: formData.facebookUrl || null,
        youtubeUrl: formData.youtubeUrl || null,
      }

      if (formData.category === 'Real Estate') {
        url = editingListingId ? `/api/realestate/${editingListingId}` : '/api/realestate'
        const imagesArr = formData.coverImage ? [formData.coverImage, ...formData.gallery] : formData.gallery
        body = {
          userId: currentUser.id,
          cityId: formData.cityId || cities[0]?.id || 'default',
          title: formData.name,
          price: formData.price,
          images: imagesArr.length > 0 ? JSON.stringify(imagesArr) : null,
          ownerPhone: formData.phoneNumber,
          bedroomCount: formData.bedroomCount ? parseInt(formData.bedroomCount) : null,
          area: formData.area || null,
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingListingId ? 'Listing updated successfully!' : 'Listing created successfully!')
        setIsCreatingListing(false)
        setEditingListingId(null)
        fetchListings()
        fetchRealEstate()
        setFormData({
          name: '', category: '', description: '', phoneNumber: '', whatsappNumber: '', cityId: '', sameAsPhone: false, address: '',
          coverImage: '', logoUrl: '', gallery: [], instagramUrl: '', instagramUsername: '', facebookUrl: '', youtubeUrl: '', price: '', bedroomCount: '', area: '', rating: 5, operatingHours: '9:00 AM - 9:00 PM', googleMapsUrl: ''
        })
      } else {
        const errData = await res.text(); console.error('Submit API error:', errData); toast.error(editingListingId ? 'Failed to update listing' : 'Failed to create listing')
      }
    } catch (err) {
      console.error('Submit error:', err); toast.error('Something went wrong')
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
        const errData = await res.text(); console.error('Banner submit API error:', errData); toast.error('Failed to create banner')
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

  const deleteRealEstate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return
    try {
      const res = await fetch(`/api/realestate/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Property deleted')
        fetchRealEstate()
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Banner deleted')
        fetchBanners()
      }
    } catch {
      toast.error('Failed to delete banner')
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
                          {listing.status === 'PENDING' ? (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Approval</Badge>
                          ) : (
                            <Badge className={listing.status === 'APPROVED' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                              {listing.status === 'APPROVED' ? 'Active' : 'Rejected'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-auto">
                        <button 
                          onClick={() => {
                            setEditingListingId(listing.id)
                            setFormData({
                              name: listing.name, category: listing.category, description: listing.description || '',
                              phoneNumber: listing.phoneNumber || '', whatsappNumber: listing.whatsappNumber || '', 
                              cityId: listing.cityId, sameAsPhone: listing.phoneNumber === listing.whatsappNumber,
                              address: listing.address || '',
                              coverImage: listing.coverImage || '', logoUrl: listing.logoUrl || '',
                              gallery: listing.images ? JSON.parse(listing.images) : [],
                              instagramUrl: listing.instagramUrl || '', instagramUsername: listing.instagramUsername || '', facebookUrl: listing.facebookUrl || '', youtubeUrl: listing.youtubeUrl || '',
                              price: '', bedroomCount: '', area: '', rating: 5, operatingHours: '9:00 AM - 9:00 PM', googleMapsUrl: ''
                            })
                            setIsCreatingListing(true)
                          }}
                          className="p-2 text-gray-500 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteListing(listing.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
                        <Image src={listing.images ? JSON.parse(listing.images)[0] : 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'} alt={listing.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-bold text-gray-900 md:text-lg truncate">{listing.title}</h4>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{listing.city?.name}</p>
                          <p className="text-xs font-semibold text-[#D4AF37] mt-1">{listing.price}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {listing.status === 'PENDING' ? (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Approval</Badge>
                          ) : (
                            <Badge className={listing.status === 'APPROVED' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                              {listing.status === 'APPROVED' ? 'Active' : 'Rejected'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-auto">
                        <button 
                          onClick={() => {
                            setEditingListingId(listing.id)
                            let imagesArr: string[] = []
                            try {
                              if (listing.images) imagesArr = JSON.parse(listing.images)
                            } catch (e) {}
                            
                            setFormData({
                              name: listing.title, category: 'Real Estate', description: '',
                              phoneNumber: listing.ownerPhone, whatsappNumber: '', 
                              cityId: listing.city?.id || '', sameAsPhone: false,
                              address: '',
                              coverImage: imagesArr[0] || '', logoUrl: '',
                              gallery: imagesArr.slice(1),
                              instagramUrl: '', instagramUsername: '', facebookUrl: '', youtubeUrl: '',
                              price: listing.price, bedroomCount: listing.bedroomCount ? String(listing.bedroomCount) : '', area: listing.area || '',
                              rating: 0, operatingHours: 'true', googleMapsUrl: ''
                            })
                            setIsCreatingListing(true)
                          }}
                          className="p-2 text-gray-500 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteRealEstate(listing.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
                      {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h4 className="font-bold text-white md:text-lg truncate">{banner.title}</h4>
                        {banner.offerText && <p className="text-[#D4AF37] font-bold text-sm">{banner.offerText}</p>}
                      </div>
                    </div>
                    <div className="p-3 bg-white flex justify-between items-center">
                      {banner.status === 'PENDING' ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                      ) : (
                        <Badge className={banner.isActive && banner.status === 'APPROVED' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                          {banner.isActive && banner.status === 'APPROVED' ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            // Re-use banner creating modal
                            setBannerData({
                              title: banner.title, shopName: banner.shopName || '', offerText: banner.offerText || '', 
                              linkUrl: banner.linkUrl || '', imageUrl: banner.imageUrl || '', cityId: banner.cityId || ''
                            })
                            setIsCreatingBanner(true)
                          }}
                          className="p-2 text-gray-500 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteBanner(banner.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => { setIsCreatingListing(false); setEditingListingId(null); setFormData({name: '', category: '', description: '', phoneNumber: '', whatsappNumber: '', cityId: '', sameAsPhone: false, address: '', coverImage: '', logoUrl: '', gallery: [], instagramUrl: '', instagramUsername: '', facebookUrl: '', youtubeUrl: '', price: '', bedroomCount: '', area: '', rating: 5, operatingHours: '9:00 AM - 9:00 PM', googleMapsUrl: ''}) }}>
                <X className="w-6 h-6" />
              </Button>
              <span className="text-gray-900 font-black text-lg">{editingListingId ? 'Edit Listing' : 'New Listing'}</span>
              <div className="w-10"></div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-32">
              <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
                
                {/* Profile & Cover Images */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 flex flex-col gap-2">
                    <span className="text-gray-800 font-bold text-sm">Profile Photo/Logo</span>
                    <label className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl h-32 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative group">
                      {formData.logoUrl ? (
                        <>
                          <img src={formData.logoUrl} alt="Profile" className="w-full h-full object-cover" />
                          <button type="button" onClick={(e) => { e.preventDefault(); setFormData(p => ({...p, logoUrl: ''})) }} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3" /></button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud className="w-6 h-6 text-[#4169E1]" />
                          <span className="font-bold text-xs text-center px-2">Upload Profile</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleExtraUpload(e.target.files[0], 'logo')} />
                    </label>
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-2">
                    <span className="text-gray-800 font-bold text-sm">Cover Photo *</span>
                    <label className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl h-32 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative group">
                      {formData.coverImage ? (
                        <>
                          <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          <button type="button" onClick={(e) => { e.preventDefault(); setFormData(p => ({...p, coverImage: ''})) }} className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-4" /></button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <UploadCloud className="w-6 h-6 text-[#4169E1]" />
                          <span className="font-bold text-sm">Upload Cover</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleListingFileChange} />
                    </label>
                  </div>
                </div>

                {/* Gallery Upload */}
                <div className="flex flex-col gap-2">
                  <span className="text-gray-800 font-bold text-sm flex justify-between">
                    <span>Gallery Photos (Up to 5)</span>
                    <span className="text-[#4169E1] bg-[#4169E1]/10 px-2 py-0.5 rounded text-xs">{formData.gallery.length}/5</span>
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {formData.gallery.map((img, i) => (
                      <div key={i} className="w-24 h-24 shrink-0 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        <button type="button" onClick={(e) => { e.preventDefault(); setFormData(p => ({...p, gallery: p.gallery.filter((_, idx) => idx !== i)})) }} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white shadow z-10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3" /></button>
                      </div>
                    ))}
                    {formData.gallery.length < 5 && (
                      <label className="w-24 h-24 shrink-0 flex flex-col items-center justify-center gap-1 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-400 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                        <Plus className="w-6 h-6" />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Square images recommended. Max size: 1MB each.</p>
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
                      {(dynamicCategories.length > 0 ? dynamicCategories.map(c => c.name) : CATEGORIES).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {formData.category === 'Real Estate' && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-gray-800 font-bold text-sm">Price (e.g., ₹50 Lakhs) *</span>
                        <Input placeholder="Enter price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 focus-visible:ring-[#4169E1]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-gray-800 font-bold text-sm">Bedroom Count (e.g., 2, 3)</span>
                        <Input placeholder="Number of bedrooms" type="number" value={formData.bedroomCount} onChange={e => setFormData({...formData, bedroomCount: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 focus-visible:ring-[#4169E1]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-gray-800 font-bold text-sm">Area (e.g., 1200 sqft)</span>
                        <Input placeholder="Property area" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 focus-visible:ring-[#4169E1]" />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-800 font-bold text-sm">Rating (1-5) *</span>
                      <Input type="number" min="1" max="5" step="0.1" placeholder="e.g., 4.5" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value) || 5})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-gray-800 font-bold text-sm">Business Hours *</span>
                      <Input placeholder="e.g., 9:00 AM - 9:00 PM" value={formData.operatingHours} onChange={e => setFormData({...formData, operatingHours: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-gray-800 font-bold text-sm">Google Maps URL</span>
                    <Input placeholder="Paste Google Maps link" value={formData.googleMapsUrl} onChange={e => setFormData({...formData, googleMapsUrl: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12" />
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
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 size-5" />
                    <Input placeholder="Instagram Username (e.g. yourbusiness)" value={formData.instagramUsername || ''} onChange={e => setFormData({...formData, instagramUsername: e.target.value})} className="bg-white border-gray-200 text-gray-900 rounded-xl h-12 pl-10 focus-visible:ring-pink-500" />
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
              <Button 
                onClick={submitListing} 
                disabled={uploading || !formData.name || !formData.category}
                className="w-full max-w-lg mx-auto h-14 rounded-2xl bg-gradient-to-r from-[#4169E1] to-[#1E3A8A] text-white font-bold text-lg shadow-md transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingListingId ? 'Update Listing' : 'Publish Listing')}
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
                      <img src={bannerData.imageUrl} alt="Banner" className="w-full h-full object-cover" />
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
