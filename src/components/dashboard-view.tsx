'use client'

import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, Coins, Globe, Inbox, Store, Eye, Phone,
  CheckCircle, AlertCircle, Gift, TrendingUp,
  QrCode, ArrowUpRight, Calendar, Plus, Pencil,
  Copy, Download, Share2, ChevronDown, ChevronUp,
  Sparkles, Zap, Star, MessageCircle, ShieldCheck, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useAppStore } from '@/lib/store'
import { QRCodeSVG } from 'qrcode.react'

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

interface Subscription {
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

// ─── Plan definitions ─────────────────────────────────────────────
const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '₹0',
    features: ['1 Listing', 'Basic Analytics', '10 Coins/Day', 'Community Support'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹499/mo',
    features: ['5 Listings', 'Advanced Analytics', 'Priority Support', '20 Coins/Day', 'Lead Inbox'],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '₹999/mo',
    features: ['Unlimited Listings', 'Full Analytics', 'Dedicated Manager', '50 Coins/Day', 'Featured Badge', 'Mini-Website + QR'],
  },
]

const CATEGORIES = [
  'Restaurant', 'Hotel', 'Hospital', 'School', 'Gym', 'Salon',
  'Electronics', 'Clothing', 'Grocery', 'Pharmacy', 'Auto Repair',
  'Real Estate', 'Legal', 'Financial', 'IT Services', 'Education',
  'Healthcare', 'Food & Beverage', 'Retail', 'Other',
]

// ─── Component ────────────────────────────────────────────────────
export function DashboardView() {
  const {
    currentUser,
    dashboardTab,
    setDashboardTab,
    addNotification,
    setSelectedListing,
    navigateTo,
  } = useAppStore()

  // ─── State ────────────────────────────────────────────────────
  // Listings
  const [listings, setListings] = useState<UserListing[]>([])
  const [loadingListings, setLoadingListings] = useState(false)

  // Leads
  const [leads, setLeads] = useState<Lead[]>([])
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  // Coins
  const [coinBalance, setCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([])
  const [claimingDaily, setClaimingDaily] = useState(false)

  // Subscription
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([])
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)

  // Listing form dialog
  const [showListingDialog, setShowListingDialog] = useState(false)
  const [editingListing, setEditingListing] = useState<UserListing | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    whatsappNumber: '',
    imageUrl: '',
    cityId: '',
  })
  const [submittingListing, setSubmittingListing] = useState(false)

  // Cities
  const [cities, setCities] = useState<City[]>([])

  // QR download refs
  const qrRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // ─── Data fetching ────────────────────────────────────────────
  // Fetch user listings
  const fetchListings = useCallback(() => {
    if (!currentUser) return
    setLoadingListings(true)
    fetch(`/api/listings?userId=${currentUser.id}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings || [])
      })
      .catch(() => {})
      .finally(() => setLoadingListings(false))
  }, [currentUser])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Fetch leads
  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/leads?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [currentUser])

  // Fetch coins
  const fetchCoins = useCallback(() => {
    if (!currentUser) return
    fetch(`/api/coins?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCoinBalance(data.balance ?? 0)
        setCoinTransactions(data.transactions ?? [])
      })
      .catch(() => {})
  }, [currentUser])

  useEffect(() => {
    fetchCoins()
  }, [fetchCoins])

  // Fetch subscription
  const fetchSubscription = useCallback(() => {
    if (!currentUser) return
    fetch(`/api/subscriptions?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data.active || null)
        setSubscriptionHistory(data.subscriptions || [])
      })
      .catch(() => {})
  }, [currentUser])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Fetch cities
  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────

  // Daily coin claim
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
        addNotification(`Claimed ${data.amount} coins! 🎉`)
        fetchCoins()
      } else {
        const data = await res.json()
        addNotification(data.error || 'Already claimed today')
      }
    } catch {
      addNotification('Failed to claim coins')
    } finally {
      setClaimingDaily(false)
    }
  }

  // Subscription upgrade
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
        addNotification(`Upgraded to ${plan} plan! 🎉`)
        fetchSubscription()
        // Update user store
        useAppStore.setState((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, subscriptionTier: plan }
            : null,
        }))
      } else {
        addNotification('Upgrade failed. Try again.')
      }
    } catch {
      addNotification('Upgrade failed. Try again.')
    } finally {
      setUpgradingPlan(null)
    }
  }

  // Listing form handlers
  const openAddListing = () => {
    setEditingListing(null)
    setFormData({
      name: '',
      category: '',
      description: '',
      whatsappNumber: currentUser?.fullName ? '' : '',
      imageUrl: '',
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
      imageUrl: imageUrls[0] || '',
      cityId: listing.cityId,
    })
    setShowListingDialog(true)
  }

  const handleSubmitListing = async () => {
    if (!currentUser || !formData.name || !formData.category) return
    setSubmittingListing(true)
    try {
      const imagesArr = formData.imageUrl ? [formData.imageUrl] : []
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

      if (editingListing) {
        // Update existing listing
        const res = await fetch(`/api/listings/${editingListing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            description: formData.description || null,
            whatsappNumber: formData.whatsappNumber || null,
            images: imagesArr.length > 0 ? imagesArr : null,
          }),
        })
        if (res.ok) {
          addNotification('Listing updated! ✅')
          fetchListings()
        } else {
          addNotification('Failed to update listing')
        }
      } else {
        // Create new listing
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
            images: imagesArr.length > 0 ? imagesArr : null,
          }),
        })
        if (res.ok) {
          addNotification('Listing created! Pending approval. 🎉')
          fetchListings()
        } else {
          addNotification('Failed to create listing')
        }
      }
      setShowListingDialog(false)
    } catch {
      addNotification('Something went wrong')
    } finally {
      setSubmittingListing(false)
    }
  }

  // Copy link
  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/listing/${slug}`
    navigator.clipboard.writeText(url)
    addNotification('Link copied! 📋')
  }

  // Download QR
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
      addNotification('QR Code downloaded! 📥')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // Share on WhatsApp
  const handleShareWhatsApp = (slug: string, name: string) => {
    const url = `${window.location.origin}/listing/${slug}`
    const text = `Check out ${name} on Choutuppal! ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  // Status badge helper
  const getListingStatusBadge = (isApproved: boolean, isFeatured: boolean) => {
    if (isFeatured && isApproved) {
      return <Badge className="bg-green-100 text-green-700 border-green-200"><Star className="size-3 mr-0.5" />Featured</Badge>
    }
    if (isApproved) {
      return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="size-3 mr-0.5" />Approved</Badge>
    }
    // Check for rejected - we'll use a simple check; unapproved and older than 7 days might be rejected
    // For simplicity, just show Pending for unapproved
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="size-3 mr-0.5" />Pending</Badge>
  }

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">New</Badge>
      case 'contacted':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Contacted</Badge>
      case 'converted':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Converted</Badge>
      case 'lost':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Lost</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Animation variants
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

  const approvedListings = listings.filter((l) => l.isApproved)
  const currentPlan = currentUser.subscriptionTier || 'free'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* ─── User Header ──────────────────────────────────────── */}
      <GlassCard variant="gold">
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
              <div className="flex items-center gap-1 text-sm text-[#D4AF37] font-medium">
                <Coins className="size-4" />
                {coinBalance}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ─── Tabs ─────────────────────────────────────────────── */}
      <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white/40 backdrop-blur-xl border border-white/30 p-1 rounded-xl">
          <TabsTrigger value="overview" className="flex-1 min-w-0 text-xs sm:text-sm data-[state=active]:bg-[#D4AF37]/10 data-[state=active]:text-[#D4AF37]">
            <Crown className="size-3.5 mr-1 hidden sm:inline" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="coins" className="flex-1 min-w-0 text-xs sm:text-sm data-[state=active]:bg-[#D4AF37]/10 data-[state=active]:text-[#D4AF37]">
            <Coins className="size-3.5 mr-1 hidden sm:inline" />
            Coins
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex-1 min-w-0 text-xs sm:text-sm data-[state=active]:bg-[#D4AF37]/10 data-[state=active]:text-[#D4AF37]">
            <Store className="size-3.5 mr-1 hidden sm:inline" />
            Listings
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex-1 min-w-0 text-xs sm:text-sm data-[state=active]:bg-[#D4AF37]/10 data-[state=active]:text-[#D4AF37]">
            <Inbox className="size-3.5 mr-1 hidden sm:inline" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="mini-website" className="flex-1 min-w-0 text-xs sm:text-sm data-[state=active]:bg-[#D4AF37]/10 data-[state=active]:text-[#D4AF37]">
            <Globe className="size-3.5 mr-1 hidden sm:inline" />
            Website
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════
            TAB 1: My Subscription
        ═══════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-6">
            {/* Current Plan Status */}
            <GlassCard variant="gold">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
                    <Crown className="size-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 capitalize">{currentPlan} Plan</h2>
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
                      onClick={() => setDashboardTab('overview')}
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
                return (
                  <motion.div key={plan.key} {...fadeIn}>
                    <GlassCard
                      variant={isCurrent ? 'gold' : 'default'}
                      className={`text-center ${isCurrent ? 'ring-2 ring-[#D4AF37]/50' : ''}`}
                    >
                      <div className="mb-3">
                        {plan.key === 'premium' && <Star className="size-6 text-[#D4AF37] mx-auto mb-1" />}
                        {plan.key === 'pro' && <Zap className="size-6 text-[#4169E1] mx-auto mb-1" />}
                        {plan.key === 'free' && <Gift className="size-6 text-gray-400 mx-auto mb-1" />}
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg capitalize">{plan.name}</h3>
                      <p className="text-3xl font-bold text-[#D4AF37] my-3">{plan.price}</p>
                      <ul className="space-y-2 text-sm text-gray-600 mb-5">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center justify-center gap-1.5">
                            <CheckCircle className="size-3.5 text-green-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <Badge className="bg-[#D4AF37] text-white border-none px-4 py-1">Current Plan</Badge>
                      ) : (
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            disabled={upgradingPlan === plan.key}
                            onClick={() => handleUpgrade(plan.key)}
                            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white w-full"
                          >
                            {upgradingPlan === plan.key ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="size-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                              />
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
                      <Badge
                        className={
                          sub.status === 'active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : sub.status === 'expired'
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 2: Choutuppal Coins
        ═══════════════════════════════════════════════════════ */}
        <TabsContent value="coins" className="mt-4">
          <div className="space-y-6">
            {/* Balance Card */}
            <GlassCard variant="gold">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Your Coin Balance</p>
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] flex items-center justify-center shadow-lg">
                        <Coins className="size-7 text-white" />
                      </div>
                    </motion.div>
                    <div>
                      <span className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8962E] bg-clip-text text-transparent">
                        {coinBalance}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">Choutuppal Coins</p>
                    </div>
                  </div>
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleDailyClaim}
                    disabled={claimingDaily}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold shadow-lg"
                  >
                    {claimingDaily ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                    ) : (
                      <Gift className="size-4 mr-2" />
                    )}
                    Daily Claim
                  </Button>
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
                <p className="text-sm text-gray-500 text-center py-8">No transactions yet. Claim your daily coins!</p>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {coinTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            tx.amount >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}
                        >
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
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 3: My Listings
        ═══════════════════════════════════════════════════════ */}
        <TabsContent value="listings" className="mt-4">
          <div className="space-y-4">
            {/* Add New Listing Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Store className="size-5 text-[#D4AF37]" />
                My Listings
              </h2>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={openAddListing}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold"
                >
                  <Plus className="size-4 mr-1.5" />
                  Add New
                </Button>
              </motion.div>
            </div>

            {/* Listings Grid */}
            {loadingListings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <GlassCard className="text-center py-16">
                <Store className="size-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg">No listings yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">Create your first business listing</p>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={openAddListing}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                  >
                    <Plus className="size-4 mr-1.5" />
                    Add Your First Listing
                  </Button>
                </motion.div>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {listings.map((listing) => (
                    <motion.div key={listing.id} layout {...fadeIn}>
                      <GlassCard
                        variant={listing.isPremium ? 'gold' : 'default'}
                        className="h-full flex flex-col"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 truncate text-base">{listing.name}</h3>
                            {getListingStatusBadge(listing.isApproved, listing.isFeatured)}
                          </div>
                          <Badge variant="secondary" className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs mb-3">
                            {listing.category}
                          </Badge>
                          {listing.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{listing.description}</p>
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
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 4: Lead Inbox (Mini CRM)
        ═══════════════════════════════════════════════════════ */}
        <TabsContent value="leads" className="mt-4">
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
                  {leads.filter((l) => l.status === 'converted').length} Converted
                </Badge>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="size-14 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No leads yet</p>
                <p className="text-sm text-gray-400 mt-1">Leads will appear when customers enquire about your listings</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto -mx-4 px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden sm:table-cell">Phone</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <Fragment key={lead.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-[#4169E1]/5"
                          onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                        >
                          <TableCell className="text-xs text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {lead.customerName || 'Anonymous'}
                          </TableCell>
                          <TableCell className="text-sm text-[#4169E1] hidden sm:table-cell">
                            {lead.customerPhone}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-[150px] truncate">
                            {lead.requirementText || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700 max-w-[120px] truncate">
                            {lead.listing?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getLeadStatusBadge(lead.status)}
                              {expandedLead === lead.id ? (
                                <ChevronUp className="size-3.5 text-gray-400" />
                              ) : (
                                <ChevronDown className="size-3.5 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Expanded Lead Details */}
                        {expandedLead === lead.id && (
                          <tr className="bg-[#4169E1]/5">
                            <td colSpan={6} className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-400 text-xs">Customer Name</span>
                                    <p className="font-medium text-gray-800">{lead.customerName || 'Anonymous'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-xs">Phone</span>
                                    <p className="font-medium text-[#4169E1] flex items-center gap-1">
                                      <Phone className="size-3.5" />
                                      {lead.customerPhone}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-xs">Listing</span>
                                    <p className="font-medium text-gray-800">{lead.listing?.name || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-xs">Source</span>
                                    <p className="font-medium text-gray-800 capitalize">{lead.source}</p>
                                  </div>
                                  {lead.requirementText && (
                                    <div className="sm:col-span-2">
                                      <span className="text-gray-400 text-xs">Requirement</span>
                                      <p className="text-gray-700">{lead.requirementText}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-400 text-xs">Date</span>
                                    <p className="font-medium text-gray-800">
                                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════
            TAB 5: My Mini-Website
        ═══════════════════════════════════════════════════════ */}
        <TabsContent value="mini-website" className="mt-4">
          <div className="space-y-4">
            {approvedListings.length === 0 ? (
              <GlassCard className="text-center py-16">
                <Globe className="size-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg">No mini-websites yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">
                  {listings.length > 0
                    ? 'Your listings need to be approved before mini-websites are generated.'
                    : 'Create and get a listing approved to unlock your mini-website + QR code.'}
                </p>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setDashboardTab('listings')}
                    className="bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white"
                  >
                    <Store className="size-4 mr-1.5" />
                    Go to My Listings
                  </Button>
                </motion.div>
              </GlassCard>
            ) : (
              approvedListings.map((listing) => {
                const listingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/listing/${listing.slug}`
                return (
                  <motion.div key={listing.id} {...fadeIn}>
                    <GlassCard variant={listing.isPremium ? 'gold' : 'default'}>
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-3">
                          <div
                            ref={(el) => { qrRefs.current[listing.id] = el }}
                            className="p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                          >
                            <QRCodeSVG
                              value={listingUrl}
                              size={120}
                              bgColor="#FFFFFF"
                              fgColor="#1a1a1a"
                              level="M"
                              includeMargin={false}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-bold text-[#D4AF37]">{listing.viewsCount}</p>
                            <p className="text-xs text-gray-500">Total Views</p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-lg mb-1">{listing.name}</h3>
                          <Badge variant="secondary" className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs mb-3">
                            {listing.category}
                          </Badge>

                          {/* Auto-generated URL */}
                          <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-400 mb-1">Your Mini-Website URL</p>
                            <p className="text-sm text-[#4169E1] font-mono break-all">{listingUrl}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyLink(listing.slug)}
                                className="border-[#4169E1]/30 text-[#4169E1] text-xs"
                              >
                                <Copy className="size-3.5 mr-1" />
                                Copy Link
                              </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadQR(listing.id, listing.name)}
                                className="border-[#D4AF37]/30 text-[#D4AF37] text-xs"
                              >
                                <Download className="size-3.5 mr-1" />
                                Download QR
                              </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleShareWhatsApp(listing.slug, listing.name)}
                                className="border-green-500/30 text-green-600 text-xs"
                              >
                                <MessageCircle className="size-3.5 mr-1" />
                                Share on WhatsApp
                              </Button>
                            </motion.div>
                            <motion.div whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedListing(listing.slug)
                                  navigateTo('listing')
                                }}
                                className="border-gray-300 text-gray-600 text-xs"
                              >
                                <Eye className="size-3.5 mr-1" />
                                View
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════
          LISTING FORM DIALOG
      ═══════════════════════════════════════════════════════ */}
      <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingListing ? (
                <>
                  <Pencil className="size-5 text-[#D4AF37]" />
                  Edit Listing
                </>
              ) : (
                <>
                  <Plus className="size-5 text-[#D4AF37]" />
                  Add New Listing
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingListing
                ? 'Update your business listing details.'
                : 'Fill in the details to create a new business listing.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="listing-name" className="text-sm font-medium text-gray-700">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="listing-name"
                placeholder="e.g. Shri Lakshmi Tiffins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({ ...formData, category: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="listing-desc" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="listing-desc"
                placeholder="Describe your business, services, specialties..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <Label htmlFor="listing-whatsapp" className="text-sm font-medium text-gray-700">
                WhatsApp Number
              </Label>
              <Input
                id="listing-whatsapp"
                placeholder="e.g. +91 9876543210"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="listing-image" className="text-sm font-medium text-gray-700">
                Image URL
              </Label>
              <Input
                id="listing-image"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <p className="text-xs text-gray-400">Paste a direct link to your business image</p>
            </div>

            {/* City */}
            {!editingListing && cities.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(val) => setFormData({ ...formData, cityId: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowListingDialog(false)}
            >
              Cancel
            </Button>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmitListing}
                disabled={submittingListing || !formData.name || !formData.category}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold"
              >
                {submittingListing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="size-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  />
                ) : null}
                {editingListing ? 'Update Listing' : 'Create Listing'}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
