'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, Coins, Globe, Inbox, Store, Eye, Phone,
  CheckCircle, AlertCircle, Gift, TrendingUp,
  ArrowUpRight, Calendar, Plus, Pencil,
  Copy, Download, Share2, Sparkles, Zap, Star,
  MessageCircle, ShieldCheck, LayoutDashboard,
  ChevronRight, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { GlassCard } from '@/components/glass-card'
import { CityAdminDashboard } from '@/components/city-admin-dashboard'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { EmptyListings, EmptyLeads, EmptyCoins } from '@/components/empty-states'
import { ListingCardSkeleton } from '@/components/skeleton-loaders'
import { MultiMediaUploader } from '@/components/media-uploader'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────
interface UserListing {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  whatsappNumber: string | null
  images: string | null
  cityId: string
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  leadsCount?: number
  createdAt: string
  city?: { id: string; name: string; slug: string }
}

interface Lead {
  id: string
  customerName: string | null
  customerPhone: string
  requirementText: string | null
  source: string
  status: string
  createdAt: string
  listing: { id: string; name: string; category: string }
}

interface CoinTransaction {
  id: string
  amount: number
  reason: string
  createdAt: string
}

interface SubscriptionData {
  id: string
  plan: string
  status: string
  startDate: string
  endDate: string | null
  createdAt: string
}

interface City {
  id: string
  name: string
  slug: string
}

// ─── Plan definitions (CORRECT PRICING) ───────────────────────────
const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    period: '',
    features: ['1 Listing', 'Basic Analytics', '10 Coins/Day', 'Community Support'],
    icon: Gift,
    color: 'from-gray-400 to-gray-500',
    accentColor: 'text-gray-500',
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹299',
    period: '/mo',
    features: ['5 Listings', 'Advanced Analytics', 'Priority Support', '20 Coins/Day', 'Lead Inbox'],
    icon: Zap,
    color: 'from-[#4169E1] to-[#6B8FF1]',
    accentColor: 'text-[#4169E1]',
    popular: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '₹499',
    period: '/mo',
    features: ['Unlimited Listings', 'Full Analytics', 'Dedicated Manager', '50 Coins/Day', 'Featured Gold Badge', 'Mini-Website + QR'],
    icon: Crown,
    color: 'from-[#D4AF37] to-[#F5D76E]',
    accentColor: 'text-[#D4AF37]',
  },
]

const CATEGORIES = [
  'Restaurant', 'Hotel', 'Hospital', 'School', 'Gym', 'Salon',
  'Electronics', 'Clothing', 'Grocery', 'Pharmacy', 'Auto Repair',
  'Real Estate', 'Legal', 'Financial', 'IT Services', 'Education',
  'Healthcare', 'Food & Beverage', 'Retail', 'Other',
]

const TAB_ITEMS = [
  { key: 'overview', label: 'Subscription', icon: Crown },
  { key: 'coins', label: 'Coins', icon: Coins },
  { key: 'listings', label: 'My Listings', icon: Store },
  { key: 'leads', label: 'Lead Inbox', icon: Inbox },
  { key: 'mini-website', label: 'Mini-Website', icon: Globe },
]

// ─── Component ────────────────────────────────────────────────────
export default function DashboardView() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const dashboardTab = useAppStore((s) => s.dashboardTab)
  const setDashboardTab = useAppStore((s) => s.setDashboardTab)
  const setSelectedListing = useAppStore((s) => s.setSelectedListing)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const { user } = useAuth()
  const currentUser = user ? {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    coinsBalance: user.coinsBalance,
    subscriptionTier: user.subscriptionTier,
  } : null

  // ─── State ────────────────────────────────────────────────────
  const [listings, setListings] = useState<UserListing[]>([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null)
  const [coinBalance, setCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([])
  const [claimingDaily, setClaimingDaily] = useState(false)
  const [claimedToday, setClaimedToday] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionData[]>([])
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)
  const [showListingDialog, setShowListingDialog] = useState(false)
  const [editingListing, setEditingListing] = useState<UserListing | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    whatsappNumber: '',
    imageUrls: [] as string[],
    cityId: '',
  })
  const [submittingListing, setSubmittingListing] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const qrRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ─── Data fetching ────────────────────────────────────────────
  const fetchListings = useCallback(() => {
    if (!currentUser) return
    setLoadingListings(true)
    fetch(`/api/listings?userId=${currentUser.id}&limit=50`)
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoadingListings(false))
  }, [currentUser])

  useEffect(() => { fetchListings() }, [fetchListings])

  const fetchLeads = useCallback(() => {
    if (!currentUser) return
    // Fetch leads for user's listings
    fetch(`/api/leads?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load leads'))
  }, [currentUser])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const fetchCoins = useCallback(() => {
    if (!currentUser) return
    fetch(`/api/coins?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCoinBalance(data.balance ?? 0)
        setCoinTransactions(data.transactions ?? [])
        // Check if claimed today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const hasClaimedToday = (data.transactions ?? []).some(
          (tx: CoinTransaction) => tx.reason === 'Daily login reward' && new Date(tx.createdAt) >= today
        )
        setClaimedToday(hasClaimedToday)
      })
      .catch(() => toast.error('Failed to load coins'))
  }, [currentUser])

  useEffect(() => { fetchCoins() }, [fetchCoins])

  const fetchSubscription = useCallback(() => {
    if (!currentUser) return
    fetch(`/api/subscriptions?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data.active || null)
        setSubscriptionHistory(data.subscriptions || [])
      })
      .catch(() => toast.error('Failed to load subscription'))
  }, [currentUser])

  useEffect(() => { fetchSubscription() }, [fetchSubscription])

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────
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
        const data = await res.json()
        toast.error(data.error || 'Already claimed today')
        setClaimedToday(true)
      }
    } catch {
      toast.error('Failed to claim coins')
    } finally {
      setClaimingDaily(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    if (!currentUser) return
    setUpgradingPlan(plan)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          plan,
          razorpayPaymentId: 'demo-pay',
        }),
      })
      if (res.ok) {
        toast.success(`Upgraded to ${plan} plan!`)
        fetchSubscription()
        useAppStore.setState((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, subscriptionTier: plan }
            : null,
        }))
      } else {
        toast.error('Upgrade failed. Try again.')
      }
    } catch {
      toast.error('Upgrade failed. Try again.')
    } finally {
      setUpgradingPlan(null)
    }
  }

  const handleMarkLeadContacted = async (leadId: string) => {
    setUpdatingLeadId(leadId)
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: 'contacted' }),
      })
      if (res.ok) {
        toast.success('Lead marked as contacted!')
        fetchLeads()
      } else {
        toast.error('Failed to update lead')
      }
    } catch {
      toast.error('Failed to update lead')
    } finally {
      setUpdatingLeadId(null)
    }
  }

  const openAddListing = () => {
    setEditingListing(null)
    setFormData({
      name: '',
      category: '',
      description: '',
      whatsappNumber: '',
      imageUrls: [],
      cityId: cities[0]?.id || '',
    })
    setShowListingDialog(true)
  }

  const openEditListing = (listing: UserListing) => {
    setEditingListing(listing)
    const imageUrls = listing.images ? JSON.parse(listing.images) : []
    setFormData({
      name: listing.name,
      category: listing.category,
      description: listing.description || '',
      whatsappNumber: listing.whatsappNumber || '',
      imageUrls,
      cityId: listing.cityId,
    })
    setShowListingDialog(true)
  }

  const handleSubmitListing = async () => {
    if (!currentUser || !formData.name || !formData.category) return
    setSubmittingListing(true)
    try {
      const imagesArr = formData.imageUrls.length > 0 ? formData.imageUrls : null
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

      if (editingListing) {
        const res = await fetch(`/api/listings/${editingListing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            description: formData.description || null,
            whatsappNumber: formData.whatsappNumber || null,
            images: imagesArr,
          }),
        })
        if (res.ok) {
          toast.success('Listing updated!')
          fetchListings()
        } else {
          toast.error('Failed to update listing')
        }
      } else {
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
            whatsappNumber: formData.whatsappNumber || null,
            images: imagesArr,
          }),
        })
        if (res.ok) {
          toast.success('Listing created! Pending approval.')
          fetchListings()
        } else {
          toast.error('Failed to create listing')
        }
      }
      setShowListingDialog(false)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingListing(false)
    }
  }

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Link copied!')
  }

  const handleDownloadQR = (listingId: string, listingName: string) => {
    const qrContainer = qrRefs.current[listingId]
    if (!qrContainer) return
    const svgEl = qrContainer.querySelector('svg')
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      const a = document.createElement('a')
      a.download = `${listingName}-qrcode.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
      toast.success('QR Code downloaded!')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleShareWhatsApp = (slug: string, name: string) => {
    const url = `${window.location.origin}/listing/${slug}`
    const text = `Check out my business on Choutuppal: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const getListingStatusBadge = (isApproved: boolean, isFeatured: boolean, isPremium: boolean) => {
    if (isFeatured && isApproved) {
      return <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 font-semibold"><Star className="size-3 mr-0.5" />Featured</Badge>
    }
    if (isApproved) {
      return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="size-3 mr-0.5" />Approved</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="size-3 mr-0.5" />Pending</Badge>
  }

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>
      case 'contacted':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Contacted</Badge>
      case 'converted':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Converted</Badge>
      case 'lost':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Lost</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFirstImage = (imagesStr: string | null | undefined): string | null => {
    if (!imagesStr) return null
    try {
      const imgs = JSON.parse(imagesStr)
      return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null
    } catch {
      return null
    }
  }

  // ─── Animation variants ──────────────────────────────────────
  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25 },
  }

  // ─── Render ───────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <GlassCard>
          <p className="text-gray-500">Please sign in to access your dashboard.</p>
        </GlassCard>
      </div>
    )
  }

  // ─── City Admin gets its own dashboard ──────────────────────
  if (user?.role === 'city_admin') {
    return <CityAdminDashboard />
  }

  const approvedListings = listings.filter((l) => l.isApproved)
  const currentPlan = currentUser.subscriptionTier || 'free'

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mx-3 md:-mx-6 -my-3 md:-my-6 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
        {/* ─── User Header ──────────────────────────────────────── */}
        <GlassCard variant="gold" className="mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center text-white text-xl font-bold shadow-lg"
            >
              {currentUser.fullName?.charAt(0) || 'U'}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{currentUser.fullName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs capitalize">
                  <Crown className="size-3 mr-1" />
                  {currentPlan} plan
                </Badge>
                {subscription?.status === 'active' && subscription.endDate && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <ShieldCheck className="size-3 mr-1" />
                    Active until {new Date(subscription.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-[#D4AF37] font-semibold">
                  <Coins className="size-4" />
                  {coinBalance}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <LayoutDashboard className="size-5 text-[#D4AF37]" />
              <span className="text-sm font-semibold text-gray-600">Dashboard</span>
            </div>
          </div>
        </GlassCard>

        {/* ─── Layout: Desktop Sidebar + Mobile Horizontal Tabs ──── */}
        <div className="flex gap-6">
          {/* Desktop Left Vertical Tab Menu */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              {TAB_ITEMS.map((tab) => {
                const isActive = dashboardTab === tab.key
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDashboardTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] shadow-sm border border-[#D4AF37]/20'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-800 border border-transparent'
                    }`}
                  >
                    <Icon className={`size-4.5 ${isActive ? 'text-[#D4AF37]' : ''}`} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <ChevronRight className="size-4 ml-auto text-[#D4AF37]" />
                    )}
                    {tab.key === 'leads' && leads.filter(l => l.status === 'new').length > 0 && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 ml-auto min-w-[20px] text-center">
                        {leads.filter(l => l.status === 'new').length}
                      </Badge>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Mobile Top Horizontal Scrollable Tabs */}
          <div className="lg:hidden w-full">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-3 px-3">
              {TAB_ITEMS.map((tab) => {
                const isActive = dashboardTab === tab.key
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDashboardTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/25'
                        : 'bg-white/60 text-gray-600 border border-gray-200/50'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                    {tab.key === 'leads' && leads.filter(l => l.status === 'new').length > 0 && (
                      <span className="bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                        {leads.filter(l => l.status === 'new').length}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ─── Tab Content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={dashboardTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >

                {/* ═══════════════════════════════════════════════════════
                    TAB 1: My Subscription
                ═══════════════════════════════════════════════════════ */}
                {dashboardTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Current Plan Highlight */}
                    <GlassCard
                      variant="gold"
                      className={`relative overflow-hidden ${
                        currentPlan !== 'free' ? 'ring-2 ring-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : ''
                      }`}
                    >
                      {currentPlan !== 'free' && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-[#D4AF37] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                            CURRENT PLAN
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                            currentPlan === 'premium' ? 'from-[#D4AF37] to-[#F5D76E]' :
                            currentPlan === 'pro' ? 'from-[#4169E1] to-[#6B8FF1]' :
                            'from-gray-400 to-gray-500'
                          } flex items-center justify-center shadow-lg`}>
                            {currentPlan === 'premium' ? <Crown className="size-7 text-white" /> :
                             currentPlan === 'pro' ? <Zap className="size-7 text-white" /> :
                             <Gift className="size-7 text-white" />}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-800 capitalize">{currentPlan} Plan</h2>
                            {subscription?.status === 'active' && subscription.endDate ? (
                              <p className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="size-3.5" />
                                Active until {new Date(subscription.endDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">Free tier active</p>
                            )}
                          </div>
                        </div>
                        {currentPlan === 'free' && (
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={() => handleUpgrade('pro')}
                              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold shadow-lg"
                            >
                              <Sparkles className="size-4 mr-2" />
                              Upgrade Now
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </GlassCard>

                    {/* Plan Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {PLANS.map((plan) => {
                        const isCurrent = currentPlan === plan.key
                        const PlanIcon = plan.icon
                        return (
                          <motion.div key={plan.key} {...fadeIn}>
                            <GlassCard
                              variant={isCurrent ? 'gold' : plan.key === 'premium' ? 'premium' : 'default'}
                              className={`text-center relative ${isCurrent ? 'ring-2 ring-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : ''}`}
                            >
                              {plan.popular && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                  <Badge className="bg-[#4169E1] text-white border-none text-[10px] px-2.5 shadow-md">
                                    MOST POPULAR
                                  </Badge>
                                </div>
                              )}
                              <div className="mb-3 pt-1">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto shadow-md`}>
                                  <PlanIcon className="size-6 text-white" />
                                </div>
                              </div>
                              <h3 className="font-bold text-gray-800 text-lg">{plan.name}</h3>
                              <div className="my-3">
                                <span className="text-3xl font-bold text-[#D4AF37]">{plan.price}</span>
                                {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                              </div>
                              <ul className="space-y-2 text-sm text-gray-600 mb-5">
                                {plan.features.map((f, i) => (
                                  <li key={i} className="flex items-center justify-center gap-1.5">
                                    <CheckCircle className="size-3.5 text-green-500 shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                              {isCurrent ? (
                                <Badge className="bg-[#D4AF37] text-white border-none px-4 py-1.5 text-xs font-bold shadow-md">
                                  Current Plan
                                </Badge>
                              ) : (
                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    disabled={upgradingPlan === plan.key}
                                    onClick={() => handleUpgrade(plan.key)}
                                    className={`w-full font-bold ${
                                      plan.key === 'premium'
                                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white'
                                        : 'bg-[#4169E1] hover:bg-[#4169E1]/90 text-white'
                                    }`}
                                  >
                                    {upgradingPlan === plan.key ? (
                                      <Loader2 className="size-4 mr-2 animate-spin" />
                                    ) : null}
                                    Upgrade
                                  </Button>
                                </motion.div>
                              )}
                            </GlassCard>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Subscription History */}
                    {subscriptionHistory.length > 0 && (
                      <GlassCard>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Calendar className="size-4 text-[#4169E1]" />
                          Subscription History
                        </h3>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {subscriptionHistory.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-100"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-800 capitalize">{sub.plan} Plan</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(sub.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  {sub.endDate && ` — ${new Date(sub.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                </p>
                              </div>
                              <Badge className={
                                sub.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                                sub.status === 'expired' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                'bg-red-100 text-red-700 border-red-200'
                              }>
                                {sub.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 2: Choutuppal Coins
                ═══════════════════════════════════════════════════════ */}
                {dashboardTab === 'coins' && (
                  <div className="space-y-6">
                    {/* Balance Card */}
                    <GlassCard variant="gold" className="relative overflow-hidden">
                      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#D4AF37]/5" />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#4169E1]/5" />
                      <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-2 font-medium">Your Coin Balance</p>
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                                <Coins className="size-8 text-white" />
                              </div>
                            </motion.div>
                            <div>
                              <span className="text-4xl font-bold text-[#D4AF37]">{coinBalance}</span>
                              <p className="text-xs text-gray-400 mt-0.5">Choutuppal Coins</p>
                            </div>
                          </div>
                        </div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          {claimedToday ? (
                            <Button disabled className="bg-gray-200 text-gray-500 font-semibold cursor-not-allowed">
                              <CheckCircle className="size-4 mr-2" />
                              Claimed Today
                            </Button>
                          ) : (
                            <Button
                              onClick={handleDailyClaim}
                              disabled={claimingDaily}
                              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold shadow-lg shadow-[#D4AF37]/25"
                            >
                              {claimingDaily ? (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                              ) : (
                                <Gift className="size-4 mr-2" />
                              )}
                              Claim Daily 10 Coins
                            </Button>
                          )}
                        </motion.div>
                      </div>
                    </GlassCard>

                    {/* Earn & Spend Categories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <GlassCard>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="size-4 text-green-500" />
                          Earn Coins
                        </h3>
                        <div className="space-y-2">
                          {[
                            { icon: <Gift className="size-4" />, label: 'Daily Check-in', amount: '+10', color: 'text-green-600 bg-green-50' },
                            { icon: <Star className="size-4" />, label: 'Write a Review', amount: '+15', color: 'text-blue-600 bg-blue-50' },
                            { icon: <Share2 className="size-4" />, label: 'Share Listing', amount: '+5', color: 'text-purple-600 bg-purple-50' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 border border-gray-50">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                                  {item.icon}
                                </div>
                                <span className="text-sm text-gray-700">{item.label}</span>
                              </div>
                              <span className="text-sm font-bold text-green-600">{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>

                      <GlassCard>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Zap className="size-4 text-orange-500" />
                          Spend Coins
                        </h3>
                        <div className="space-y-2">
                          {[
                            { icon: <Gift className="size-4" />, label: 'Coupons & Deals', amount: '-20', color: 'text-orange-600 bg-orange-50' },
                            { icon: <Crown className="size-4" />, label: 'Premium Features', amount: '-50', color: 'text-amber-600 bg-amber-50' },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-white/50 border border-gray-50">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                                  {item.icon}
                                </div>
                                <span className="text-sm text-gray-700">{item.label}</span>
                              </div>
                              <span className="text-sm font-bold text-red-500">{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>

                    {/* Transaction History */}
                    <GlassCard>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Calendar className="size-4 text-[#4169E1]" />
                        Transaction History
                      </h3>
                      {coinTransactions.length === 0 ? (
                        <EmptyCoins />
                      ) : (
                        <div className="max-h-80 overflow-y-auto space-y-2">
                          {coinTransactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                  tx.amount >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                  <ArrowUpRight className={`size-4 ${tx.amount < 0 ? 'rotate-90' : ''}`} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{tx.reason}</p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                              <span className={`font-bold text-sm ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount >= 0 ? '+' : ''}{tx.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 3: My Listings
                ═══════════════════════════════════════════════════════ */}
                {dashboardTab === 'listings' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Store className="size-5 text-[#D4AF37]" />
                        My Listings
                      </h2>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={openAddListing}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold shadow-md shadow-[#D4AF37]/20"
                        >
                          <Plus className="size-4 mr-1.5" />
                          Add Business
                        </Button>
                      </motion.div>
                    </div>

                    {loadingListings ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3].map((i) => (
                          <ListingCardSkeleton key={i} />
                        ))}
                      </div>
                    ) : listings.length === 0 ? (
                      <EmptyListings onAddListing={openAddListing} />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                          {listings.map((listing) => {
                            const img = getFirstImage(listing.images)
                            return (
                              <motion.div key={listing.id} layout {...fadeIn}>
                                <GlassCard
                                  variant={listing.isFeatured ? 'gold' : 'default'}
                                  className="h-full flex flex-col overflow-hidden"
                                >
                                  {img && (
                                    <div className="relative -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-3 aspect-[3/1] overflow-hidden rounded-t-xl md:rounded-t-2xl">
                                      <Image
                                        src={img}
                                        alt={listing.name}
                                        fill
                                        className="object-cover object-center"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h3 className="font-semibold text-gray-800 truncate text-base">{listing.name}</h3>
                                      {getListingStatusBadge(listing.isApproved, listing.isFeatured, listing.isPremium)}
                                    </div>
                                    <Badge variant="secondary" className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs mb-2">
                                      {listing.category}
                                    </Badge>
                                    {listing.description && (
                                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{listing.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Eye className="size-3.5" />
                                        {listing.viewsCount} views
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="size-3.5" />
                                        {new Date(listing.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedListing(listing.slug)
                                          navigateTo('listing')
                                        }}
                                        className="w-full border-[#4169E1]/30 text-[#4169E1] text-xs"
                                      >
                                        <Eye className="size-3.5 mr-1" />
                                        View
                                      </Button>
                                    </motion.div>
                                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditListing(listing)}
                                        className="w-full border-[#D4AF37]/30 text-[#D4AF37] text-xs"
                                      >
                                        <Pencil className="size-3.5 mr-1" />
                                        Edit
                                      </Button>
                                    </motion.div>
                                  </div>
                                </GlassCard>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 4: Lead Inbox (CRM)
                ═══════════════════════════════════════════════════════ */}
                {dashboardTab === 'leads' && (
                  <div className="space-y-4">
                    <GlassCard>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Inbox className="size-5 text-[#4169E1]" />
                          Lead Inbox
                        </h2>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            {leads.filter((l) => l.status === 'new').length} New
                          </Badge>
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            {leads.filter((l) => l.status === 'contacted').length} Contacted
                          </Badge>
                        </div>
                      </div>

                      {approvedListings.length === 0 ? (
                        <div className="text-center py-10">
                          <Store className="size-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Get your listings approved to start receiving leads.</p>
                        </div>
                      ) : leads.length === 0 ? (
                        <EmptyLeads />
                      ) : (
                        <div className="max-h-[500px] overflow-y-auto -mx-4 md:-mx-6 px-4 md:px-6">
                          {/* Desktop Table */}
                          <div className="hidden sm:block">
                            <div className="rounded-xl overflow-hidden border border-gray-100">
                              <div className="grid grid-cols-[100px_1fr_1fr_1fr_100px_80px] gap-2 bg-gray-50/50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div>Date</div>
                                <div>Customer Phone</div>
                                <div>Requirement</div>
                                <div>Listing</div>
                                <div>Status</div>
                                <div>Action</div>
                              </div>
                              {leads.map((lead) => (
                                <div
                                  key={lead.id}
                                  className="grid grid-cols-[100px_1fr_1fr_1fr_100px_80px] gap-2 px-4 py-3 border-t border-gray-50 hover:bg-[#4169E1]/5 items-center transition-colors"
                                >
                                  <div className="text-xs text-gray-500">
                                    {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </div>
                                  <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                                    <Phone className="size-3 text-gray-400" />
                                    {lead.customerPhone}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {lead.requirementText || '—'}
                                  </div>
                                  <div className="text-sm text-gray-600 truncate">
                                    {lead.listing.name}
                                  </div>
                                  <div>{getLeadStatusBadge(lead.status)}</div>
                                  <div>
                                    {lead.status === 'new' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={updatingLeadId === lead.id}
                                        onClick={() => handleMarkLeadContacted(lead.id)}
                                        className="h-7 text-[10px] border-green-300 text-green-700 hover:bg-green-50"
                                      >
                                        {updatingLeadId === lead.id ? (
                                          <Loader2 className="size-3 animate-spin" />
                                        ) : (
                                          <CheckCircle className="size-3 mr-0.5" />
                                        )}
                                        Contact
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mobile Cards */}
                          <div className="sm:hidden space-y-3">
                            {leads.map((lead) => (
                              <div
                                key={lead.id}
                                className="p-3.5 rounded-xl bg-white/50 border border-gray-100 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <Phone className="size-3.5 text-gray-400" />
                                    {lead.customerPhone}
                                  </div>
                                  {getLeadStatusBadge(lead.status)}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {lead.requirementText || 'No requirement text'}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Store className="size-3" />
                                    {lead.listing.name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                                {lead.status === 'new' && (
                                  <Button
                                    size="sm"
                                    disabled={updatingLeadId === lead.id}
                                    onClick={() => handleMarkLeadContacted(lead.id)}
                                    className="w-full h-8 text-xs bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                                    variant="outline"
                                  >
                                    {updatingLeadId === lead.id ? (
                                      <Loader2 className="size-3 animate-spin mr-1" />
                                    ) : (
                                      <CheckCircle className="size-3.5 mr-1.5" />
                                    )}
                                    Mark as Contacted
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 5: My Mini-Website
                ═══════════════════════════════════════════════════════ */}
                {dashboardTab === 'mini-website' && (
                  <div className="space-y-6">
                    {approvedListings.length === 0 ? (
                      <GlassCard className="text-center py-16">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#4169E1]/10" />
                          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#D4AF37]/5 to-[#4169E1]/5 flex items-center justify-center">
                            <Globe className="size-10 text-gray-300" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No approved listings yet</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                          Get your listing approved to unlock your digital business card and mini-website.
                        </p>
                        <Button
                          onClick={() => setDashboardTab('listings')}
                          className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold"
                        >
                          Go to My Listings
                        </Button>
                      </GlassCard>
                    ) : (
                      approvedListings.map((listing) => {
                        const listingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/listing/${listing.slug}`
                        const totalViews = listing.viewsCount
                        const totalLeads = leads.filter(l => l.listing.id === listing.id).length

                        return (
                          <motion.div key={listing.id} {...fadeIn}>
                            <GlassCard variant="premium" className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center shadow-md">
                                  <Globe className="size-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-800">{listing.name}</h3>
                                  <p className="text-xs text-gray-500">{listing.category} &middot; Digital Business Card</p>
                                </div>
                              </div>

                              {/* Auto-Generated URL */}
                              <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Your Unique URL</Label>
                                <div className="flex gap-2">
                                  <Input
                                    readOnly
                                    value={listingUrl}
                                    className="bg-white/50 text-sm font-mono border-[#D4AF37]/20"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyLink(listingUrl)}
                                    className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 shrink-0"
                                  >
                                    <Copy className="size-4 mr-1" />
                                    Copy
                                  </Button>
                                </div>
                              </div>

                              {/* QR Code */}
                              <div className="flex flex-col sm:flex-row items-start gap-6">
                                <div className="flex flex-col items-center gap-3">
                                  <div
                                    ref={(el) => { qrRefs.current[listing.id] = el }}
                                    className="p-3 bg-white rounded-xl shadow-md border border-gray-100"
                                  >
                                    <QRCodeSVG
                                      value={listingUrl}
                                      size={140}
                                      bgColor="#FFFFFF"
                                      fgColor="#1a1a1a"
                                      level="M"
                                      includeMargin={false}
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadQR(listing.id, listing.name)}
                                    className="border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/10"
                                  >
                                    <Download className="size-3.5 mr-1.5" />
                                    Download QR
                                  </Button>
                                </div>

                                <div className="flex-1 space-y-4">
                                  {/* Share on WhatsApp */}
                                  <Button
                                    onClick={() => handleShareWhatsApp(listing.slug, listing.name)}
                                    className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white font-semibold"
                                  >
                                    <MessageCircle className="size-4 mr-2" />
                                    Share on WhatsApp
                                  </Button>

                                  {/* Analytics Preview */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-xl bg-[#4169E1]/5 border border-[#4169E1]/10 text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <Eye className="size-3.5 text-[#4169E1]" />
                                        <span className="text-xs text-gray-500">Total Views</span>
                                      </div>
                                      <p className="text-2xl font-bold text-[#4169E1]">{totalViews}</p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-center">
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <Inbox className="size-3.5 text-[#D4AF37]" />
                                        <span className="text-xs text-gray-500">Total Leads</span>
                                      </div>
                                      <p className="text-2xl font-bold text-[#D4AF37]">{totalLeads}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </GlassCard>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Add/Edit Listing Dialog ──────────────────────────── */}
        <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="size-5 text-[#D4AF37]" />
                {editingListing ? 'Edit Listing' : 'Add New Business'}
              </DialogTitle>
              <DialogDescription>
                {editingListing ? 'Update your business details.' : 'Add your business to Choutuppal. It will be reviewed before going live.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <Label htmlFor="biz-name" className="text-sm font-semibold">Business Name *</Label>
                <Input
                  id="biz-name"
                  placeholder="e.g., Sri Venkateshwara Tiffins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="biz-category" className="text-sm font-semibold">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="biz-desc" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="biz-desc"
                  placeholder="Tell customers about your business..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="biz-whatsapp" className="text-sm font-semibold">WhatsApp Number</Label>
                <Input
                  id="biz-whatsapp"
                  placeholder="e.g., 9876543210"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Business Images</Label>
                <MultiMediaUploader
                  images={formData.imageUrls}
                  onChange={(urls) => setFormData({ ...formData, imageUrls: urls })}
                  maxImages={5}
                />
              </div>

              {!editingListing && (
                <div>
                  <Label htmlFor="biz-city" className="text-sm font-semibold">City</Label>
                  <Select value={formData.cityId} onValueChange={(v) => setFormData({ ...formData, cityId: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setShowListingDialog(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitListing}
                disabled={submittingListing || !formData.name || !formData.category}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold"
              >
                {submittingListing ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                {editingListing ? 'Update Listing' : 'Submit for Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
