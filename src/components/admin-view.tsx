'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  BarChart3, Building2, Shield, Inbox, Gamepad2, Settings,
  Users, Store, TrendingUp, Phone, CheckCircle, XCircle,
  Star, Crown, Eye, Plus, Save, Loader2, FileText,
  Download, Trash2, Edit3, Megaphone, Image as ImageIcon,
  Ambulance, AlertTriangle, Coins, Palette, Globe,
  Bold, Italic, Heading2, Link2, List, ListOrdered,
  ExternalLink, Send, ToggleLeft, ChevronDown,
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { GlassCard } from '@/components/glass-card'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Stats {
  totalUsers: number
  totalListings: number
  totalLeads: number
  totalActiveSubscriptions: number
  totalRevenue: number
  approvedListings: number
  featuredListings: number
  premiumListings: number
  totalReviews: number
  averageRating: number
  userGrowth: Array<{ month: string; users: number }>
  revenueGrowth: Array<{ month: string; revenue: number }>
  leadsByStatus: Array<{ status: string; count: number }>
  listingsByCategory: Array<{ category: string; count: number }>
  subscriptionsByPlan: Array<{ plan: string; count: number }>
  usersByRole: Array<{ role: string; count: number }>
  cities: Array<{
    id: string
    name: string
    slug: string
    _count: { listings: number; users: number; news: number; stories: number }
  }>
}

interface AdminListing {
  id: string
  slug: string
  name: string
  category: string
  images?: string | null
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  createdAt: string
  user: { id: string; fullName: string; phone: string; email?: string }
  city: { id: string; name: string; slug: string }
  _count: { reviews: number; leads: number }
}

interface RealEstateListing {
  id: string
  title: string
  price: string
  images?: string | null
  ownerPhone: string
  bedroomCount?: number | null
  area?: string | null
  isApproved: boolean
  isFeatured: boolean
  createdAt: string
  user: { id: string; fullName: string; phone: string }
  city: { id: string; name: string; slug: string }
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

interface CityData {
  id: string
  name: string
  slug: string
  state: string
  heroImageUrl?: string | null
  _count: { listings: number; users: number }
}

interface SiteSettings {
  id: string
  logoUrl: string | null
  affiliateBaseUrl: string | null
  heroHeadline: string | null
  heroDescription: string | null
  primaryColor: string
  accentColor: string
  heroImageUrl?: string | null
}

interface SpinPrize {
  id: string
  label: string
  prizeType: string
  prizeValue: number
  probability: number
  color: string
  isActive: boolean
}

interface NewsArticle {
  id: string
  title: string
  content: string | null
  imageUrl: string | null
  source: string | null
  isPublished: boolean
  createdAt: string
  cityId: string
  city: { id: string; name: string; slug: string }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdminView() {
  const { adminTab, setAdminTab } = useAppStore()

  // ─── Shared State ──────────────────────────────────────────────────────────
  const [stats, setStats] = useState<Stats | null>(null)
  const [cities, setCities] = useState<CityData[]>([])

  // ─── Tab 1: Overview ───────────────────────────────────────────────────────
  const [statsLoading, setStatsLoading] = useState(true)

  // ─── Tab 2: City Manager ───────────────────────────────────────────────────
  const [newCityName, setNewCityName] = useState('')
  const [newCitySlug, setNewCitySlug] = useState('')
  const [newCityState, setNewCityState] = useState('Telangana')
  const [newCityHero, setNewCityHero] = useState('')
  const [addingCity, setAddingCity] = useState(false)
  const [deleteCityDialog, setDeleteCityDialog] = useState<string | null>(null)

  // ─── Tab 3: Listing Moderation ─────────────────────────────────────────────
  const [modSubTab, setModSubTab] = useState('business')
  const [listingFilter, setListingFilter] = useState('all')
  const [adminListings, setAdminListings] = useState<AdminListing[]>([])
  const [reListings, setReListings] = useState<RealEstateListing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // ─── Tab 4: Lead CRM ───────────────────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadStatusFilter, setLeadStatusFilter] = useState('all')
  const [exportingLeads, setExportingLeads] = useState(false)

  // ─── Tab 5: Content CMS ────────────────────────────────────────────────────
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null)
  const [newsForm, setNewsForm] = useState({
    title: '',
    cityId: '',
    content: '',
    imageUrl: '',
    source: '',
    isPublished: true,
  })
  const [savingNews, setSavingNews] = useState(false)
  const [deleteNewsDialog, setDeleteNewsDialog] = useState<string | null>(null)

  // ─── Tab 6: Gamification ───────────────────────────────────────────────────
  const [spinPrizes, setSpinPrizes] = useState<SpinPrize[]>([])
  const [coinValues, setCoinValues] = useState({ daily: 5, review: 10, share: 3 })
  const [savingCoinValues, setSavingCoinValues] = useState(false)
  const [prizeForm, setPrizeForm] = useState({
    label: '', prizeType: 'coins', prizeValue: 0, probability: 0.1, color: '#D4AF37',
  })
  const [showPrizeForm, setShowPrizeForm] = useState(false)
  const [editingPrize, setEditingPrize] = useState<SpinPrize | null>(null)
  const [savingPrize, setSavingPrize] = useState(false)
  const [deletePrizeDialog, setDeletePrizeDialog] = useState<string | null>(null)

  // ─── Tab 7: Settings ───────────────────────────────────────────────────────
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [sosContacts, setSosContacts] = useState({
    ambulance: '108', police: '100', fire: '101', womenHelpline: '181',
  })
  const [customSosContacts, setCustomSosContacts] = useState<Array<{ name: string; phone: string }>>([])

  // ─── TipTap Editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your news article here... Supports Telugu typing!' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setNewsForm((prev) => ({ ...prev, content: editor.getHTML() }))
    },
  })

  // When editing news, set editor content
  useEffect(() => {
    if (editingNews && editor) {
      editor.commands.setContent(editingNews.content || '')
      setNewsForm({
        title: editingNews.title,
        cityId: editingNews.cityId,
        content: editingNews.content || '',
        imageUrl: editingNews.imageUrl || '',
        source: editingNews.source || '',
        isPublished: editingNews.isPublished,
      })
    } else if (!editingNews && editor) {
      editor.commands.setContent('')
      setNewsForm({ title: '', cityId: '', content: '', imageUrl: '', source: '', isPublished: true })
    }
  }, [editingNews, editor])

  // ─── Fetch Stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    setStatsLoading(true)
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  // ─── Fetch Cities ──────────────────────────────────────────────────────────
  const fetchCities = useCallback(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => { fetchCities() }, [fetchCities])

  // ─── Fetch Business Listings ───────────────────────────────────────────────
  const fetchAdminListings = useCallback(() => {
    setListingsLoading(true)
    const params = new URLSearchParams()
    if (listingFilter !== 'all') params.set('status', listingFilter)
    params.set('limit', '50')
    fetch(`/api/admin/listings?${params}`)
      .then((res) => res.json())
      .then((data) => setAdminListings(data.listings || []))
      .catch(() => {})
      .finally(() => setListingsLoading(false))
  }, [listingFilter])

  useEffect(() => { fetchAdminListings() }, [fetchAdminListings])

  // ─── Fetch Real Estate Listings ────────────────────────────────────────────
  const fetchReListings = useCallback(() => {
    setListingsLoading(true)
    const params = new URLSearchParams()
    if (listingFilter !== 'all') params.set('status', listingFilter)
    fetch(`/api/admin/realestate?${params}`)
      .then((res) => res.json())
      .then((data) => setReListings(data.listings || []))
      .catch(() => {})
      .finally(() => setListingsLoading(false))
  }, [listingFilter])

  useEffect(() => {
    if (modSubTab === 'business') fetchAdminListings()
    else fetchReListings()
  }, [modSubTab, fetchAdminListings, fetchReListings])

  // ─── Fetch Leads ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // ─── Fetch News ────────────────────────────────────────────────────────────
  const fetchNews = useCallback(() => {
    setNewsLoading(true)
    fetch('/api/admin/news?all=true')
      .then((res) => res.json())
      .then((data) => setNewsArticles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setNewsLoading(false))
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  // ─── Fetch Spin Prizes ─────────────────────────────────────────────────────
  const fetchSpinPrizes = useCallback(() => {
    fetch('/api/admin/spin-prizes')
      .then((res) => res.json())
      .then((data) => setSpinPrizes(Array.isArray(data) ? data : []))
      .catch(() => {
        // Fallback default prizes
        setSpinPrizes([
          { id: '1', label: '50 Coins', prizeType: 'coins', prizeValue: 50, probability: 0.15, color: '#D4AF37', isActive: true },
          { id: '2', label: '20 Coins', prizeType: 'coins', prizeValue: 20, probability: 0.25, color: '#4169E1', isActive: true },
          { id: '3', label: '10 Coins', prizeType: 'coins', prizeValue: 10, probability: 0.25, color: '#50C878', isActive: true },
          { id: '4', label: '5 Coins', prizeType: 'coins', prizeValue: 5, probability: 0.15, color: '#FF6B6B', isActive: true },
          { id: '5', label: 'Free Listing', prizeType: 'free_listing', prizeValue: 0, probability: 0.05, color: '#9B59B6', isActive: true },
          { id: '6', label: 'Discount 25%', prizeType: 'discount', prizeValue: 25, probability: 0.05, color: '#E67E22', isActive: true },
          { id: '7', label: 'Try Again', prizeType: 'none', prizeValue: 0, probability: 0.07, color: '#95A5A6', isActive: true },
          { id: '8', label: '100 Coins', prizeType: 'coins', prizeValue: 100, probability: 0.03, color: '#FFD700', isActive: true },
        ])
      })
  }, [])

  useEffect(() => { fetchSpinPrizes() }, [fetchSpinPrizes])

  // ─── Fetch Settings ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data)
        if (data.heroImageUrl) setHeroImageUrl(data.heroImageUrl)
      })
      .catch(() => {})
  }, [])

  // ─── Action Handlers ───────────────────────────────────────────────────────

  const handleListingAction = async (listingId: string, action: string, isRealestate = false) => {
    try {
      const endpoint = isRealestate ? '/api/admin/realestate' : '/api/admin/listings'
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, action }),
      })
      if (res.ok) {
        toast.success(`Listing ${action} successful`)
        if (isRealestate) fetchReListings()
        else fetchAdminListings()
      } else {
        toast.error('Action failed')
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const handleAddCity = async () => {
    if (!newCityName || !newCitySlug) return
    setAddingCity(true)
    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCityName,
          slug: newCitySlug,
          state: newCityState,
          heroImageUrl: newCityHero || undefined,
        }),
      })
      if (res.ok) {
        toast.success(`City "${newCityName}" added!`)
        setNewCityName('')
        setNewCitySlug('')
        setNewCityState('Telangana')
        setNewCityHero('')
        fetchCities()
      } else {
        toast.error('Failed to add city')
      }
    } catch {
      toast.error('Failed to add city')
    } finally {
      setAddingCity(false)
    }
  }

  const handleDeleteCity = async (cityId: string) => {
    try {
      const res = await fetch(`/api/cities?id=${cityId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('City deleted')
        fetchCities()
      } else {
        toast.error('Failed to delete city')
      }
    } catch {
      toast.error('Failed to delete city')
    }
    setDeleteCityDialog(null)
  }

  const handleExportLeads = async () => {
    setExportingLeads(true)
    try {
      const res = await fetch('/api/admin/leads/export')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'choutuppal-leads.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Leads exported successfully')
    } catch {
      toast.error('Failed to export leads')
    } finally {
      setExportingLeads(false)
    }
  }

  const handleSaveNews = async () => {
    if (!newsForm.title || !newsForm.cityId) {
      toast.error('Title and City are required')
      return
    }
    setSavingNews(true)
    try {
      const payload = {
        ...(editingNews ? { id: editingNews.id } : {}),
        title: newsForm.title,
        cityId: newsForm.cityId,
        content: newsForm.content,
        imageUrl: newsForm.imageUrl || null,
        source: newsForm.source || null,
        isPublished: newsForm.isPublished,
      }
      const res = await fetch('/api/admin/news', {
        method: editingNews ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editingNews ? 'News updated!' : 'News created!')
        setEditingNews(null)
        if (editor) editor.commands.setContent('')
        setNewsForm({ title: '', cityId: '', content: '', imageUrl: '', source: '', isPublished: true })
        fetchNews()
      } else {
        toast.error('Failed to save news')
      }
    } catch {
      toast.error('Failed to save news')
    } finally {
      setSavingNews(false)
    }
  }

  const handleDeleteNews = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('News deleted')
        fetchNews()
      } else {
        toast.error('Failed to delete news')
      }
    } catch {
      toast.error('Failed to delete news')
    }
    setDeleteNewsDialog(null)
  }

  const handleSavePrize = async () => {
    if (!prizeForm.label || !prizeForm.prizeType) {
      toast.error('Label and Prize Type are required')
      return
    }
    setSavingPrize(true)
    try {
      const payload = editingPrize
        ? { id: editingPrize.id, ...prizeForm }
        : prizeForm
      const res = await fetch('/api/admin/spin-prizes', {
        method: editingPrize ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editingPrize ? 'Prize updated!' : 'Prize created!')
        setShowPrizeForm(false)
        setEditingPrize(null)
        setPrizeForm({ label: '', prizeType: 'coins', prizeValue: 0, probability: 0.1, color: '#D4AF37' })
        fetchSpinPrizes()
      } else {
        toast.error('Failed to save prize')
      }
    } catch {
      toast.error('Failed to save prize')
    } finally {
      setSavingPrize(false)
    }
  }

  const handleDeletePrize = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/spin-prizes?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Prize deleted')
        fetchSpinPrizes()
      } else {
        toast.error('Failed to delete prize')
      }
    } catch {
      toast.error('Failed to delete prize')
    }
    setDeletePrizeDialog(null)
  }

  const handleTogglePrizeActive = async (prize: SpinPrize) => {
    try {
      await fetch('/api/admin/spin-prizes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prize.id, isActive: !prize.isActive }),
      })
      fetchSpinPrizes()
    } catch {
      toast.error('Failed to toggle prize')
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          heroImageUrl: heroImageUrl || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Settings saved!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    setBroadcasting(true)
    setBroadcastResult(null)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastMsg }),
      })
      const data = await res.json()
      if (res.ok) {
        setBroadcastResult(`Sent to ${data.sent} subscribers`)
        toast.success('Broadcast sent!')
        setBroadcastMsg('')
      } else {
        setBroadcastResult('Failed to send broadcast')
      }
    } catch {
      setBroadcastResult('Failed to send broadcast')
    } finally {
      setBroadcasting(false)
    }
  }

  // ─── Helper Functions ──────────────────────────────────────────────────────

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

  const getListingStatusBadge = (listing: AdminListing | RealEstateListing) => {
    if ('isPremium' in listing && listing.isPremium) return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Premium</Badge>
    if (listing.isFeatured) return <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">Featured</Badge>
    if (listing.isApproved) return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
    return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Pending</Badge>
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

  const filteredLeads = leadStatusFilter === 'all'
    ? leads
    : leads.filter((l) => l.status === leadStatusFilter)

  // ─── Animation Variants ────────────────────────────────────────────────────
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Admin header */}
      <GlassCard variant="gold">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Manage your Choutuppal 2.0 Super App</p>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="w-full flex flex-nowrap h-auto gap-1 bg-white/40 backdrop-blur-xl border border-white/30 p-1 rounded-xl">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="size-3.5 mr-1" />Overview
            </TabsTrigger>
            <TabsTrigger value="cities" className="text-xs sm:text-sm">
              <Building2 className="size-3.5 mr-1" />Cities
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs sm:text-sm">
              <Shield className="size-3.5 mr-1" />Moderate
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-xs sm:text-sm">
              <Inbox className="size-3.5 mr-1" />Leads
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">
              <FileText className="size-3.5 mr-1" />Content
            </TabsTrigger>
            <TabsTrigger value="gamification" className="text-xs sm:text-sm">
              <Gamepad2 className="size-3.5 mr-1" />Games
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="size-3.5 mr-1" />Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW DASHBOARD
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#4169E1', prefix: '' },
              { label: 'Active Subscriptions', value: stats?.totalActiveSubscriptions || 0, icon: Crown, color: '#D4AF37', prefix: '' },
              { label: 'Total Revenue', value: stats?.totalRevenue || 0, icon: TrendingUp, color: '#50C878', prefix: '₹' },
              { label: 'Total Leads', value: stats?.totalLeads || 0, icon: Phone, color: '#FF6B6B', prefix: '' },
            ].map((stat) => (
              <motion.div key={stat.label} {...fadeIn}>
                <GlassCard className="text-center !p-4">
                  <div
                    className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="size-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-7 bg-gray-100 animate-pulse rounded" />
                    ) : (
                      `${stat.prefix}${stat.value.toLocaleString('en-IN')}`
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Line Chart */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="size-4 text-[#4169E1]" />
                User Growth
              </h3>
              <div className="h-64">
                {(stats?.userGrowth && stats.userGrowth.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#4169E1"
                        strokeWidth={2}
                        dot={{ fill: '#4169E1', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {statsLoading ? 'Loading...' : 'No data available'}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Revenue Bar Chart */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-[#50C878]" />
                Revenue Over Time
              </h3>
              <div className="h-64">
                {(stats?.revenueGrowth && stats.revenueGrowth.length > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                        }}
                        formatter={(value: number) => [`₹${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {statsLoading ? 'Loading...' : 'No data available'}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Leads by Status + Subscriptions by Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Leads by Status - Horizontal Bars */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Inbox className="size-4 text-[#FF6B6B]" />
                Leads by Status
              </h3>
              <div className="space-y-3">
                {stats?.leadsByStatus && stats.leadsByStatus.length > 0 ? (
                  stats.leadsByStatus.map((item) => {
                    const maxCount = Math.max(...stats.leadsByStatus.map((s) => s.count), 1)
                    const pct = (item.count / maxCount) * 100
                    const statusColors: Record<string, string> = {
                      new: '#4169E1', contacted: '#D4AF37', converted: '#50C878', lost: '#FF6B6B',
                    }
                    const color = statusColors[item.status] || '#95A5A6'
                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize text-gray-700">{item.status}</span>
                          <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    {statsLoading ? 'Loading...' : 'No leads data'}
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Subscriptions by Plan */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Crown className="size-4 text-[#D4AF37]" />
                Subscriptions by Plan
              </h3>
              <div className="space-y-2">
                {stats?.subscriptionsByPlan && stats.subscriptionsByPlan.length > 0 ? (
                  stats.subscriptionsByPlan.map((item) => {
                    const planColors: Record<string, string> = {
                      free: '#95A5A6', pro: '#4169E1', premium: '#D4AF37',
                    }
                    return (
                      <div key={item.plan} className="flex items-center justify-between p-2.5 rounded-lg bg-white/50">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: planColors[item.plan] || '#95A5A6' }} />
                          <span className="text-sm capitalize text-gray-700">{item.plan}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    {statsLoading ? 'Loading...' : 'No subscription data'}
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 2: MULTI-CITY MANAGER
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="cities" className="mt-4 space-y-4">
          {/* Add City Form */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="size-4 text-[#D4AF37]" />
              Add New City
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">City Name</Label>
                <Input
                  placeholder="e.g. Nalgonda"
                  value={newCityName}
                  onChange={(e) => {
                    setNewCityName(e.target.value)
                    setNewCitySlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                  }}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Slug</Label>
                <Input
                  placeholder="e.g. nalgonda"
                  value={newCitySlug}
                  onChange={(e) => setNewCitySlug(e.target.value)}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">State</Label>
                <Input
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Hero Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={newCityHero}
                  onChange={(e) => setNewCityHero(e.target.value)}
                  className="bg-white/50 border-white/40"
                />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button
                onClick={handleAddCity}
                disabled={addingCity || !newCityName || !newCitySlug}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
              >
                {addingCity ? <><Loader2 className="size-4 mr-2 animate-spin" />Adding...</> : <><Plus className="size-4 mr-2" />Add City</>}
              </Button>
            </motion.div>
          </GlassCard>

          {/* Cities Table */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Globe className="size-4 text-[#4169E1]" />
              All Cities
              <Badge variant="secondary" className="ml-1">{cities.length}</Badge>
            </h3>
            {cities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No cities yet. Add your first city above.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Listings</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">{city.name}</TableCell>
                        <TableCell className="text-gray-500">{city.slug}</TableCell>
                        <TableCell className="text-gray-500">{city.state}</TableCell>
                        <TableCell><Badge variant="secondary">{city._count.listings}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{city._count.users}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Dialog open={deleteCityDialog === city.id} onOpenChange={(open) => !open && setDeleteCityDialog(null)}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteCityDialog(city.id)}
                                className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="size-3 mr-0.5" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete City</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;{city.name}&quot;? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteCityDialog(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={() => handleDeleteCity(city.id)}>Delete</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 3: LISTING MODERATION
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="moderation" className="mt-4 space-y-4">
          <GlassCard>
            {/* Sub-tabs for Business / Real Estate */}
            <Tabs value={modSubTab} onValueChange={setModSubTab} className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <TabsList className="bg-gray-100/50">
                  <TabsTrigger value="business" className="text-xs">
                    <Store className="size-3.5 mr-1" />Business
                  </TabsTrigger>
                  <TabsTrigger value="realestate" className="text-xs">
                    <Building2 className="size-3.5 mr-1" />Real Estate
                  </TabsTrigger>
                </TabsList>
                <Select value={listingFilter} onValueChange={setListingFilter}>
                  <SelectTrigger className="w-[140px] bg-white/50 border-white/40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Business Listings */}
              <TabsContent value="business">
                {listingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
                  </div>
                ) : adminListings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No {listingFilter === 'all' ? '' : listingFilter} business listings</p>
                ) : (
                  <div className="overflow-x-auto max-h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminListings.map((listing) => {
                          const img = getFirstImage(listing.images)
                          return (
                            <TableRow key={listing.id}>
                              <TableCell>
                                {img ? (
                                  <Image src={img} alt={listing.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Store className="size-4 text-gray-400" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-sm max-w-[150px] truncate">{listing.name}</p>
                              </TableCell>
                              <TableCell className="text-sm">{listing.city.name}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">{listing.category}</Badge>
                              </TableCell>
                              <TableCell>{getListingStatusBadge(listing)}</TableCell>
                              <TableCell className="text-sm">{listing.user.fullName}</TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {!listing.isApproved && (
                                    <motion.div whileTap={{ scale: 0.9 }}>
                                      <Button
                                        size="sm" variant="outline"
                                        onClick={() => handleListingAction(listing.id, 'approve')}
                                        className="h-7 text-xs border-green-300 text-green-600 hover:bg-green-50"
                                      >
                                        <CheckCircle className="size-3 mr-0.5" />Approve
                                      </Button>
                                    </motion.div>
                                  )}
                                  {listing.isApproved && (
                                    <Dialog open={rejectDialogId === listing.id} onOpenChange={(open) => { if (!open) setRejectDialogId(null) }}>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm" variant="outline"
                                          onClick={() => setRejectDialogId(listing.id)}
                                          className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                          <XCircle className="size-3 mr-0.5" />Reject
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Reject Listing</DialogTitle>
                                          <DialogDescription>Provide a reason for rejecting &quot;{listing.name}&quot;</DialogDescription>
                                        </DialogHeader>
                                        <Textarea
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                          placeholder="Reason for rejection..."
                                          rows={3}
                                        />
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setRejectDialogId(null)}>Cancel</Button>
                                          <Button variant="destructive" onClick={() => { handleListingAction(listing.id, 'reject'); setRejectDialogId(null); setRejectReason('') }}>
                                            Reject
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                      size="sm" variant="outline"
                                      onClick={() => handleListingAction(listing.id, listing.isFeatured ? 'unfeature' : 'feature')}
                                      className="h-7 text-xs border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5"
                                    >
                                      <Star className="size-3 mr-0.5" />{listing.isFeatured ? 'Unfeature' : 'Feature'}
                                    </Button>
                                  </motion.div>
                                  {'isPremium' in listing && !listing.isPremium && (
                                    <motion.div whileTap={{ scale: 0.9 }}>
                                      <Button
                                        size="sm" variant="outline"
                                        onClick={() => handleListingAction(listing.id, 'makePremium')}
                                        className="h-7 text-xs border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/5"
                                      >
                                        <Crown className="size-3 mr-0.5" />Premium
                                      </Button>
                                    </motion.div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Real Estate Listings */}
              <TabsContent value="realestate">
                {listingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
                  </div>
                ) : reListings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No {listingFilter === 'all' ? '' : listingFilter} real estate listings</p>
                ) : (
                  <div className="overflow-x-auto max-h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reListings.map((listing) => {
                          const img = getFirstImage(listing.images)
                          return (
                            <TableRow key={listing.id}>
                              <TableCell>
                                {img ? (
                                  <Image src={img} alt={listing.title} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Building2 className="size-4 text-gray-400" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-sm max-w-[150px] truncate">{listing.title}</p>
                                {listing.bedroomCount && <p className="text-xs text-gray-400">{listing.bedroomCount} BHK</p>}
                              </TableCell>
                              <TableCell className="text-sm">{listing.city.name}</TableCell>
                              <TableCell className="text-sm font-medium text-[#D4AF37]">{listing.price}</TableCell>
                              <TableCell>{getListingStatusBadge(listing)}</TableCell>
                              <TableCell className="text-sm">{listing.user.fullName}</TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {!listing.isApproved && (
                                    <motion.div whileTap={{ scale: 0.9 }}>
                                      <Button
                                        size="sm" variant="outline"
                                        onClick={() => handleListingAction(listing.id, 'approve', true)}
                                        className="h-7 text-xs border-green-300 text-green-600 hover:bg-green-50"
                                      >
                                        <CheckCircle className="size-3 mr-0.5" />Approve
                                      </Button>
                                    </motion.div>
                                  )}
                                  {listing.isApproved && (
                                    <motion.div whileTap={{ scale: 0.9 }}>
                                      <Button
                                        size="sm" variant="outline"
                                        onClick={() => handleListingAction(listing.id, 'reject', true)}
                                        className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                      >
                                        <XCircle className="size-3 mr-0.5" />Reject
                                      </Button>
                                    </motion.div>
                                  )}
                                  <motion.div whileTap={{ scale: 0.9 }}>
                                    <Button
                                      size="sm" variant="outline"
                                      onClick={() => handleListingAction(listing.id, listing.isFeatured ? 'unfeature' : 'feature', true)}
                                      className="h-7 text-xs border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5"
                                    >
                                      <Star className="size-3 mr-0.5" />{listing.isFeatured ? 'Unfeature' : 'Feature'}
                                    </Button>
                                  </motion.div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </GlassCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 4: LEAD CRM
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="leads" className="mt-4 space-y-4">
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Inbox className="size-5 text-[#4169E1]" />
                Lead CRM
                <Badge variant="secondary" className="ml-1">{leads.length}</Badge>
              </h3>
              <div className="flex gap-2 items-center">
                <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
                  <SelectTrigger className="w-[130px] bg-white/50 border-white/40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleExportLeads}
                  disabled={exportingLeads}
                  className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white h-8 text-xs"
                >
                  {exportingLeads ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Download className="size-3.5 mr-1" />}
                  Export CSV
                </Button>
              </div>
            </div>

            {filteredLeads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No leads found</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Property / Business</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="text-xs text-gray-400 font-mono max-w-[80px] truncate">
                          {lead.id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium max-w-[150px] truncate">{lead.listing.name}</p>
                          <p className="text-xs text-gray-400">{lead.listing.category}</p>
                        </TableCell>
                        <TableCell className="text-sm text-[#4169E1]">
                          <a href={`tel:${lead.customerPhone}`} className="hover:underline">{lead.customerPhone}</a>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[150px] truncate">
                          {lead.requirementText || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs capitalize">{lead.source}</Badge>
                        </TableCell>
                        <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 5: CONTENT CMS (NEWS & BLOGS)
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="content" className="mt-4 space-y-4">
          {/* TipTap Editor Form */}
          <GlassCard variant="gold">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="size-4 text-[#D4AF37]" />
              {editingNews ? 'Edit Article' : 'Create New Article'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Title</Label>
                  <Input
                    placeholder="Article title..."
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="bg-white/50 border-white/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">City</Label>
                  <Select value={newsForm.cityId} onValueChange={(val) => setNewsForm({ ...newsForm, cityId: val })}>
                    <SelectTrigger className="bg-white/50 border-white/40">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={newsForm.imageUrl}
                    onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                    className="bg-white/50 border-white/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Source</Label>
                  <Input
                    placeholder="e.g. Eenadu, The Hindu"
                    value={newsForm.source}
                    onChange={(e) => setNewsForm({ ...newsForm, source: e.target.value })}
                    className="bg-white/50 border-white/40"
                  />
                </div>
              </div>

              {/* TipTap Toolbar */}
              <div className="space-y-1.5">
                <Label className="text-sm">Content</Label>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
                    <Button
                      type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      data-active={editor?.isActive('bold')}
                    >
                      <Bold className="size-3.5" />
                    </Button>
                    <Button
                      type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      data-active={editor?.isActive('italic')}
                    >
                      <Italic className="size-3.5" />
                    </Button>
                    <Button
                      type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                      data-active={editor?.isActive('heading', { level: 2 })}
                    >
                      <Heading2 className="size-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button
                      type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={() => {
                        const url = window.prompt('Enter URL:')
                        if (url) editor?.chain().focus().setLink({ href: url }).run()
                      }}
                      data-active={editor?.isActive('link')}
                    >
                      <Link2 className="size-3.5" />
                    </Button>
                    <Button
                      type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      data-active={editor?.isActive('bulletList')}
                    >
                      <List className="size-3.5" />
                    </Button>
                    <Button
                      type="button" variant="ghost" size="sm" className="h-7 w-7 p-0"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      data-active={editor?.isActive('orderedList')}
                    >
                      <ListOrdered className="size-3.5" />
                    </Button>
                  </div>

                  {/* Editor Content */}
                  <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none p-3 min-h-[200px] focus:outline-none [&_.tiptap]:min-h-[180px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400 [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
                  />
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  Auto-Affiliate: Keywords like &quot;mobile&quot;, &quot;laptop&quot;, &quot;AC&quot; will be automatically linked to Amazon affiliate URLs on save.
                </p>
              </div>

              {/* Published Toggle + Save */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={newsForm.isPublished}
                    onCheckedChange={(checked) => setNewsForm({ ...newsForm, isPublished: checked })}
                  />
                  <Label className="text-sm">
                    {newsForm.isPublished ? 'Published' : 'Draft'}
                  </Label>
                </div>
                <div className="flex gap-2">
                  {editingNews && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingNews(null)
                        if (editor) editor.commands.setContent('')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSaveNews}
                      disabled={savingNews || !newsForm.title || !newsForm.cityId}
                      className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                    >
                      {savingNews ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                      {editingNews ? 'Update Article' : 'Publish Article'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* News Articles List */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="size-4 text-[#4169E1]" />
              All Articles
              <Badge variant="secondary" className="ml-1">{newsArticles.length}</Badge>
            </h3>
            {newsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#4169E1]" />
              </div>
            ) : newsArticles.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No articles yet. Create your first article above.</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {article.imageUrl && (
                              <Image src={article.imageUrl} alt="" width={32} height={32} className="w-8 h-8 rounded object-cover shrink-0" />
                            )}
                            <p className="font-medium text-sm max-w-[200px] truncate">{article.title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{article.city?.name || '-'}</TableCell>
                        <TableCell>
                          {article.isPublished ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Published</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 border-gray-200">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(article.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm" variant="outline"
                              onClick={() => setEditingNews(article)}
                              className="h-7 text-xs border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/5"
                            >
                              <Edit3 className="size-3 mr-0.5" />Edit
                            </Button>
                            <Dialog open={deleteNewsDialog === article.id} onOpenChange={(open) => { if (!open) setDeleteNewsDialog(null) }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm" variant="outline"
                                  onClick={() => setDeleteNewsDialog(article.id)}
                                  className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="size-3 mr-0.5" />Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Article</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete &quot;{article.title}&quot;?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDeleteNewsDialog(null)}>Cancel</Button>
                                  <Button variant="destructive" onClick={() => handleDeleteNews(article.id)}>Delete</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 6: GAMIFICATION MANAGER
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="gamification" className="mt-4 space-y-4">
          {/* Coin Values Section */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Coins className="size-4 text-[#D4AF37]" />
              Coin Reward Values
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Daily Check-in (coins)</Label>
                <Input
                  type="number"
                  value={coinValues.daily}
                  onChange={(e) => setCoinValues({ ...coinValues, daily: parseInt(e.target.value) || 0 })}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Review (coins)</Label>
                <Input
                  type="number"
                  value={coinValues.review}
                  onChange={(e) => setCoinValues({ ...coinValues, review: parseInt(e.target.value) || 0 })}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Share (coins)</Label>
                <Input
                  type="number"
                  value={coinValues.share}
                  onChange={(e) => setCoinValues({ ...coinValues, share: parseInt(e.target.value) || 0 })}
                  className="bg-white/50 border-white/40"
                />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button
                onClick={() => {
                  setSavingCoinValues(true)
                  setTimeout(() => {
                    toast.success('Coin values saved!')
                    setSavingCoinValues(false)
                  }, 500)
                }}
                disabled={savingCoinValues}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
              >
                {savingCoinValues ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                Save Coin Values
              </Button>
            </motion.div>
          </GlassCard>

          {/* Spin Wheel Prizes Section */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Gamepad2 className="size-4 text-[#4169E1]" />
                Spin Wheel Prizes
                <Badge variant="secondary" className="ml-1">{spinPrizes.length}</Badge>
              </h3>
              <Button
                size="sm"
                onClick={() => {
                  setEditingPrize(null)
                  setPrizeForm({ label: '', prizeType: 'coins', prizeValue: 0, probability: 0.1, color: '#D4AF37' })
                  setShowPrizeForm(true)
                }}
                className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white h-8 text-xs"
              >
                <Plus className="size-3.5 mr-1" />Add Prize
              </Button>
            </div>

            {/* Add/Edit Prize Form */}
            <AnimatePresence>
              {showPrizeForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 rounded-xl bg-gray-50/80 border border-gray-200 space-y-3"
                >
                  <h4 className="text-sm font-semibold text-gray-700">
                    {editingPrize ? 'Edit Prize' : 'New Prize'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={prizeForm.label}
                        onChange={(e) => setPrizeForm({ ...prizeForm, label: e.target.value })}
                        placeholder="e.g. 50 Coins"
                        className="h-8 text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prize Type</Label>
                      <Select value={prizeForm.prizeType} onValueChange={(val) => setPrizeForm({ ...prizeForm, prizeType: val })}>
                        <SelectTrigger className="h-8 text-sm bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coins">Coins</SelectItem>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="free_listing">Free Listing</SelectItem>
                          <SelectItem value="none">None (Try Again)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      <Input
                        type="number"
                        value={prizeForm.prizeValue}
                        onChange={(e) => setPrizeForm({ ...prizeForm, prizeValue: parseInt(e.target.value) || 0 })}
                        className="h-8 text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Probability (0-1)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={prizeForm.probability}
                        onChange={(e) => setPrizeForm({ ...prizeForm, probability: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-1.5">
                        <Input
                          value={prizeForm.color}
                          onChange={(e) => setPrizeForm({ ...prizeForm, color: e.target.value })}
                          className="h-8 text-sm bg-white flex-1"
                        />
                        <div className="w-8 h-8 rounded-lg border shrink-0" style={{ backgroundColor: prizeForm.color }} />
                      </div>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <Button
                        size="sm"
                        onClick={handleSavePrize}
                        disabled={savingPrize || !prizeForm.label}
                        className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white h-8 text-xs flex-1"
                      >
                        {savingPrize ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5 mr-1" />}
                        Save
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        onClick={() => { setShowPrizeForm(false); setEditingPrize(null) }}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prizes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {spinPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: prize.color }}
                  >
                    {prize.prizeValue > 0 ? prize.prizeValue : '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{prize.label}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{prize.prizeType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{(prize.probability * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <Switch
                    checked={prize.isActive}
                    onCheckedChange={() => handleTogglePrizeActive(prize)}
                    className="scale-75"
                  />
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm" variant="ghost"
                      className="h-7 w-7 p-0 text-[#4169E1]"
                      onClick={() => {
                        setEditingPrize(prize)
                        setPrizeForm({
                          label: prize.label,
                          prizeType: prize.prizeType,
                          prizeValue: prize.prizeValue,
                          probability: prize.probability,
                          color: prize.color,
                        })
                        setShowPrizeForm(true)
                      }}
                    >
                      <Edit3 className="size-3" />
                    </Button>
                    <Dialog open={deletePrizeDialog === prize.id} onOpenChange={(open) => { if (!open) setDeletePrizeDialog(null) }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-red-500"
                          onClick={() => setDeletePrizeDialog(prize.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Prize</DialogTitle>
                          <DialogDescription>
                            Delete &quot;{prize.label}&quot;? This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeletePrizeDialog(null)}>Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDeletePrize(prize.id)}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 7: GLOBAL SITE SETTINGS
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          {/* App Logo & Hero Background */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="size-4 text-[#D4AF37]" />
              Branding & Media
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1"><ImageIcon className="size-3" />App Logo URL</Label>
                <Input
                  value={settings?.logoUrl || ''}
                  onChange={(e) => setSettings((s) => s ? { ...s, logoUrl: e.target.value } : s)}
                  placeholder="https://example.com/logo.png"
                  className="bg-white/50 border-white/40"
                />
                {settings?.logoUrl && (
                  <div className="mt-2">
                    <Image src={settings.logoUrl} alt="Logo preview" width={48} height={48} className="h-12 object-contain rounded" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1"><ImageIcon className="size-3" />Hero Background Image URL</Label>
                <Input
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://example.com/hero-bg.jpg"
                  className="bg-white/50 border-white/40"
                />
                {heroImageUrl && (
                  <div className="mt-2">
                    <Image src={heroImageUrl} alt="Hero preview" width={600} height={64} className="h-16 w-full object-cover rounded-lg" />
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Broadcast Notification */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Megaphone className="size-4 text-[#4169E1]" />
              Broadcast Notification
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm">Message to send all subscribers</Label>
                <Input
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. New feature launched! Check it out..."
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleBroadcast}
                  disabled={broadcasting || !broadcastMsg.trim()}
                  className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white"
                >
                  {broadcasting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" />}
                  Send to All
                </Button>
              </div>
            </div>
            {broadcastResult && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-green-600 flex items-center gap-1"
              >
                <CheckCircle className="size-3.5" /> {broadcastResult}
              </motion.p>
            )}
          </GlassCard>

          {/* SOS Contacts */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Ambulance className="size-4 text-red-500" />
              SOS Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Ambulance</Label>
                <Input
                  value={sosContacts.ambulance}
                  onChange={(e) => setSosContacts({ ...sosContacts, ambulance: e.target.value })}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Police</Label>
                <Input
                  value={sosContacts.police}
                  onChange={(e) => setSosContacts({ ...sosContacts, police: e.target.value })}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Fire</Label>
                <Input
                  value={sosContacts.fire}
                  onChange={(e) => setSosContacts({ ...sosContacts, fire: e.target.value })}
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Women Helpline</Label>
                <Input
                  value={sosContacts.womenHelpline}
                  onChange={(e) => setSosContacts({ ...sosContacts, womenHelpline: e.target.value })}
                  className="bg-white/50 border-white/40"
                />
              </div>
            </div>

            {/* Custom SOS Contacts */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Custom Emergency Contacts</Label>
                <Button
                  size="sm" variant="outline"
                  onClick={() => setCustomSosContacts([...customSosContacts, { name: '', phone: '' }])}
                  className="h-7 text-xs"
                >
                  <Plus className="size-3 mr-1" />Add Contact
                </Button>
              </div>
              <div className="space-y-2">
                {customSosContacts.map((contact, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={contact.name}
                      onChange={(e) => {
                        const updated = [...customSosContacts]
                        updated[idx] = { ...updated[idx], name: e.target.value }
                        setCustomSosContacts(updated)
                      }}
                      placeholder="Contact name"
                      className="bg-white/50 border-white/40 h-8 text-sm flex-1"
                    />
                    <Input
                      value={contact.phone}
                      onChange={(e) => {
                        const updated = [...customSosContacts]
                        updated[idx] = { ...updated[idx], phone: e.target.value }
                        setCustomSosContacts(updated)
                      }}
                      placeholder="Phone number"
                      className="bg-white/50 border-white/40 h-8 text-sm flex-1"
                    />
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => setCustomSosContacts(customSosContacts.filter((_, i) => i !== idx))}
                      className="h-8 w-8 p-0 text-red-500 shrink-0"
                    >
                      <XCircle className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* General Settings */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="size-4 text-[#4169E1]" />
              General Settings
            </h3>
            {settings ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Hero Headline</Label>
                    <Input
                      value={settings.heroHeadline || ''}
                      onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Affiliate Base URL</Label>
                    <Input
                      value={settings.affiliateBaseUrl || ''}
                      onChange={(e) => setSettings({ ...settings, affiliateBaseUrl: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="bg-white/50 border-white/40 flex-1"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-white/40 shrink-0"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="bg-white/50 border-white/40 flex-1"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-white/40 shrink-0"
                        style={{ backgroundColor: settings.accentColor }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Hero Description</Label>
                  <Textarea
                    value={settings.heroDescription || ''}
                    onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                    rows={3}
                    className="bg-white/50 border-white/40 resize-none"
                  />
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                  >
                    {savingSettings ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                    Save Settings
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
