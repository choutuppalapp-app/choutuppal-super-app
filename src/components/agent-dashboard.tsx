'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, TrendingUp, Store, Users, IndianRupee,
  CheckCircle, AlertCircle, Clock, ArrowUpRight,
  ChevronRight, Loader2, Plus, Image as ImageIcon,
  CreditCard, Send, Eye, Ban, Newspaper, Crown,
  Phone, MapPin, Sparkles, CalendarDays, DollarSign,
  CircleDollarSign, Receipt, Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { useAuth } from '@/lib/auth-context'
import { MultiMediaUploader } from '@/components/media-uploader'
import { toast } from 'sonner'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────
interface AgentTransaction {
  id: string
  userId: string
  agentId: string | null
  cityAdminId: string
  cityId: string
  type: string
  amount: number
  agentCommission: number
  cityAdminShare: number
  superAdminShare: number
  status: string
  description: string | null
  createdAt: string
  user?: { id: string; fullName: string; phone: string; role: string }
  agent?: { id: string; fullName: string; phone: string; role: string; upiId?: string }
  city?: { id: string; name: string; slug: string }
}

interface ReferredListing {
  id: string
  name: string
  category: string
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  referredByAgentId: string | null
  createdAt: string
  user?: { id: string; fullName: string }
  city?: { id: string; name: string; slug: string }
}

interface PayoutRecord {
  id: string
  userId: string
  amount: number
  status: string
  upiId: string | null
  bankDetails: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    fullName: string
    upiId?: string
    totalEarnings: number
    pendingPayout: number
  }
}

interface City {
  id: string
  name: string
  slug: string
}

interface PlatformSetting {
  id: string
  key: string
  value: string
  label?: string | null
}

// ─── Constants ────────────────────────────────────────────────────
const CATEGORIES = [
  'Restaurant', 'Hotel', 'Hospital', 'School', 'Gym', 'Salon',
  'Electronics', 'Clothing', 'Grocery', 'Pharmacy', 'Auto Repair',
  'Real Estate', 'Legal', 'Financial', 'IT Services', 'Education',
  'Healthcare', 'Food & Beverage', 'Retail', 'Other',
]

const PLANS = [
  { key: 'free', label: 'Free', price: 0, color: 'text-gray-500' },
  { key: 'pro', label: 'Pro', price: 299, color: 'text-[#4169E1]' },
  { key: 'premium', label: 'Premium', price: 499, color: 'text-[#D4AF37]' },
] as const

const AGENT_TAB_ITEMS = [
  { key: 'earnings', label: 'Earnings', icon: Wallet },
  { key: 'add-business', label: 'Add Business', icon: Plus },
  { key: 'referrals', label: 'My Referrals', icon: Users },
  { key: 'payouts', label: 'Payout History', icon: CreditCard },
]

const CHART_COLORS = ['#4169E1', '#D4AF37', '#E74C3C', '#2ECC71']

// ─── Component ────────────────────────────────────────────────────
export default function AgentDashboard() {
  const { user } = useAuth()
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const themePrimary = useAppStore((s) => s.themePrimary)
  const themeSecondary = useAppStore((s) => s.themeSecondary)

  // ─── State ────────────────────────────────────────────────────
  const [agentTab, setAgentTab] = useState('earnings')
  const [transactions, setTransactions] = useState<AgentTransaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [referrals, setReferrals] = useState<ReferredListing[]>([])
  const [loadingReferrals, setLoadingReferrals] = useState(false)
  const [payouts, setPayouts] = useState<PayoutRecord[]>([])
  const [loadingPayouts, setLoadingPayouts] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [totalEarnings, setTotalEarnings] = useState(user?.totalEarnings || 0)
  const [pendingPayout, setPendingPayout] = useState(user?.pendingPayout || 0)
  const [platformSettings, setPlatformSettings] = useState<PlatformSetting[]>([])

  // Payout dialog
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutUpiId, setPayoutUpiId] = useState(user?.upiId || '')
  const [submittingPayout, setSubmittingPayout] = useState(false)

  // Success dialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [lastCommission, setLastCommission] = useState(0)
  const [lastBusinessName, setLastBusinessName] = useState('')

  // Add Business form
  const [businessForm, setBusinessForm] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    whatsappNumber: '',
    address: '',
    services: '',
    cityId: '',
    imageUrl: '',
    imageUrls: [] as string[],
    referredByMe: true,
    plan: 'free' as string,
  })
  const [submittingBusiness, setSubmittingBusiness] = useState(false)

  // ─── Platform Settings Helpers ──────────────────────────────
  const getSetting = useCallback((key: string, defaultVal: number): number => {
    const setting = platformSettings.find((s) => s.key === key)
    if (!setting) return defaultVal
    const val = parseFloat(setting.value)
    return isNaN(val) ? defaultVal : val
  }, [platformSettings])

  const commissionListing = useMemo(() => getSetting('agent_commission_listing', 20), [getSetting])
  const commissionBanner = useMemo(() => getSetting('agent_commission_banner', 15), [getSetting])
  const commissionNews = useMemo(() => getSetting('agent_commission_news_post', 10), [getSetting])
  const commissionSubscription = useMemo(() => getSetting('agent_commission_subscription', 20), [getSetting])
  const minPayoutAmount = useMemo(() => getSetting('min_payout_amount', 500), [getSetting])

  // ─── Data Fetching ────────────────────────────────────────────
  const fetchTransactions = useCallback(() => {
    if (!user?.id) return
    setLoadingTransactions(true)
    fetch(`/api/transactions?agentId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const txns = Array.isArray(data) ? data : []
        setTransactions(txns)
        if (user.totalEarnings) setTotalEarnings(user.totalEarnings)
        if (user.pendingPayout) setPendingPayout(user.pendingPayout)
      })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoadingTransactions(false))
  }, [user])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const fetchReferrals = useCallback(() => {
    if (!user?.id) return
    setLoadingReferrals(true)
    fetch(`/api/listings?referredByAgentId=${user.id}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        setReferrals(data.listings || [])
      })
      .catch(() => toast.error('Failed to load referrals'))
      .finally(() => setLoadingReferrals(false))
  }, [user])

  useEffect(() => { fetchReferrals() }, [fetchReferrals])

  const fetchPayouts = useCallback(() => {
    if (!user?.id) return
    setLoadingPayouts(true)
    fetch(`/api/payouts?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPayouts(Array.isArray(data) ? data : [])
      })
      .catch(() => toast.error('Failed to load payouts'))
      .finally(() => setLoadingPayouts(false))
  }, [user])

  useEffect(() => { fetchPayouts() }, [fetchPayouts])

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/platform-settings')
      .then((res) => res.json())
      .then((data) => setPlatformSettings(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // ─── Computed values ──────────────────────────────────────────
  const listingCommissionTxns = transactions.filter((t) => t.type === 'LISTING')
  const bannerCommissionTxns = transactions.filter((t) => t.type === 'BANNER')
  const newsCommissionTxns = transactions.filter((t) => t.type === 'NEWS_POST')
  const subscriptionCommissionTxns = transactions.filter((t) => t.type === 'SUBSCRIPTION')

  const listingCommissionTotal = listingCommissionTxns.reduce((s, t) => s + (t.agentCommission || 0), 0)
  const bannerCommissionTotal = bannerCommissionTxns.reduce((s, t) => s + (t.agentCommission || 0), 0)
  const newsCommissionTotal = newsCommissionTxns.reduce((s, t) => s + (t.agentCommission || 0), 0)
  const subscriptionCommissionTotal = subscriptionCommissionTxns.reduce((s, t) => s + (t.agentCommission || 0), 0)

  const thisMonthEarnings = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return transactions
      .filter((t) => new Date(t.createdAt) >= startOfMonth)
      .reduce((s, t) => s + (t.agentCommission || 0), 0)
  }, [transactions])

  // Pie chart data
  const earningsBreakdownData = useMemo(() => {
    const data = [
      { name: 'Listing', value: listingCommissionTotal, color: CHART_COLORS[0] },
      { name: 'Banner', value: bannerCommissionTotal, color: CHART_COLORS[1] },
      { name: 'News', value: newsCommissionTotal, color: CHART_COLORS[2] },
      { name: 'Subscription', value: subscriptionCommissionTotal, color: CHART_COLORS[3] },
    ]
    return data.filter((d) => d.value > 0)
  }, [listingCommissionTotal, bannerCommissionTotal, newsCommissionTotal, subscriptionCommissionTotal])

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const months: { month: string; earnings: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const earned = transactions
        .filter((t) => {
          const td = new Date(t.createdAt)
          return td >= start && td < end
        })
        .reduce((s, t) => s + (t.agentCommission || 0), 0)
      months.push({
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        earnings: Math.round(earned * 100) / 100,
      })
    }
    return months
  }, [transactions])

  const recentTransactions = transactions.slice(0, 15)

  // Referral stats
  const totalReferred = referrals.length
  const activePremiumReferrals = referrals.filter((r) => r.isPremium && r.isApproved).length
  const totalReferralCommission = useMemo(() => {
    return referrals.reduce((sum, ref) => {
      const matchedTxn = transactions.find((t) =>
        t.description?.includes(ref.name) && t.type === 'LISTING'
      )
      return sum + (matchedTxn?.agentCommission || 0)
    }, 0)
  }, [referrals, transactions])

  // Commission calculation for business form
  const selectedPlan = PLANS.find((p) => p.key === businessForm.plan) || PLANS[0]
  const calculatedCommission = useMemo(() => {
    if (!businessForm.referredByMe || selectedPlan.price === 0) return 0
    const rate = commissionListing / 100
    return Math.round(selectedPlan.price * rate * 100) / 100
  }, [businessForm.referredByMe, businessForm.plan, selectedPlan, commissionListing])

  // ─── Handlers ─────────────────────────────────────────────────
  const handleRequestPayout = async () => {
    if (!user?.id) return
    const amount = parseFloat(payoutAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (amount < minPayoutAmount) {
      toast.error(`Minimum payout amount is ₹${minPayoutAmount}`)
      return
    }
    if (!payoutUpiId.trim()) {
      toast.error('Please enter your UPI ID')
      return
    }
    if (amount > pendingPayout) {
      toast.error(`Amount exceeds pending payout of ₹${pendingPayout}`)
      return
    }
    setSubmittingPayout(true)
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount,
          upiId: payoutUpiId.trim(),
        }),
      })
      if (res.ok) {
        toast.success('Payout request submitted!')
        setShowPayoutDialog(false)
        setPayoutAmount('')
        setPayoutUpiId(user.upiId || '')
        fetchPayouts()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to request payout')
      }
    } catch {
      toast.error('Failed to request payout')
    } finally {
      setSubmittingPayout(false)
    }
  }

  const handleAddBusiness = async () => {
    if (!user?.id) return
    if (!businessForm.name || !businessForm.category) {
      toast.error('Business name and category are required')
      return
    }
    setSubmittingBusiness(true)
    try {
      const slug = businessForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

      const cityId = businessForm.cityId || cities[0]?.id || 'default'

      const servicesArr = businessForm.services
        ? businessForm.services.split(',').map((s) => s.trim()).filter(Boolean)
        : null

      // Combine manual URL with uploaded images
      const allImages = [...businessForm.imageUrls]
      if (businessForm.imageUrl.trim()) {
        allImages.unshift(businessForm.imageUrl.trim())
      }

      const isPremium = businessForm.plan === 'premium'
      const isFeatured = businessForm.plan === 'pro' || businessForm.plan === 'premium'

      const listingRes = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cityId,
          slug,
          name: businessForm.name,
          category: businessForm.category,
          description: businessForm.description || null,
          whatsappNumber: businessForm.whatsappNumber || null,
          address: businessForm.address || null,
          services: servicesArr,
          images: allImages.length > 0 ? allImages : null,
          referredByAgentId: businessForm.referredByMe ? user.id : null,
          isPremium,
          isFeatured,
        }),
      })

      if (listingRes.ok) {
        // Create a transaction if agent is referring and paid plan
        if (businessForm.referredByMe && selectedPlan.price > 0) {
          try {
            const txnRes = await fetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                agentId: user.id,
                cityId,
                type: 'LISTING',
                amount: selectedPlan.price,
                description: `Commission for listing: ${businessForm.name} (${selectedPlan.label} plan)`,
              }),
            })
            if (txnRes.ok) {
              const txnData = await txnRes.json()
              setLastCommission(txnData.agentCommission || calculatedCommission)
              setLastBusinessName(businessForm.name)
              setShowSuccessDialog(true)
            }
          } catch {
            // Transaction creation is non-blocking
          }
        } else {
          toast.success('Business listing created! Pending approval.')
        }

        // Reset form
        setBusinessForm({
          name: '',
          category: '',
          description: '',
          phone: '',
          whatsappNumber: '',
          address: '',
          services: '',
          cityId: '',
          imageUrl: '',
          imageUrls: [],
          referredByMe: true,
          plan: 'free',
        })
        fetchReferrals()
        fetchTransactions()
      } else {
        const data = await listingRes.json()
        toast.error(data.error || 'Failed to create listing')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmittingBusiness(false)
    }
  }

  // ─── Helper: Payout Status Badge ──────────────────────────────
  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="size-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><CheckCircle className="size-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><Ban className="size-3 mr-1" />Rejected</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><Send className="size-3 mr-1" />Paid</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // ─── Helper: Get referral plan badge ──────────────────────────
  const getReferralPlanBadge = (ref: ReferredListing) => {
    if (ref.isPremium) return <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-xs"><Crown className="size-3 mr-0.5" />Premium</Badge>
    if (ref.isFeatured) return <Badge className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs"><Sparkles className="size-3 mr-0.5" />Pro</Badge>
    return <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">Free</Badge>
  }

  // ─── Helper: Get referral commission ──────────────────────────
  const getReferralCommission = (ref: ReferredListing) => {
    const matchedTxn = transactions.find((t) =>
      t.description?.includes(ref.name) && t.type === 'LISTING'
    )
    return matchedTxn?.agentCommission || 0
  }

  // ─── Animation variants ──────────────────────────────────────
  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25 },
  }

  // ─── Render ───────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <GlassCard>
          <p className="text-gray-500">Please sign in to access your agent dashboard.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mx-3 md:-mx-6 -my-3 md:-my-6 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6">
        {/* ─── Agent Header ──────────────────────────────────────── */}
        <GlassCard variant="gold" className="mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center text-white text-xl font-bold shadow-lg"
            >
              {user.fullName?.charAt(0) || 'A'}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{user.fullName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 text-xs">
                  <Wallet className="size-3 mr-1" />
                  Agent
                </Badge>
                {user.isAgentApproved && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                    <CheckCircle className="size-3 mr-1" />
                    Approved
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-sm text-[#D4AF37] font-semibold">
                  <IndianRupee className="size-4" />
                  {totalEarnings.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Wallet className="size-5 text-[#D4AF37]" />
              <span className="text-sm font-semibold text-gray-600">Agent Dashboard</span>
            </div>
          </div>
        </GlassCard>

        {/* ─── Layout: Desktop Sidebar + Mobile Horizontal Tabs ──── */}
        <div className="flex gap-6">
          {/* Desktop Left Vertical Tab Menu */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              {AGENT_TAB_ITEMS.map((tab) => {
                const isActive = agentTab === tab.key
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.key}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAgentTab(tab.key)}
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
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Mobile Top Horizontal Scrollable Tabs */}
          <div className="lg:hidden w-full">
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-3 px-3">
              {AGENT_TAB_ITEMS.map((tab) => {
                const isActive = agentTab === tab.key
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAgentTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/25'
                        : 'bg-white/60 text-gray-600 border border-gray-200/50'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    <span>{tab.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* ─── Tab Content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={agentTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >

                {/* ═══════════════════════════════════════════════════════
                    TAB 1: Earnings Overview (Enhanced)
                ═══════════════════════════════════════════════════════ */}
                {agentTab === 'earnings' && (
                  <div className="space-y-6">
                    {/* Earnings Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Total Earnings */}
                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-[#D4AF37]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] flex items-center justify-center shadow-md">
                              <IndianRupee className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Total Earnings</p>
                          </div>
                          <p className="text-2xl font-bold text-[#D4AF37]">
                            ₹{totalEarnings.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </motion.div>

                      {/* Pending Payout */}
                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-[#4169E1]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#6B8FF1] flex items-center justify-center shadow-md">
                              <Clock className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Pending Payout</p>
                          </div>
                          <p className="text-2xl font-bold text-[#4169E1]">
                            ₹{pendingPayout.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </motion.div>

                      {/* This Month */}
                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-green-500">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center shadow-md">
                              <TrendingUp className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">This Month</p>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{thisMonthEarnings.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </motion.div>

                      {/* Commission Rate Display */}
                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-purple-500">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-md">
                              <CircleDollarSign className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Commission Rates</p>
                          </div>
                          <div className="text-xs space-y-0.5">
                            <p className="text-gray-700"><span className="font-semibold text-[#4169E1]">Listing:</span> {commissionListing}%</p>
                            <p className="text-gray-700"><span className="font-semibold text-[#D4AF37]">Banner:</span> {commissionBanner}%</p>
                            <p className="text-gray-700"><span className="font-semibold text-red-500">News:</span> {commissionNews}%</p>
                            <p className="text-gray-700"><span className="font-semibold text-green-600">Sub:</span> {commissionSubscription}%</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Earnings Breakdown Pie Chart */}
                      <GlassCard>
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Receipt className="size-4 text-[#D4AF37]" />
                          Earnings Breakdown
                        </h3>
                        {earningsBreakdownData.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                              <Receipt className="size-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">No earnings data yet</p>
                          </div>
                        ) : (
                          <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={earningsBreakdownData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {earningsBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']}
                                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={36}
                                  formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </GlassCard>

                      {/* Monthly Earnings Trend */}
                      <GlassCard>
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <TrendingUp className="size-4 text-[#4169E1]" />
                          Monthly Earnings Trend
                        </h3>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                              <Tooltip
                                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                              />
                              <Line
                                type="monotone"
                                dataKey="earnings"
                                stroke="#D4AF37"
                                strokeWidth={3}
                                dot={{ fill: '#D4AF37', r: 5, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7, fill: '#D4AF37' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Commission Breakdown Mini Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Listing', total: listingCommissionTotal, count: listingCommissionTxns.length, icon: Store, color: '#4169E1', rate: commissionListing },
                        { label: 'Banner', total: bannerCommissionTotal, count: bannerCommissionTxns.length, icon: Eye, color: '#D4AF37', rate: commissionBanner },
                        { label: 'News', total: newsCommissionTotal, count: newsCommissionTxns.length, icon: Newspaper, color: '#E74C3C', rate: commissionNews },
                        { label: 'Subscription', total: subscriptionCommissionTotal, count: subscriptionCommissionTxns.length, icon: Gift, color: '#2ECC71', rate: commissionSubscription },
                      ].map((item) => (
                        <motion.div key={item.label} {...fadeIn}>
                          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-3 md:p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                                <item.icon className="size-4" style={{ color: item.color }} />
                              </div>
                              <span className="text-xs font-medium text-gray-500">{item.label} ({item.rate}%)</span>
                            </div>
                            <p className="text-lg font-bold" style={{ color: item.color }}>
                              ₹{item.total.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-gray-400">{item.count} txn{item.count !== 1 ? 's' : ''}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Recent Commission Table */}
                    <GlassCard>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <DollarSign className="size-4 text-[#4169E1]" />
                        Recent Commissions
                      </h3>
                      {loadingTransactions ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="size-6 text-[#D4AF37] animate-spin" />
                        </div>
                      ) : recentTransactions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#4169E1]/10 mx-auto mb-3 flex items-center justify-center">
                            <Wallet className="size-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 text-sm">No earnings yet. Start referring businesses!</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white/80 backdrop-blur-sm">
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-2 px-3 font-medium text-gray-500 text-xs">Date</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-500 text-xs">Type</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-500 text-xs">Buyer</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-500 text-xs">Amount</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-500 text-xs">Commission</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentTransactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                                  <td className="py-2.5 px-3 text-gray-500 text-xs">
                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                      month: 'short', day: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <Badge variant="outline" className="text-xs">
                                      {tx.type === 'LISTING' ? 'Listing' : tx.type === 'BANNER' ? 'Banner' : tx.type === 'NEWS_POST' ? 'News' : tx.type === 'SUBSCRIPTION' ? 'Sub' : tx.type}
                                    </Badge>
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-700 text-xs font-medium">
                                    {tx.user?.fullName || 'Direct'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-gray-600 text-xs">
                                    ₹{(tx.amount || 0).toLocaleString('en-IN')}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="font-bold text-sm text-green-600">
                                      +₹{(tx.agentCommission || 0).toLocaleString('en-IN')}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 2: Add Business (Enhanced)
                ═══════════════════════════════════════════════════════ */}
                {agentTab === 'add-business' && (
                  <div className="space-y-6">
                    <GlassCard>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] flex items-center justify-center shadow-md">
                          <Plus className="size-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">Add New Business</h2>
                          <p className="text-xs text-gray-400">Create a listing on behalf of a business owner</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Business Name */}
                        <div className="space-y-1.5">
                          <Label htmlFor="biz-name" className="text-sm font-medium text-gray-700">
                            Business Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="biz-name"
                            placeholder="e.g. Rajesh Electronics"
                            value={businessForm.name}
                            onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={businessForm.category}
                            onValueChange={(val) => setBusinessForm({ ...businessForm, category: val })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Phone & WhatsApp */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="biz-phone" className="text-sm font-medium text-gray-700">
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                              <Input
                                id="biz-phone"
                                placeholder="e.g. 9876543210"
                                value={businessForm.phone}
                                onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                                className="rounded-xl pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="biz-whatsapp" className="text-sm font-medium text-gray-700">
                              WhatsApp Number
                            </Label>
                            <Input
                              id="biz-whatsapp"
                              placeholder="e.g. 919876543210"
                              value={businessForm.whatsappNumber}
                              onChange={(e) => setBusinessForm({ ...businessForm, whatsappNumber: e.target.value })}
                              className="rounded-xl"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                          <Label htmlFor="biz-address" className="text-sm font-medium text-gray-700">
                            Address
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 size-4 text-gray-400" />
                            <Input
                              id="biz-address"
                              placeholder="e.g. 123 Main Road, Choutuppal"
                              value={businessForm.address}
                              onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                              className="rounded-xl pl-10"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                          <Label htmlFor="biz-desc" className="text-sm font-medium text-gray-700">
                            Description
                          </Label>
                          <Textarea
                            id="biz-desc"
                            placeholder="Brief description of the business..."
                            value={businessForm.description}
                            onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                            className="rounded-xl min-h-[80px]"
                          />
                        </div>

                        {/* Services */}
                        <div className="space-y-1.5">
                          <Label htmlFor="biz-services" className="text-sm font-medium text-gray-700">
                            Services <span className="text-xs text-gray-400">(comma-separated)</span>
                          </Label>
                          <Input
                            id="biz-services"
                            placeholder="e.g. AC Repair, Installation, Maintenance"
                            value={businessForm.services}
                            onChange={(e) => setBusinessForm({ ...businessForm, services: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>

                        {/* City */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-gray-700">
                            City
                          </Label>
                          <Select
                            value={businessForm.cityId}
                            onValueChange={(val) => setBusinessForm({ ...businessForm, cityId: val })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Image URL Input */}
                        <div className="space-y-1.5">
                          <Label htmlFor="biz-image-url" className="text-sm font-medium text-gray-700">
                            Image URL <span className="text-xs text-gray-400">(optional)</span>
                          </Label>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                              id="biz-image-url"
                              placeholder="https://example.com/image.jpg"
                              value={businessForm.imageUrl}
                              onChange={(e) => setBusinessForm({ ...businessForm, imageUrl: e.target.value })}
                              className="rounded-xl pl-10"
                            />
                          </div>
                        </div>

                        {/* Images Upload */}
                        <MultiMediaUploader
                          value={businessForm.imageUrls}
                          onChange={(urls) => setBusinessForm({ ...businessForm, imageUrls: urls })}
                          guideline="listing"
                          folder="choutuppal/agent-listings"
                          maxFiles={8}
                          label="Business Images"
                        />

                        {/* ─── Referred by Me Toggle (Prominent) ──── */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37]/5 to-[#4169E1]/5 border border-[#D4AF37]/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] flex items-center justify-center shadow-md">
                                <Sparkles className="size-5 text-white" />
                              </div>
                              <div>
                                <Label className="text-sm font-bold text-gray-800 cursor-pointer">
                                  This business was referred by me
                                </Label>
                                <p className="text-xs text-gray-400">
                                  {businessForm.referredByMe
                                    ? 'You will earn commission on this listing'
                                    : 'No commission will be earned'}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={businessForm.referredByMe}
                              onCheckedChange={(checked) =>
                                setBusinessForm({ ...businessForm, referredByMe: checked })
                              }
                              className="data-[state=checked]:bg-[#D4AF37]"
                            />
                          </div>
                        </div>

                        {/* ─── Plan Selection & Commission Calculator ──── */}
                        {businessForm.referredByMe && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            {/* Plan Selector */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Select Plan
                              </Label>
                              <div className="grid grid-cols-3 gap-3">
                                {PLANS.map((plan) => (
                                  <motion.button
                                    key={plan.key}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setBusinessForm({ ...businessForm, plan: plan.key })}
                                    className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                                      businessForm.plan === plan.key
                                        ? plan.key === 'premium'
                                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg shadow-[#D4AF37]/10'
                                          : plan.key === 'pro'
                                            ? 'border-[#4169E1] bg-[#4169E1]/5 shadow-lg shadow-[#4169E1]/10'
                                            : 'border-gray-400 bg-gray-50 shadow-md'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                  >
                                    {businessForm.plan === plan.key && (
                                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                        <CheckCircle className="size-3 text-white" />
                                      </div>
                                    )}
                                    <p className={`font-bold text-base ${plan.color}`}>{plan.label}</p>
                                    <p className="text-lg font-bold text-gray-800 mt-1">₹{plan.price}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      {plan.key === 'free' ? 'Basic listing' : plan.key === 'pro' ? 'Featured + Pro' : 'All features'}
                                    </p>
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {/* Commission Calculator Display */}
                            {selectedPlan.price > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <CircleDollarSign className="size-5 text-green-600" />
                                  <span className="font-bold text-green-800">Your Commission</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-green-600">
                                    ₹{calculatedCommission.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                  {commissionListing}% of ₹{selectedPlan.price} ({selectedPlan.label} plan)
                                </p>
                              </motion.div>
                            )}

                            {selectedPlan.price === 0 && (
                              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
                                <p className="text-sm text-gray-500">Free plan selected — no commission earned</p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Submit */}
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleAddBusiness}
                            disabled={submittingBusiness || !businessForm.name || !businessForm.category}
                            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold shadow-lg shadow-[#D4AF37]/25 h-12 rounded-xl text-base"
                          >
                            {submittingBusiness ? (
                              <>
                                <Loader2 className="size-5 mr-2 animate-spin" />
                                Creating Listing...
                              </>
                            ) : (
                              <>
                                <Plus className="size-5 mr-2" />
                                Add Business Listing
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </GlassCard>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 3: My Referrals (Enhanced)
                ═══════════════════════════════════════════════════════ */}
                {agentTab === 'referrals' && (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-[#4169E1]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#6B8FF1] flex items-center justify-center shadow-md">
                              <Users className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Total Referred</p>
                          </div>
                          <p className="text-2xl font-bold text-[#4169E1]">{totalReferred}</p>
                          <p className="text-xs text-gray-400">businesses</p>
                        </div>
                      </motion.div>

                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-[#D4AF37]">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5D76E] flex items-center justify-center shadow-md">
                              <Crown className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Premium Referrals</p>
                          </div>
                          <p className="text-2xl font-bold text-[#D4AF37]">{activePremiumReferrals}</p>
                          <p className="text-xs text-gray-400">active premium</p>
                        </div>
                      </motion.div>

                      <motion.div {...fadeIn}>
                        <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-green-500">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center shadow-md">
                              <IndianRupee className="size-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium">Total Commission</p>
                          </div>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{totalReferralCommission.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400">from referrals</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Referrals Table */}
                    <GlassCard>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Users className="size-4 text-[#4169E1]" />
                          My Referrals
                          <Badge className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs ml-1">
                            {referrals.length}
                          </Badge>
                        </h3>
                      </div>

                      {loadingReferrals ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="size-6 text-[#D4AF37] animate-spin" />
                        </div>
                      ) : referrals.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#4169E1]/10 mx-auto mb-3 flex items-center justify-center">
                            <Users className="size-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 text-sm">No referrals yet. Start adding businesses!</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Business Name</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Plan</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Date Referred</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Status</th>
                                <th className="text-right py-3 px-2 font-medium text-gray-500 text-xs">Commission</th>
                              </tr>
                            </thead>
                            <tbody>
                              {referrals.map((ref) => {
                                const commission = getReferralCommission(ref)
                                return (
                                  <tr key={ref.id} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                                    <td className="py-3 px-2">
                                      <p className="font-medium text-gray-800">{ref.name}</p>
                                      <p className="text-xs text-gray-400">{ref.category}</p>
                                    </td>
                                    <td className="py-3 px-2">
                                      {getReferralPlanBadge(ref)}
                                    </td>
                                    <td className="py-3 px-2 text-gray-500 text-xs">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="size-3" />
                                        {new Date(ref.createdAt).toLocaleDateString('en-IN', {
                                          month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                      </div>
                                    </td>
                                    <td className="py-3 px-2">
                                      {ref.isApproved ? (
                                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                          <CheckCircle className="size-3 mr-0.5" />Approved
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                                          <AlertCircle className="size-3 mr-0.5" />Pending
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                      {commission > 0 ? (
                                        <span className="font-semibold text-green-600 text-sm">
                                          ₹{commission.toLocaleString('en-IN')}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 text-xs">₹0</span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    TAB 4: Payout History (Enhanced)
                ═══════════════════════════════════════════════════════ */}
                {agentTab === 'payouts' && (
                  <div className="space-y-6">
                    {/* Payout Summary */}
                    <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 md:p-6 border-l-4 border-l-[#D4AF37]">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Available for Payout</p>
                          <p className="text-3xl font-bold text-[#D4AF37]">
                            ₹{pendingPayout.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Min. payout: ₹{minPayoutAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => {
                              setPayoutUpiId(user.upiId || '')
                              setPayoutAmount('')
                              setShowPayoutDialog(true)
                            }}
                            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold shadow-lg"
                            disabled={pendingPayout < minPayoutAmount}
                          >
                            <CreditCard className="size-4 mr-2" />
                            Request Payout
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Payout History Table */}
                    <GlassCard>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="size-4 text-[#4169E1]" />
                        Payout History
                      </h3>

                      {loadingPayouts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="size-6 text-[#D4AF37] animate-spin" />
                        </div>
                      ) : payouts.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#4169E1]/10 mx-auto mb-3 flex items-center justify-center">
                            <CreditCard className="size-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 text-sm">No payout requests yet</p>
                          <p className="text-gray-400 text-xs mt-1">
                            Minimum ₹{minPayoutAmount} required to request a payout
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Amount</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Status</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">UPI ID</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Date</th>
                                <th className="text-left py-3 px-2 font-medium text-gray-500 text-xs">Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {payouts.map((payout) => (
                                <tr key={payout.id} className="border-b border-gray-50 hover:bg-white/50 transition-colors">
                                  <td className="py-3 px-2">
                                    <span className="font-bold text-gray-800">
                                      ₹{payout.amount.toLocaleString('en-IN')}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">
                                    {getPayoutStatusBadge(payout.status)}
                                  </td>
                                  <td className="py-3 px-2 text-gray-600 text-xs font-mono">
                                    {payout.upiId || '-'}
                                  </td>
                                  <td className="py-3 px-2 text-gray-500 text-xs">
                                    {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                                      month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-3 px-2 text-gray-400 text-xs max-w-[150px] truncate">
                                    {payout.note || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Payout Request Dialog (Enhanced) ───────────────────── */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-[#D4AF37]" />
              Request Payout
            </DialogTitle>
            <DialogDescription>
              Enter the amount and your UPI ID to request a payout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
              <p className="text-xs text-gray-500">Available Balance</p>
              <p className="text-xl font-bold text-[#D4AF37]">
                ₹{pendingPayout.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Min. payout: ₹{minPayoutAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payout-amount" className="text-sm font-medium">Amount (₹)</Label>
              <Input
                id="payout-amount"
                type="number"
                placeholder={`Min. ₹${minPayoutAmount}`}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min={minPayoutAmount}
                max={pendingPayout}
                className="rounded-xl"
              />
              {payoutAmount && parseFloat(payoutAmount) < minPayoutAmount && (
                <p className="text-xs text-red-500">Minimum amount is ₹{minPayoutAmount}</p>
              )}
              {payoutAmount && parseFloat(payoutAmount) > pendingPayout && (
                <p className="text-xs text-red-500">Exceeds available balance</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payout-upi" className="text-sm font-medium">UPI ID</Label>
              <Input
                id="payout-upi"
                placeholder="e.g. yourname@upi"
                value={payoutUpiId}
                onChange={(e) => setPayoutUpiId(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPayoutDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestPayout}
              disabled={submittingPayout || !payoutAmount || parseFloat(payoutAmount) < minPayoutAmount || parseFloat(payoutAmount) > pendingPayout}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold rounded-xl"
            >
              {submittingPayout ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Commission Success Dialog ─────────────────────────── */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="size-6 text-green-600" />
              </div>
            </DialogTitle>
            <DialogDescription className="text-center sr-only">
              Business listing created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-3 py-4">
            <h3 className="text-lg font-bold text-gray-800">
              Business Listed Successfully!
            </h3>
            <p className="text-sm text-gray-500">
              &quot;{lastBusinessName}&quot; has been created and is pending approval.
            </p>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mx-4">
              <p className="text-xs text-green-600 font-medium mb-1">Commission Earned</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{lastCommission.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {commissionListing}% of {selectedPlan.label} plan (₹{selectedPlan.price})
              </p>
            </div>
          </div>
          <DialogFooter className="justify-center">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-bold rounded-xl px-8"
            >
              <CheckCircle className="size-4 mr-2" />
              Great!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
