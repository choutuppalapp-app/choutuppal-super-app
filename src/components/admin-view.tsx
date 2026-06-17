'use client'
import { supabase } from '@/lib/supabase'

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
  UserCog, CheckSquare, Search, Calendar as CalendarIcon, MessageCircle,
  PieChart as PieChartIcon, Clock, Ban, ShieldCheck,
  Landmark, UserPlus, Percent, Wallet, MapPin, IndianRupee,
  CreditCard, ArrowRightLeft, FileCheck, Pencil,
  Music, Disc3, Ticket, X,
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
import { MediaUploader } from '@/components/media-uploader'
import { useAppStore } from '@/lib/store'
import { sanitizeHtml } from '@/lib/sanitize'
import { CouponManagement } from '@/components/coupon-management'
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
  PieChart,
  Pie,
  Cell,
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
  mostViewedListings: Array<{ id: string; name: string; category: string; viewsCount: number; slug: string }>
  whatsappClicks: number
  cities: Array<{
    id: string
    name: string
    slug: string
    _count: { listings: number; users: number; news: number; stories: number }
  }>
  // New financial fields from enhanced Stats API
  totalTransactionRevenue: number
  totalPlatformRevenue: number
  totalAgentCommissions: number
  totalCityAdminRevenue: number
  cityRevenueBreakdown: Array<{
    cityId: string
    cityName: string
    totalRevenue: number
    agentCommissions: number
    cityAdminShare: number
    superAdminShare: number
    transactionCount: number
  }>
  pendingPayouts: number
  transactionsByType: Array<{ type: string; count: number; totalAmount: number }>
  transactionRevenueGrowth: Array<{ month: string; revenue: number }>
  totalFranchiseeFees: number
}

interface AdminListing {
  id: string
  slug: string
  name: string
  category: string
  images?: string | null
  status: string
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
  status: string
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
  brandName?: string
  logoUrl?: string | null
  heroImageUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  latitude?: number
  longitude?: number
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
  metaTitle: string | null
  metaDescription: string | null
  ogImageUrl: string | null
  // Contact & WhatsApp Integration
  whatsappSupportNumber: string
  whatsappCommunityLink: string
  whatsappChannelLink: string
  heroWhatsappText: string
  franchiseWhatsappText: string
  agentWhatsappText: string
  instagramUrl: string
  facebookUrl: string
  youtubeUrl: string
  contactName: string
  contactAddress: string
  contactPhone: string
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

interface BannerAdItem {
  id: string
  title: string
  imageUrl: string | null
  shopName: string
  offerText: string | null
  linkUrl: string | null
  cityId: string | null
  isActive: boolean
  status: string
  createdAt: string
}

interface AnnouncementItem {
  id: string
  text: string
  isActive: boolean
  createdAt: string
}

interface AdminRequestItem {
  id: string
  userId: string
  cityName: string
  reason: string | null
  status: string
  type?: string
  franchiseeFeePaid?: boolean
  razorpayPaymentId?: string | null
  agentCityId?: string | null
  createdAt: string
  user: { id: string; fullName: string; phone: string; email: string | null; role: string; agentCityId?: string | null; isAgentApproved?: boolean }
}

interface BlogItem {
  id: string
  title: string
  slug: string
  coverImageUrl: string | null
  content: string | null
  isPublished: boolean
  createdAt: string
  cityId: string | null
  city: { id: string; name: string; slug: string } | null
  author: { id: string; fullName: string; avatarUrl: string | null } | null
}

interface PlatformSettingItem {
  id: string
  key: string
  value: string
  label: string | null
  createdAt: string
  updatedAt: string
}

interface TransactionItem {
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
  user: { id: string; fullName: string; phone: string; role: string }
  agent: { id: string; fullName: string; phone: string; role: string } | null
  cityAdmin: { id: string; fullName: string; phone: string; role: string }
  city: { id: string; name: string; slug: string }
}

interface PayoutRequestItem {
  id: string
  userId: string
  amount: number
  status: string
  upiId: string | null
  bankDetails: string | null
  note: string | null
  createdAt: string
  user: {
    id: string; fullName: string; phone: string; role: string
    upiId: string | null; totalEarnings: number; pendingPayout: number
  }
}

interface LocationItem {
  id: string
  state: string
  district: string
  city: string
  mandal: string | null
  pincode: string | null
  latitude: number
  longitude: number
  createdAt: string
}

interface AgentUser {
  id: string
  fullName: string
  phone: string
  agentCityId: string | null
  isAgentApproved: boolean
  totalEarnings: number
  pendingPayout: number
  agentCity: { id: string; name: string } | null
}

interface MusicTrack {
  id: string
  name: string
  artist: string
  audioUrl: string
  genre: string
  duration: number
  isActive: boolean
  createdAt: string
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminView() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const adminTab = useAppStore((s) => s.adminTab)
  const setAdminTab = useAppStore((s) => s.setAdminTab)
  const currentUser = useAppStore((s) => s.currentUser)
  const isSuperAdmin = currentUser?.role === 'super_admin'
  const isCityAdmin = currentUser?.role === 'city_admin'
  const managedCityId = currentUser?.managedCityId

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
  const [newCityBrandName, setNewCityBrandName] = useState('')
  const [newCityPrimaryColor, setNewCityPrimaryColor] = useState('#4169E1')
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

  // ─── Tab: User Management ──────────────────────────────────────────────────
  const [adminUsers, setAdminUsers] = useState<Array<{
    id: string; fullName: string; phone: string; email: string | null;
    role: string; subscriptionTier: string; coinsBalance: number;
    createdAt: string; city: { name: string } | null;
    agentCityId?: string | null; managedCityId?: string | null;
    _count: { listings: number; leads: number };
  }>>([])
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [usersLoading, setUsersLoading] = useState(false)
  const [addCoinsDialog, setAddCoinsDialog] = useState<string | null>(null)
  const [addCoinsAmount, setAddCoinsAmount] = useState('')

  // ─── Bulk Actions ──────────────────────────────────────────────────────────
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // ─── Broadcast Upgrade ─────────────────────────────────────────────────────
  const [broadcastImageUrl, setBroadcastImageUrl] = useState('')
  const [broadcastScheduledAt, setBroadcastScheduledAt] = useState('')

  // ─── SEO ────────────────────────────────────────────────────────────────────
  const [seoForm, setSeoForm] = useState({ metaTitle: '', metaDescription: '', ogImageUrl: '' })

  // ─── Tab: Banner Management ──────────────────────────────────────────────
  const [bannerAds, setBannerAds] = useState<BannerAdItem[]>([])
  const [bannerLoading, setBannerLoading] = useState(false)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<BannerAdItem | null>(null)
  const [bannerForm, setBannerForm] = useState({
    title: '', imageUrl: '', shopName: '', offerText: '', linkUrl: '', cityId: '', isActive: true,
  })
  const [savingBanner, setSavingBanner] = useState(false)
  const [deleteBannerDialog, setDeleteBannerDialog] = useState<string | null>(null)

  // ─── Tab: Announcements ──────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [announcementLoading, setAnnouncementLoading] = useState(false)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null)
  const [announcementForm, setAnnouncementForm] = useState({ text: '', isActive: true })
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)
  const [deleteAnnouncementDialog, setDeleteAnnouncementDialog] = useState<string | null>(null)

  // ─── Tab: City Branding (super_admin only) ────────────────────────────────
  const [brandingEdits, setBrandingEdits] = useState<Record<string, {
    brandName: string; logoUrl: string; heroImageUrl: string;
    primaryColor: string; secondaryColor: string; latitude: string; longitude: string;
  }>>({})
  const [savingBranding, setSavingBranding] = useState<string | null>(null)
  const [newCityBranding, setNewCityBranding] = useState({
    name: '', slug: '', state: 'Telangana', brandName: '', logoUrl: '',
    heroImageUrl: '', primaryColor: '#4169E1', secondaryColor: '#D4AF37',
    latitude: '17.2985', longitude: '78.9256',
  })
  const [addingCityBranding, setAddingCityBranding] = useState(false)

  // ─── Tab: Admin Management (super_admin only) ─────────────────────────────
  const [cityAdmins, setCityAdmins] = useState<Array<{
    id: string; fullName: string; phone: string;
    managedCity: { id: string; name: string } | null;
  }>>([])
  const [cityAdminsLoading, setCityAdminsLoading] = useState(false)
  const [assignAdminSearch, setAssignAdminSearch] = useState('')
  const [assignAdminUserId, setAssignAdminUserId] = useState('')
  const [assignAdminCityId, setAssignAdminCityId] = useState('')
  const [assigningAdmin, setAssigningAdmin] = useState(false)
  const [searchedUsers, setSearchedUsers] = useState<Array<{ id: string; fullName: string; phone: string }>>([])

  // ─── Tab: Admin Requests (super_admin only) ───────────────────────────────
  const [adminRequests, setAdminRequests] = useState<AdminRequestItem[]>([])
  const [adminRequestsLoading, setAdminRequestsLoading] = useState(false)
  const [adminRequestFilter, setAdminRequestFilter] = useState('all')
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  // ─── Tab: Blogs (Content CMS sub-tab) ─────────────────────────────────────
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [contentSubTab, setContentSubTab] = useState('news')
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null)
  const [blogForm, setBlogForm] = useState({
    title: '', slug: '', coverImageUrl: '', content: '', cityId: '', isPublished: true,
  })
  const [savingBlog, setSavingBlog] = useState(false)
  const [deleteBlogDialog, setDeleteBlogDialog] = useState<string | null>(null)

  // ─── Tab: Franchisee Management (super_admin only) ────────────────────────
  const [franchiseeRequests, setFranchiseeRequests] = useState<AdminRequestItem[]>([])
  const [franchiseeLoading, setFranchiseeLoading] = useState(false)
  const [franchiseeFilter, setFranchiseeFilter] = useState('all')
  const [processingFranchisee, setProcessingFranchisee] = useState<string | null>(null)

  // ─── Tab: Agent Management (super_admin only) ────────────────────────────
  const [agentRequests, setAgentRequests] = useState<AdminRequestItem[]>([])
  const [agentRequestsLoading, setAgentRequestsLoading] = useState(false)
  const [agentFilter, setAgentFilter] = useState('all')
  const [processingAgent, setProcessingAgent] = useState<string | null>(null)
  const [approvedAgents, setApprovedAgents] = useState<AgentUser[]>([])
  const [agentsLoading, setAgentsLoading] = useState(false)

  // ─── Tab: Commission Engine (super_admin only) ────────────────────────────
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingItem[]>([])
  const [platformSettingsLoading, setPlatformSettingsLoading] = useState(false)
  const [editingSettingKey, setEditingSettingKey] = useState<string | null>(null)
  const [settingEditValue, setSettingEditValue] = useState('')
  const [savingSetting, setSavingSetting] = useState<string | null>(null)

  // ─── Tab: Financial Dashboard (super_admin only) ──────────────────────────
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequestItem[]>([])
  const [payoutsLoading, setPayoutsLoading] = useState(false)
  const [processingPayout, setProcessingPayout] = useState<string | null>(null)

  // ─── Tab: Location Manager (super_admin only) ────────────────────────────
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [locationForm, setLocationForm] = useState({ state: '', district: '', city: '', mandal: '', pincode: '', latitude: '', longitude: '' })
  const [addingLocation, setAddingLocation] = useState(false)
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null)
  const [deleteLocationDialog, setDeleteLocationDialog] = useState<string | null>(null)

  // ─── Tab: Music Library ──────────────────────────────────────────────────
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [musicLoading, setMusicLoading] = useState(false)
  const [showMusicForm, setShowMusicForm] = useState(false)
  const [editingMusic, setEditingMusic] = useState<MusicTrack | null>(null)
  const [musicForm, setMusicForm] = useState({
    name: '', artist: 'Royalty Free', audioUrl: '', genre: 'Telugu', duration: 30, isActive: true,
  })
  const [savingMusic, setSavingMusic] = useState(false)
  const [deleteMusicDialog, setDeleteMusicDialog] = useState<string | null>(null)
  const [isRoyaltyFreeConfirmed, setIsRoyaltyFreeConfirmed] = useState(false)

  // ─── TipTap Editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
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
        cityId: isCityAdmin && managedCityId ? managedCityId : editingNews.cityId,
        content: editingNews.content || '',
        imageUrl: editingNews.imageUrl || '',
        source: editingNews.source || '',
        isPublished: editingNews.isPublished,
      })
    } else if (!editingNews && editor) {
      editor.commands.setContent('')
      setNewsForm({
        title: '',
        cityId: isCityAdmin && managedCityId ? managedCityId : '',
        content: '', imageUrl: '', source: '', isPublished: true,
      })
    }
  }, [editingNews, editor, isCityAdmin, managedCityId])

  // ─── Blog TipTap Editor ───────────────────────────────────────────────────
  const blogEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your blog post here...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setBlogForm((prev) => ({ ...prev, content: editor.getHTML() }))
    },
  })

  // When editing blog, set blog editor content
  useEffect(() => {
    if (editingBlog && blogEditor) {
      blogEditor.commands.setContent(editingBlog.content || '')
      setBlogForm({
        title: editingBlog.title,
        slug: editingBlog.slug,
        coverImageUrl: editingBlog.coverImageUrl || '',
        content: editingBlog.content || '',
        cityId: editingBlog.cityId || '',
        isPublished: editingBlog.isPublished,
      })
    } else if (!editingBlog && blogEditor) {
      blogEditor.commands.setContent('')
      setBlogForm({ title: '', slug: '', coverImageUrl: '', content: '', cityId: '', isPublished: true })
    }
  }, [editingBlog, blogEditor])

  // ─── Fetch Stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    setStatsLoading(true)
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        // If the API returned an error object, use safe defaults instead
        if (data.error) {
          setStats({
            totalUsers: 0, totalListings: 0, totalLeads: 0,
            totalActiveSubscriptions: 0, totalRevenue: 0,
            approvedListings: 0, featuredListings: 0, premiumListings: 0,
            totalReviews: 0, averageRating: 0,
            cities: [], leadsByStatus: [], listingsByCategory: [],
            usersByRole: [], userGrowth: [], revenueGrowth: [],
            subscriptionsByPlan: [],
            mostViewedListings: [], whatsappClicks: 0,
            totalTransactionRevenue: 0, totalPlatformRevenue: 0,
            totalAgentCommissions: 0, totalCityAdminRevenue: 0,
            cityRevenueBreakdown: [], pendingPayouts: 0,
            transactionsByType: [], transactionRevenueGrowth: [],
            totalFranchiseeFees: 0,
          })
        } else {
          setStats(data)
        }
      })
      .catch(() => {
        setStats({
          totalUsers: 0, totalListings: 0, totalLeads: 0,
          totalActiveSubscriptions: 0, totalRevenue: 0,
          approvedListings: 0, featuredListings: 0, premiumListings: 0,
          totalReviews: 0, averageRating: 0,
          cities: [], leadsByStatus: [], listingsByCategory: [],
          usersByRole: [], userGrowth: [], revenueGrowth: [],
          subscriptionsByPlan: [],
          mostViewedListings: [], whatsappClicks: 0,
          totalTransactionRevenue: 0, totalPlatformRevenue: 0,
          totalAgentCommissions: 0, totalCityAdminRevenue: 0,
          cityRevenueBreakdown: [], pendingPayouts: 0,
          transactionsByType: [], transactionRevenueGrowth: [],
          totalFranchiseeFees: 0,
        })
      })
      .finally(() => setStatsLoading(false))
  }, [])

  // ─── Fetch Cities ──────────────────────────────────────────────────────────
  const fetchCities = useCallback(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => { /* Cities are non-critical */ })
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
      .catch(() => { toast.error('Failed to load listings') })
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
      .catch(() => { toast.error('Failed to load real estate listings') })
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
      .catch(() => { toast.error('Failed to load leads') })
  }, [])

  // ─── Fetch News ────────────────────────────────────────────────────────────
  const fetchNews = useCallback(() => {
    setNewsLoading(true)
    fetch('/api/admin/news?all=true')
      .then((res) => res.json())
      .then((data) => setNewsArticles(Array.isArray(data) ? data : []))
      .catch(() => { toast.error('Failed to load news') })
      .finally(() => setNewsLoading(false))
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  // ─── Fetch Spin Prizes ─────────────────────────────────────────────────────
  const fetchSpinPrizes = useCallback(() => {
    fetch('/api/admin/spin-prizes')
      .then((res) => res.json())
      .then((data) => setSpinPrizes(Array.isArray(data) ? data : []))
      .catch(() => {
        // Fallback default prizes when API fails
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
      .catch(() => { /* Settings are non-critical */ })
  }, [])

  // ─── Fetch Users ────────────────────────────────────────────────────────────
  const fetchAdminUsers = useCallback(() => {
    setUsersLoading(true)
    const params = new URLSearchParams()
    if (userSearch) params.set('search', userSearch)
    if (userRoleFilter !== 'all') params.set('role', userRoleFilter)
    fetch(`/api/admin/users?${params}`)
      .then((res) => res.json())
      .then((data) => setAdminUsers(Array.isArray(data) ? data : []))
      .catch(() => setAdminUsers([]))
      .finally(() => setUsersLoading(false))
  }, [userSearch, userRoleFilter])

  useEffect(() => { fetchAdminUsers() }, [fetchAdminUsers])

  // ─── Fetch Banner Ads (Admin) ────────────────────────────────────────────
  const fetchBannerAds = useCallback(() => {
    setBannerLoading(true)
    fetch('/api/banners?all=true')
      .then((res) => res.json())
      .then((data) => setBannerAds(Array.isArray(data) ? data : []))
      .catch(() => setBannerAds([]))
      .finally(() => setBannerLoading(false))
  }, [])

  useEffect(() => { fetchBannerAds() }, [fetchBannerAds])

  // ─── Fetch Announcements (Admin) ─────────────────────────────────────────
  const fetchAnnouncements = useCallback(() => {
    setAnnouncementLoading(true)
    fetch('/api/announcements?activeOnly=false')
      .then((res) => res.json())
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setAnnouncementLoading(false))
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  // ─── Load SEO from settings ────────────────────────────────────────────────
  useEffect(() => {
    if (settings) {
      setSeoForm({
        metaTitle: settings.metaTitle || '',
        metaDescription: settings.metaDescription || '',
        ogImageUrl: settings.ogImageUrl || '',
      })
    }
  }, [settings])

  // ─── Fetch Admin Requests (super_admin) ───────────────────────────────────
  const fetchAdminRequests = useCallback(() => {
    setAdminRequestsLoading(true)
    const params = new URLSearchParams()
    if (adminRequestFilter !== 'all') params.set('status', adminRequestFilter)
    fetch(`/api/admin-requests?${params}`)
      .then((res) => res.json())
      .then((data) => setAdminRequests(Array.isArray(data) ? data : []))
      .catch(() => setAdminRequests([]))
      .finally(() => setAdminRequestsLoading(false))
  }, [adminRequestFilter])

  useEffect(() => { if (isSuperAdmin) fetchAdminRequests() }, [fetchAdminRequests, isSuperAdmin])

  // ─── Fetch City Admins (super_admin) ──────────────────────────────────────
  const fetchCityAdmins = useCallback(() => {
    setCityAdminsLoading(true)
    fetch('/api/admin/users?role=city_admin')
      .then((res) => res.json())
      .then((data) => setCityAdmins(Array.isArray(data) ? data.map((u: Record<string, unknown>) => ({
        id: u.id as string,
        fullName: u.fullName as string,
        phone: u.phone as string,
        managedCity: u.managedCity as { id: string; name: string } | null,
      })) : []))
      .catch(() => setCityAdmins([]))
      .finally(() => setCityAdminsLoading(false))
  }, [])

  useEffect(() => { if (isSuperAdmin) fetchCityAdmins() }, [fetchCityAdmins, isSuperAdmin])

  // ─── Fetch Blogs ──────────────────────────────────────────────────────────
  const fetchBlogs = useCallback(() => {
    setBlogsLoading(true)
    fetch('/api/blogs?all=true')
      .then((res) => res.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => setBlogs([]))
      .finally(() => setBlogsLoading(false))
  }, [])

  useEffect(() => { fetchBlogs() }, [fetchBlogs])

  // ─── Fetch Franchisee Requests (super_admin only) ────────────────────────
  const fetchFranchiseeRequests = useCallback(() => {
    setFranchiseeLoading(true)
    const params = new URLSearchParams()
    params.set('type', 'city_admin')
    if (franchiseeFilter !== 'all') params.set('status', franchiseeFilter)
    fetch(`/api/admin-requests?${params}`)
      .then((res) => res.json())
      .then((data) => setFranchiseeRequests(Array.isArray(data) ? data : []))
      .catch(() => setFranchiseeRequests([]))
      .finally(() => setFranchiseeLoading(false))
  }, [franchiseeFilter])

  useEffect(() => { if (isSuperAdmin) fetchFranchiseeRequests() }, [fetchFranchiseeRequests, isSuperAdmin])

  // ─── Fetch Agent Requests & Approved Agents (super_admin only) ───────────
  const fetchAgentRequests = useCallback(() => {
    setAgentRequestsLoading(true)
    const params = new URLSearchParams()
    params.set('type', 'agent')
    if (agentFilter !== 'all') params.set('status', agentFilter)
    fetch(`/api/admin-requests?${params}`)
      .then((res) => res.json())
      .then((data) => setAgentRequests(Array.isArray(data) ? data : []))
      .catch(() => setAgentRequests([]))
      .finally(() => setAgentRequestsLoading(false))
  }, [agentFilter])

  const fetchApprovedAgents = useCallback(() => {
    setAgentsLoading(true)
    fetch('/api/admin/users?role=agent')
      .then((res) => res.json())
      .then((data) => setApprovedAgents(Array.isArray(data) ? data.map((u: Record<string, unknown>) => ({
        id: u.id as string,
        fullName: u.fullName as string,
        phone: u.phone as string,
        agentCityId: u.agentCityId as string | null,
        isAgentApproved: u.isAgentApproved as boolean,
        totalEarnings: u.totalEarnings as number,
        pendingPayout: u.pendingPayout as number,
        agentCity: u.agentCity as { id: string; name: string } | null,
      })) : []))
      .catch(() => setApprovedAgents([]))
      .finally(() => setAgentsLoading(false))
  }, [])

  useEffect(() => { if (isSuperAdmin) fetchAgentRequests() }, [fetchAgentRequests, isSuperAdmin])
  useEffect(() => { if (isSuperAdmin) fetchApprovedAgents() }, [fetchApprovedAgents, isSuperAdmin])

  // ─── Fetch Platform Settings / Commission Engine (super_admin only) ──────
  const fetchPlatformSettings = useCallback(() => {
    setPlatformSettingsLoading(true)
    fetch('/api/platform-settings')
      .then((res) => res.json())
      .then((data) => setPlatformSettings(Array.isArray(data) ? data : []))
      .catch(() => setPlatformSettings([]))
      .finally(() => setPlatformSettingsLoading(false))
  }, [])

  useEffect(() => { if (isSuperAdmin) fetchPlatformSettings() }, [fetchPlatformSettings, isSuperAdmin])

  // ─── Fetch Transactions (super_admin only) ───────────────────────────────
  const fetchTransactions = useCallback(() => {
    setTransactionsLoading(true)
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setTransactionsLoading(false))
  }, [])

  useEffect(() => { if (isSuperAdmin) fetchTransactions() }, [fetchTransactions, isSuperAdmin])

  // ─── Fetch Payouts (super_admin only) ────────────────────────────────────
  const fetchPayouts = useCallback(() => {
    setPayoutsLoading(true)
    fetch('/api/payouts')
      .then((res) => res.json())
      .then((data) => setPayoutRequests(Array.isArray(data) ? data : []))
      .catch(() => setPayoutRequests([]))
      .finally(() => setPayoutsLoading(false))
  }, [])

  useEffect(() => { if (isSuperAdmin) fetchPayouts() }, [fetchPayouts, isSuperAdmin])

  // ─── Fetch Locations (super_admin only) ──────────────────────────────────
  const fetchLocations = useCallback(() => {
    setLocationsLoading(true)
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]))
      .finally(() => setLocationsLoading(false))
  }, [])

  useEffect(() => { if (isSuperAdmin) fetchLocations() }, [fetchLocations, isSuperAdmin])

  // ─── Fetch Music Tracks ──────────────────────────────────────────────────
  const fetchMusicTracks = useCallback(() => {
    setMusicLoading(true)
    fetch('/api/music-library?all=true')
      .then((res) => res.json())
      .then((data) => setMusicTracks(Array.isArray(data) ? data : []))
      .catch(() => setMusicTracks([]))
      .finally(() => setMusicLoading(false))
  }, [])

  useEffect(() => { fetchMusicTracks() }, [fetchMusicTracks])

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
          brandName: newCityBrandName || undefined,
          primaryColor: newCityPrimaryColor || undefined,
        }),
      })
      if (res.ok) {
        toast.success(`City "${newCityName}" added!`)
        setNewCityName('')
        setNewCitySlug('')
        setNewCityState('Telangana')
        setNewCityHero('')
        setNewCityBrandName('')
        setNewCityPrimaryColor('#4169E1')
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
        content: sanitizeHtml(newsForm.content),
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
        const updatedSettings = await res.json()
        setSettings(updatedSettings)
        // Also update global store so frontend components reflect immediately
        const { setSiteSettings } = useAppStore.getState()
        setSiteSettings(updatedSettings)
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

  const handleUserAction = async (userId: string, action: string, value?: string, extraPayload?: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, value, ...extraPayload }),
      })
      if (res.ok) {
        toast.success(`Action "${action}" successful`)
        fetchAdminUsers()
      } else {
        toast.error('Action failed')
      }
    } catch {
      toast.error('Action failed')
    }
    setAddCoinsDialog(null)
    setAddCoinsAmount('')
  }

  const handleBulkAction = async (action: string) => {
    if (selectedListings.size === 0) return
    setBulkActionLoading(true)
    try {
      const res = await fetch('/api/admin/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          listingIds: Array.from(selectedListings),
          type: modSubTab === 'realestate' ? 'realestate' : 'business',
        }),
      })
      if (res.ok) {
        toast.success(`Bulk ${action} successful on ${selectedListings.size} listings`)
        setSelectedListings(new Set())
        if (modSubTab === 'business') fetchAdminListings()
        else fetchReListings()
      } else {
        toast.error('Bulk action failed')
      }
    } catch {
      toast.error('Bulk action failed')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleSaveSEO = async () => {
    if (!settings) return
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settings.id,
          metaTitle: seoForm.metaTitle || null,
          metaDescription: seoForm.metaDescription || null,
          ogImageUrl: seoForm.ogImageUrl || null,
        }),
      })
      if (res.ok) {
        const updatedSettings = await res.json()
        setSettings(updatedSettings)
        const { setSiteSettings } = useAppStore.getState()
        setSiteSettings(updatedSettings)
        toast.success('SEO settings saved!')
      } else {
        toast.error('Failed to save SEO settings')
      }
    } catch {
      toast.error('Failed to save SEO settings')
    }
  }

  const handleBroadcastUpgrade = async () => {
    if (!broadcastMsg.trim()) return
    setBroadcasting(true)
    setBroadcastResult(null)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMsg,
          imageUrl: broadcastImageUrl || undefined,
          scheduledAt: broadcastScheduledAt || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setBroadcastResult(`Sent to ${data.sent} subscribers`)
        toast.success(broadcastScheduledAt ? 'Broadcast scheduled!' : 'Broadcast sent!')
        setBroadcastMsg('')
        setBroadcastImageUrl('')
        setBroadcastScheduledAt('')
      } else {
        setBroadcastResult('Failed to send broadcast')
      }
    } catch {
      setBroadcastResult('Failed to send broadcast')
    } finally {
      setBroadcasting(false)
    }
  }

  // ─── Banner Ad Actions ───────────────────────────────────────────────────
  const handleSaveBanner = async () => {
    if (!bannerForm.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSavingBanner(true)
    try {
      const payload = editingBanner
        ? { id: editingBanner.id, ...bannerForm }
        : bannerForm
      const res = await fetch('/api/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editingBanner ? 'Banner updated!' : 'Banner created!')
        setShowBannerForm(false)
        setEditingBanner(null)
        setBannerForm({ title: '', imageUrl: '', shopName: '', offerText: '', linkUrl: '', cityId: '', isActive: true })
        fetchBannerAds()
      } else {
        toast.error('Failed to save banner')
      }
    } catch {
      toast.error('Failed to save banner')
    } finally {
      setSavingBanner(false)
    }
  }

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Banner deleted')
        fetchBannerAds()
      } else {
        toast.error('Failed to delete banner')
      }
    } catch {
      toast.error('Failed to delete banner')
    }
    setDeleteBannerDialog(null)
  }

  const handleToggleBannerActive = async (banner: BannerAdItem) => {
    try {
      await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }),
      })
      fetchBannerAds()
    } catch {
      toast.error('Failed to toggle banner')
    }
  }

  // ─── Announcement Actions ────────────────────────────────────────────────
  const handleSaveAnnouncement = async () => {
    if (!announcementForm.text.trim()) {
      toast.error('Announcement text is required')
      return
    }
    setSavingAnnouncement(true)
    try {
      const payload = editingAnnouncement
        ? { id: editingAnnouncement.id, ...announcementForm }
        : announcementForm
      const res = await fetch('/api/announcements', {
        method: editingAnnouncement ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editingAnnouncement ? 'Announcement updated!' : 'Announcement created!')
        setShowAnnouncementForm(false)
        setEditingAnnouncement(null)
        setAnnouncementForm({ text: '', isActive: true })
        fetchAnnouncements()
      } else {
        toast.error('Failed to save announcement')
      }
    } catch {
      toast.error('Failed to save announcement')
    } finally {
      setSavingAnnouncement(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Announcement deleted')
        fetchAnnouncements()
      } else {
        toast.error('Failed to delete announcement')
      }
    } catch {
      toast.error('Failed to delete announcement')
    }
    setDeleteAnnouncementDialog(null)
  }

  const handleToggleAnnouncementActive = async (announcement: AnnouncementItem) => {
    try {
      await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: announcement.id, isActive: !announcement.isActive }),
      })
      fetchAnnouncements()
    } catch {
      toast.error('Failed to toggle announcement')
    }
  }

  // ─── City Branding Actions (super_admin) ─────────────────────────────────
  const handleSaveBranding = async (cityId: string) => {
    const edit = brandingEdits[cityId]
    if (!edit) return
    setSavingBranding(cityId)
    try {
      const res = await fetch(`/api/cities?id=${cityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: edit.brandName,
          logoUrl: edit.logoUrl || null,
          heroImageUrl: edit.heroImageUrl || null,
          primaryColor: edit.primaryColor,
          secondaryColor: edit.secondaryColor,
          latitude: parseFloat(edit.latitude) || 17.2985,
          longitude: parseFloat(edit.longitude) || 78.9256,
        }),
      })
      if (res.ok) {
        toast.success('Branding saved!')
        fetchCities()
        setBrandingEdits((prev) => {
          const next = { ...prev }
          delete next[cityId]
          return next
        })
      } else {
        toast.error('Failed to save branding')
      }
    } catch {
      toast.error('Failed to save branding')
    } finally {
      setSavingBranding(null)
    }
  }

  const handleAddCityBranding = async () => {
    if (!newCityBranding.name || !newCityBranding.slug) return
    setAddingCityBranding(true)
    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCityBranding),
      })
      if (res.ok) {
        toast.success(`City "${newCityBranding.name}" added!`)
        setNewCityBranding({
          name: '', slug: '', state: 'Telangana', brandName: '', logoUrl: '',
          heroImageUrl: '', primaryColor: '#4169E1', secondaryColor: '#D4AF37',
          latitude: '17.2985', longitude: '78.9256',
        })
        fetchCities()
      } else {
        toast.error('Failed to add city')
      }
    } catch {
      toast.error('Failed to add city')
    } finally {
      setAddingCityBranding(false)
    }
  }

  // ─── Admin Management Actions (super_admin) ──────────────────────────────
  const handleSearchUsers = async () => {
    if (!assignAdminSearch.trim()) return
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(assignAdminSearch)}`)
      const data = await res.json()
      setSearchedUsers(Array.isArray(data) ? data.map((u: Record<string, unknown>) => ({
        id: u.id as string, fullName: u.fullName as string, phone: u.phone as string,
      })) : [])
    } catch {
      setSearchedUsers([])
    }
  }

  const handleAssignCityAdmin = async () => {
    if (!assignAdminUserId || !assignAdminCityId) {
      toast.error('Select a user and city')
      return
    }
    setAssigningAdmin(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: assignAdminUserId, action: 'assignCityAdmin', cityId: assignAdminCityId }),
      })
      if (res.ok) {
        toast.success('City admin assigned!')
        setAssignAdminUserId('')
        setAssignAdminCityId('')
        setAssignAdminSearch('')
        setSearchedUsers([])
        fetchCityAdmins()
      } else {
        toast.error('Failed to assign city admin')
      }
    } catch {
      toast.error('Failed to assign city admin')
    } finally {
      setAssigningAdmin(false)
    }
  }

  const handleRevokeCityAdmin = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'revokeCityAdmin' }),
      })
      if (res.ok) {
        toast.success('City admin revoked!')
        fetchCityAdmins()
      } else {
        toast.error('Failed to revoke city admin')
      }
    } catch {
      toast.error('Failed to revoke city admin')
    }
  }

  // ─── Admin Request Actions (super_admin) ─────────────────────────────────
  const handleAdminRequestAction = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessingRequest(requestId)
    try {
      const res = await fetch(`/api/admin-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Request ${status}!`)
        fetchAdminRequests()
      } else {
        toast.error(`Failed to ${status === 'approved' ? 'approve' : 'reject'} request`)
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setProcessingRequest(null)
    }
  }

  // ─── Blog Actions ────────────────────────────────────────────────────────
  const handleSaveBlog = async () => {
    if (!blogForm.title) {
      toast.error('Title is required')
      return
    }
    setSavingBlog(true)
    try {
      const effectiveCityId = isCityAdmin && managedCityId ? managedCityId : blogForm.cityId || null
      const payload = {
        ...(editingBlog ? { id: editingBlog.id } : {}),
        title: blogForm.title,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        coverImageUrl: blogForm.coverImageUrl || null,
        content: sanitizeHtml(blogForm.content),
        cityId: effectiveCityId,
        isPublished: blogForm.isPublished,
        authorId: currentUser?.id,
      }
      const res = await fetch(editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs', {
        method: editingBlog ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editingBlog ? 'Blog updated!' : 'Blog created!')
        setEditingBlog(null)
        setBlogForm({ title: '', slug: '', coverImageUrl: '', content: '', cityId: '', isPublished: true })
        if (blogEditor) blogEditor.commands.setContent('')
        fetchBlogs()
      } else {
        toast.error('Failed to save blog')
      }
    } catch {
      toast.error('Failed to save blog')
    } finally {
      setSavingBlog(false)
    }
  }

  const handleDeleteBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Blog deleted')
        fetchBlogs()
      } else {
        toast.error('Failed to delete blog')
      }
    } catch {
      toast.error('Failed to delete blog')
    }
    setDeleteBlogDialog(null)
  }

  // ─── Franchisee Management Actions (super_admin) ─────────────────────────
  const handleFranchiseeAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingFranchisee(requestId)
    try {
      const res = await fetch(`/api/admin-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (res.ok) {
        toast.success(`Franchisee request ${action === 'approved' ? 'approved' : 'rejected'}!`)
        fetchFranchiseeRequests()
      } else {
        toast.error(`Failed to ${action === 'approved' ? 'approve' : 'reject'} franchisee request`)
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setProcessingFranchisee(null)
    }
  }

  // ─── Agent Management Actions (super_admin) ──────────────────────────────
  const handleAgentAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessingAgent(requestId)
    try {
      const res = await fetch(`/api/admin-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (res.ok) {
        toast.success(`Agent request ${action === 'approved' ? 'approved' : 'rejected'}!`)
        fetchAgentRequests()
        fetchApprovedAgents()
      } else {
        toast.error(`Failed to ${action === 'approved' ? 'approve' : 'reject'} agent request`)
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setProcessingAgent(null)
    }
  }

  // ─── Commission Engine Actions (super_admin) ────────────────────────────
  const handleSavePlatformSetting = async (key: string, value: string) => {
    setSavingSetting(key)
    try {
      const res = await fetch('/api/platform-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (res.ok) {
        toast.success('Setting saved!')
        setEditingSettingKey(null)
        setSettingEditValue('')
        fetchPlatformSettings()
      } else {
        toast.error('Failed to save setting')
      }
    } catch {
      toast.error('Failed to save setting')
    } finally {
      setSavingSetting(null)
    }
  }

  // ─── Payout Actions (super_admin) ────────────────────────────────────────
  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'reject' | 'paid') => {
    setProcessingPayout(payoutId)
    try {
      const res = await fetch('/api/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, action }),
      })
      if (res.ok) {
        toast.success(`Payout ${action === 'paid' ? 'marked as paid' : action + 'd'}!`)
        fetchPayouts()
      } else {
        toast.error(`Failed to ${action} payout`)
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setProcessingPayout(null)
    }
  }

  // ─── Location Actions (super_admin) ──────────────────────────────────────
  const handleAddLocation = async () => {
    if (!locationForm.state || !locationForm.district || !locationForm.city) {
      toast.error('State, District, and City are required')
      return
    }
    setAddingLocation(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationForm),
      })
      if (res.ok) {
        toast.success('Location added!')
        setLocationForm({ state: '', district: '', city: '', mandal: '', pincode: '', latitude: '', longitude: '' })
        fetchLocations()
      } else {
        toast.error('Failed to add location')
      }
    } catch {
      toast.error('Failed to add location')
    } finally {
      setAddingLocation(false)
    }
  }

  const handleEditLocation = async () => {
    if (!editingLocation) return
    try {
      const res = await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLocation.id,
          state: editingLocation.state,
          district: editingLocation.district,
          city: editingLocation.city,
          mandal: editingLocation.mandal,
          pincode: editingLocation.pincode,
        }),
      })
      if (res.ok) {
        toast.success('Location updated!')
        setEditingLocation(null)
        fetchLocations()
      } else {
        toast.error('Failed to update location')
      }
    } catch {
      toast.error('Failed to update location')
    }
  }

  const handleDeleteLocation = async (id: string) => {
    try {
      const res = await fetch(`/api/locations?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Location deleted')
        fetchLocations()
      } else {
        toast.error('Failed to delete location')
      }
    } catch {
      toast.error('Failed to delete location')
    }
    setDeleteLocationDialog(null)
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

  const getListingStatusBadge = (listing: AdminListing | RealEstateListing | BannerAdItem) => {
    if ('isPremium' in listing && listing.isPremium) return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Premium</Badge>
    if ('isFeatured' in listing && listing.isFeatured) return <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">Featured</Badge>
    if (listing.status === 'APPROVED') return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
    if (listing.status === 'REJECTED') return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>
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
            <p className="text-sm text-gray-500">
              {isCityAdmin ? `Managing ${cities.find((c) => c.id === managedCityId)?.name || 'your city'}` : 'Manage your Multi-City SaaS Platform'}
            </p>
          </div>
          {isSuperAdmin && (
            <Badge className="ml-auto bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white border-0">Super Admin</Badge>
          )}
          {isCityAdmin && (
            <Badge className="ml-auto bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white border-0">City Admin</Badge>
          )}
        </div>
      </GlassCard>

      {/* City Admin Banner */}
      {isCityAdmin && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-[#4169E1]/10 backdrop-blur-xl border border-[#4169E1]/20 flex items-center gap-2 text-sm text-[#4169E1]"
        >
          <Shield className="size-4 shrink-0" />
          You are managing <strong className="mx-1">{cities.find((c) => c.id === managedCityId)?.name || 'your city'}</strong>. Content you create will be automatically assigned to this city.
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="w-full flex flex-nowrap h-auto gap-1 bg-white/40 backdrop-blur-xl border border-white/30 p-1 rounded-xl">
            {isSuperAdmin && (
              <TabsTrigger value="franchisee" className="text-xs sm:text-sm">
                <Landmark className="size-3.5 mr-1" />Franchisee
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="agent-mgmt" className="text-xs sm:text-sm">
                <UserPlus className="size-3.5 mr-1" />Agents
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="commission" className="text-xs sm:text-sm">
                <Percent className="size-3.5 mr-1" />Commission
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="financial" className="text-xs sm:text-sm">
                <Wallet className="size-3.5 mr-1" />Finance
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="locations" className="text-xs sm:text-sm">
                <MapPin className="size-3.5 mr-1" />Locations
              </TabsTrigger>
            )}
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="size-3.5 mr-1" />Overview
            </TabsTrigger>
            <TabsTrigger value="cities" className="text-xs sm:text-sm">
              <Building2 className="size-3.5 mr-1" />Cities
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs sm:text-sm">
              <Shield className="size-3.5 mr-1" />Moderate
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <UserCog className="size-3.5 mr-1" />Users
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
            <TabsTrigger value="coupons" className="text-xs sm:text-sm">
              <Ticket className="size-3.5 mr-1" />Coupons
            </TabsTrigger>
            <TabsTrigger value="banners" className="text-xs sm:text-sm">
              <Megaphone className="size-3.5 mr-1" />Banners
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs sm:text-sm">
              <Megaphone className="size-3.5 mr-1" />Ticker
            </TabsTrigger>
            <TabsTrigger value="music" className="text-xs sm:text-sm">
              <Music className="size-3.5 mr-1" />Music
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="branding" className="text-xs sm:text-sm">
                <Palette className="size-3.5 mr-1" />Branding
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="admin-mgmt" className="text-xs sm:text-sm">
                <UserCog className="size-3.5 mr-1" />Admins
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="admin-requests" className="text-xs sm:text-sm">
                <Inbox className="size-3.5 mr-1" />Requests
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="size-3.5 mr-1" />Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: FRANCHISEE MANAGEMENT (super_admin only)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="franchisee" className="mt-4 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center">
                <Landmark className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Franchisee Management</h2>
                <p className="text-sm text-gray-500">Review and manage city admin franchisee applications</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium text-gray-600">Filter by Status:</Label>
            <Select value={franchiseeFilter} onValueChange={setFranchiseeFilter}>
              <SelectTrigger className="w-40 bg-white/50 border-white/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {franchiseeLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-[#D4AF37]" /></div>
          ) : franchiseeRequests.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
              <p className="text-center text-gray-500 py-8">No franchisee applications found</p>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City Requested</TableHead>
                      <TableHead>Fee Paid</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {franchiseeRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.user.fullName}</TableCell>
                        <TableCell>{req.user.phone}</TableCell>
                        <TableCell>{req.cityName}</TableCell>
                        <TableCell>
                          {req.franchiseeFeePaid ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-gray-500 max-w-[120px] truncate">
                          {req.razorpayPaymentId || '—'}
                        </TableCell>
                        <TableCell>
                          {req.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>}
                          {req.status === 'approved' && <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>}
                          {req.status === 'rejected' && <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>}
                        </TableCell>
                        <TableCell>
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={processingFranchisee === req.id}
                                onClick={() => handleFranchiseeAction(req.id, 'approved')}
                              >
                                {processingFranchisee === req.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={processingFranchisee === req.id}
                                onClick={() => handleFranchiseeAction(req.id, 'rejected')}
                              >
                                {processingFranchisee === req.id ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: AGENT MANAGEMENT (super_admin only)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="agent-mgmt" className="mt-4 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#3457B2] flex items-center justify-center">
                <UserPlus className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Agent Management</h2>
                <p className="text-sm text-gray-500">Review agent applications and manage approved agents</p>
              </div>
            </div>
          </div>

          {/* Agent Requests Section */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Inbox className="size-4 text-[#4169E1]" /> Agent Applications
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Label className="text-sm font-medium text-gray-600">Filter:</Label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-40 bg-white/50 border-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {agentRequestsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-[#4169E1]" /></div>
            ) : agentRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No agent applications found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City Applied For</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.user.fullName}</TableCell>
                        <TableCell>{req.user.phone}</TableCell>
                        <TableCell>{req.cityName}</TableCell>
                        <TableCell>
                          {req.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>}
                          {req.status === 'approved' && <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>}
                          {req.status === 'rejected' && <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>}
                        </TableCell>
                        <TableCell>
                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={processingAgent === req.id}
                                onClick={() => handleAgentAction(req.id, 'approved')}
                              >
                                {processingAgent === req.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={processingAgent === req.id}
                                onClick={() => handleAgentAction(req.id, 'rejected')}
                              >
                                {processingAgent === req.id ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Approved Agents Section */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Users className="size-4 text-[#D4AF37]" /> Approved Agents & Earnings
            </h3>
            {agentsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
            ) : approvedAgents.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No approved agents yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Pending Payout</TableHead>
                      <TableHead>Approved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.fullName}</TableCell>
                        <TableCell>{agent.phone}</TableCell>
                        <TableCell>{agent.agentCity?.name || '—'}</TableCell>
                        <TableCell className="text-green-700 font-semibold">₹{agent.totalEarnings.toLocaleString()}</TableCell>
                        <TableCell className="text-orange-600 font-semibold">₹{agent.pendingPayout.toLocaleString()}</TableCell>
                        <TableCell>
                          {agent.isAgentApproved ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: COMMISSION ENGINE (super_admin only)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="commission" className="mt-4 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center">
                <Percent className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Commission Engine</h2>
                <p className="text-sm text-gray-500">Configure platform pricing and commission rates</p>
              </div>
            </div>
          </div>

          {platformSettingsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-[#D4AF37]" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'city_admin_franchisee_fee', label: 'City Admin Franchisee Fee', unit: '₹', description: 'One-time fee to become a city admin. Charged during franchisee onboarding via Razorpay.' },
                { key: 'agent_commission_listing', label: 'Agent Commission for Listings', unit: '%', description: 'Percentage of listing price paid to the referring agent as commission.' },
                { key: 'agent_commission_banner', label: 'Agent Commission for Banners', unit: '%', description: 'Percentage of banner ad price paid to the referring agent.' },
                { key: 'agent_commission_news_post', label: 'Agent Commission for News Posts', unit: '%', description: 'Percentage of news post price paid to the referring agent.' },
                { key: 'city_admin_commission_share', label: 'City Admin Revenue Share', unit: '%', description: 'Percentage of each transaction allocated to the city admin of that city.' },
                { key: 'pro_listing_price', label: 'Pro Listing Price', unit: '₹', description: 'Price for upgrading a business listing to Pro tier with enhanced visibility.' },
                { key: 'premium_listing_price', label: 'Premium Listing Price', unit: '₹', description: 'Price for upgrading a business listing to Premium tier with top placement.' },
                { key: 'banner_ad_price_per_week', label: 'Banner Ad Price', unit: '₹/week', description: 'Weekly rate for displaying a banner advertisement on the city page.' },
                { key: 'news_post_price', label: 'News Post Price', unit: '₹', description: 'Price for publishing a sponsored news article or promotional post.' },
              ].map((config) => {
                const setting = platformSettings.find((s) => s.key === config.key)
                const isEditing = editingSettingKey === config.key
                return (
                  <motion.div key={config.key} {...fadeIn}>
                    <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#4169E1]/10 -mr-6 -mt-6" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-600">{config.label}</p>
                          <button
                            onClick={() => {
                              if (isEditing) {
                                setEditingSettingKey(null)
                                setSettingEditValue('')
                              } else {
                                setEditingSettingKey(config.key)
                                setSettingEditValue(setting?.value || '')
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                          >
                            <Pencil className="size-3.5 text-[#4169E1]" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-2 leading-relaxed">{config.description}</p>
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{config.unit.startsWith('₹') ? '₹' : ''}</span>
                              <Input
                                value={settingEditValue}
                                onChange={(e) => setSettingEditValue(e.target.value)}
                                className="bg-white/50 border-white/40 text-lg font-bold"
                                type="number"
                              />
                              <span className="text-sm text-gray-500">{config.unit.startsWith('%') ? '%' : config.unit.includes('/week') ? '/wk' : ''}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                                disabled={savingSetting === config.key}
                                onClick={() => handleSavePlatformSetting(config.key, settingEditValue)}
                              >
                                {savingSetting === config.key ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5 mr-1" />}
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setEditingSettingKey(null); setSettingEditValue('') }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {config.unit.startsWith('₹') ? '₹' : ''}{setting?.value || '—'}{config.unit.startsWith('%') ? '%' : ''}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {config.unit.includes('/week') ? 'per week' : ''} · Key: <code className="bg-gray-100 px-1 rounded text-[10px]">{config.key}</code>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: FINANCIAL DASHBOARD (super_admin only)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="financial" className="mt-4 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#50C878] flex items-center justify-center">
                <Wallet className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Financial Dashboard</h2>
                <p className="text-sm text-gray-500">Revenue tracking, commissions, transactions & payout management</p>
              </div>
            </div>
          </div>

          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <IndianRupee className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Platform Revenue</p>
                    <p className="text-xl font-bold text-green-700">₹{(stats?.totalPlatformRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <CreditCard className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Transaction Revenue</p>
                    <p className="text-xl font-bold text-blue-700">₹{(stats?.totalTransactionRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <Landmark className="size-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Franchisee Fees Collected</p>
                    <p className="text-xl font-bold text-[#D4AF37]">₹{(stats?.totalFranchiseeFees || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Clock className="size-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pending Payouts</p>
                    <p className="text-xl font-bold text-orange-700">₹{(stats?.pendingPayouts || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Secondary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Building2 className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">City Admin Revenue</p>
                    <p className="text-xl font-bold text-purple-700">₹{(stats?.totalCityAdminRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Users className="size-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Agent Commissions</p>
                    <p className="text-xl font-bold text-cyan-700">₹{(stats?.totalAgentCommissions || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeIn}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <TrendingUp className="size-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Completed Txns</p>
                    <p className="text-xl font-bold text-rose-700">{transactions.length.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Row: Revenue Split + Monthly Revenue Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Split Donut Chart */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChartIcon className="size-4 text-[#D4AF37]" /> Revenue Split
              </h3>
              <div className="h-64">
                {(stats?.totalPlatformRevenue || stats?.totalCityAdminRevenue || stats?.totalAgentCommissions) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Super Admin', value: stats?.totalPlatformRevenue || 0, fill: '#50C878' },
                          { name: 'City Admins', value: stats?.totalCityAdminRevenue || 0, fill: '#9B59B6' },
                          { name: 'Agent Commissions', value: stats?.totalAgentCommissions || 0, fill: '#4169E1' },
                        ].filter(d => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {[
                          { name: 'Super Admin', value: stats?.totalPlatformRevenue || 0, fill: '#50C878' },
                          { name: 'City Admins', value: stats?.totalCityAdminRevenue || 0, fill: '#9B59B6' },
                          { name: 'Agent Commissions', value: stats?.totalAgentCommissions || 0, fill: '#4169E1' },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                        }}
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieChartIcon className="size-8 mb-2 text-gray-300" />
                    <p className="text-sm">No revenue data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Revenue Trend Line Chart */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-[#50C878]" /> Monthly Revenue Trend
              </h3>
              <div className="h-64">
                {(stats?.transactionRevenueGrowth && stats.transactionRevenueGrowth.length > 0 && stats.transactionRevenueGrowth.some(r => r.revenue > 0)) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.transactionRevenueGrowth}>
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
                        formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#D4AF37"
                        strokeWidth={2.5}
                        dot={{ fill: '#D4AF37', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp className="size-8 mb-2 text-gray-300" />
                    <p className="text-sm">No transaction revenue yet</p>
                    <p className="text-xs text-gray-300">Revenue from transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions by Type */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-[#4169E1]" /> Transactions by Type
            </h3>
            {(!stats?.transactionsByType || stats.transactionsByType.length === 0) ? (
              <p className="text-center text-gray-500 py-6">No transaction data yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.transactionsByType.map((item) => {
                  const typeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
                    LISTING: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Store className="size-4" /> },
                    BANNER: { bg: 'bg-rose-50', text: 'text-rose-700', icon: <Megaphone className="size-4" /> },
                    NEWS_POST: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <FileText className="size-4" /> },
                    SUBSCRIPTION: { bg: 'bg-purple-50', text: 'text-purple-700', icon: <Crown className="size-4" /> },
                    FRANCHISEE_FEE: { bg: 'bg-green-50', text: 'text-green-700', icon: <Landmark className="size-4" /> },
                  }
                  const style = typeColors[item.type] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: <Coins className="size-4" /> }
                  return (
                    <div key={item.type} className={`${style.bg} rounded-xl p-4 border border-white/30`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={style.text}>{style.icon}</span>
                        <span className={`text-sm font-semibold ${style.text}`}>{item.type.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">₹{item.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{item.count} transaction{item.count !== 1 ? 's' : ''}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* City-wise Revenue Breakdown */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <PieChartIcon className="size-4 text-[#4169E1]" /> City-wise Revenue Breakdown
            </h3>
            {(!stats?.cityRevenueBreakdown || stats.cityRevenueBreakdown.length === 0) ? (
              <p className="text-center text-gray-500 py-6">No city revenue data yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Platform Share</TableHead>
                      <TableHead>City Admin Share</TableHead>
                      <TableHead>Agent Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.cityRevenueBreakdown.map((city) => (
                      <TableRow key={city.cityId}>
                        <TableCell className="font-medium">{city.cityName}</TableCell>
                        <TableCell className="font-semibold">₹{city.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                        <TableCell><Badge variant="secondary">{city.transactionCount}</Badge></TableCell>
                        <TableCell className="text-green-700">₹{city.superAdminShare.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-purple-700">₹{city.cityAdminShare.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-blue-700">₹{city.agentCommissions.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-[#D4AF37]" /> Recent Transactions (Last 20)
            </h3>
            {transactionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-[#D4AF37]" /></div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No transactions yet</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Agent Commission</TableHead>
                      <TableHead>City Admin Share</TableHead>
                      <TableHead>Platform Share</TableHead>
                      <TableHead>City</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 20).map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="secondary">{t.type}</Badge></TableCell>
                        <TableCell className="font-semibold">₹{t.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-blue-700">₹{t.agentCommission.toLocaleString()}</TableCell>
                        <TableCell className="text-purple-700">₹{t.cityAdminShare.toLocaleString()}</TableCell>
                        <TableCell className="text-green-700">₹{t.superAdminShare.toLocaleString()}</TableCell>
                        <TableCell>{t.city?.name || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Payout Requests */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard className="size-4 text-orange-600" /> Payout Requests
            </h3>
            {payoutsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-orange-600" /></div>
            ) : payoutRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No payout requests yet</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>UPI ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutRequests.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.user.fullName}</TableCell>
                        <TableCell><Badge variant="secondary">{p.user.role}</Badge></TableCell>
                        <TableCell className="font-semibold">₹{p.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{p.upiId || p.user.upiId || '—'}</TableCell>
                        <TableCell>
                          {p.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>}
                          {p.status === 'approved' && <Badge className="bg-blue-100 text-blue-700 border-blue-200">Approved</Badge>}
                          {p.status === 'paid' && <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>}
                          {p.status === 'rejected' && <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>}
                        </TableCell>
                        <TableCell>
                          {(p.status === 'pending' || p.status === 'approved') && (
                            <div className="flex gap-1">
                              {p.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                  disabled={processingPayout === p.id}
                                  onClick={() => handlePayoutAction(p.id, 'approve')}
                                >
                                  Approve
                                </Button>
                              )}
                              {p.status === 'approved' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                  disabled={processingPayout === p.id}
                                  onClick={() => handlePayoutAction(p.id, 'paid')}
                                >
                                  <FileCheck className="size-3 mr-1" />Mark Paid
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                                disabled={processingPayout === p.id}
                                onClick={() => handlePayoutAction(p.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: LOCATION MANAGER (super_admin only)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="locations" className="mt-4 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#50C878] flex items-center justify-center">
                <MapPin className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Location Manager</h2>
                <p className="text-sm text-gray-500">Manage states, districts, cities, mandals & pincodes</p>
              </div>
            </div>
          </div>

          {/* Add New Location Form */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Plus className="size-4 text-[#D4AF37]" /> Add New Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">State *</Label>
                <Input
                  value={locationForm.state}
                  onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
                  placeholder="Telangana"
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div>
                <Label className="text-xs">District *</Label>
                <Input
                  value={locationForm.district}
                  onChange={(e) => setLocationForm({ ...locationForm, district: e.target.value })}
                  placeholder="Yadadri"
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div>
                <Label className="text-xs">City *</Label>
                <Input
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                  placeholder="Choutuppal"
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div>
                <Label className="text-xs">Mandal</Label>
                <Input
                  value={locationForm.mandal}
                  onChange={(e) => setLocationForm({ ...locationForm, mandal: e.target.value })}
                  placeholder="Choutuppal"
                  className="bg-white/50 border-white/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <div>
                <Label className="text-xs">Pincode</Label>
                <Input
                  value={locationForm.pincode}
                  onChange={(e) => setLocationForm({ ...locationForm, pincode: e.target.value })}
                  placeholder="508252"
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div>
                <Label className="text-xs">Latitude</Label>
                <Input
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                  placeholder="17.2985"
                  type="number"
                  step="any"
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div>
                <Label className="text-xs">Longitude</Label>
                <Input
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                  placeholder="78.9256"
                  type="number"
                  step="any"
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                  onClick={handleAddLocation}
                  disabled={addingLocation}
                >
                  {addingLocation ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Plus className="size-4 mr-2" />}
                  Add Location
                </Button>
              </div>
            </div>
          </div>

          {/* Locations Table */}
          {locationsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-[#4169E1]" /></div>
          ) : locations.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
              <p className="text-center text-gray-500 py-8">No locations found</p>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-6">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Mandal</TableHead>
                      <TableHead>Pincode</TableHead>
                      <TableHead>Coords</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium">{loc.state}</TableCell>
                        <TableCell>{loc.district}</TableCell>
                        <TableCell>{loc.city}</TableCell>
                        <TableCell>{loc.mandal || '—'}</TableCell>
                        <TableCell>{loc.pincode || '—'}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {loc.latitude || loc.longitude ? `${loc.latitude}, ${loc.longitude}` : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => setEditingLocation(loc)}
                            >
                              <Edit3 className="size-3 mr-1" />Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs"
                              onClick={() => setDeleteLocationDialog(loc.id)}
                            >
                              <Trash2 className="size-3 mr-1" />Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Edit Location Dialog */}
          <Dialog open={!!editingLocation} onOpenChange={(open) => !open && setEditingLocation(null)}>
            <DialogContent className="bg-white/90 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogDescription>Update the location details below</DialogDescription>
              </DialogHeader>
              {editingLocation && (
                <div className="space-y-3">
                  <div>
                    <Label>State</Label>
                    <Input
                      value={editingLocation.state}
                      onChange={(e) => setEditingLocation({ ...editingLocation, state: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input
                      value={editingLocation.district}
                      onChange={(e) => setEditingLocation({ ...editingLocation, district: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={editingLocation.city}
                      onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div>
                    <Label>Mandal</Label>
                    <Input
                      value={editingLocation.mandal || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, mandal: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div>
                    <Label>Pincode</Label>
                    <Input
                      value={editingLocation.pincode || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, pincode: e.target.value })}
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        value={editingLocation.latitude || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, latitude: parseFloat(e.target.value) || 0 })}
                        type="number"
                        step="any"
                        className="bg-white/50 border-white/40"
                      />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input
                        value={editingLocation.longitude || ''}
                        onChange={(e) => setEditingLocation({ ...editingLocation, longitude: parseFloat(e.target.value) || 0 })}
                        type="number"
                        step="any"
                        className="bg-white/50 border-white/40"
                      />
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingLocation(null)}>Cancel</Button>
                <Button
                  className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white"
                  onClick={handleEditLocation}
                >
                  <Save className="size-4 mr-2" />Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Location Confirmation Dialog */}
          <Dialog open={!!deleteLocationDialog} onOpenChange={(open) => !open && setDeleteLocationDialog(null)}>
            <DialogContent className="bg-white/90 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Delete Location</DialogTitle>
                <DialogDescription>Are you sure you want to delete this location? This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteLocationDialog(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteLocationDialog && handleDeleteLocation(deleteLocationDialog)}
                >
                  <Trash2 className="size-4 mr-2" />Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        )}

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
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Users className="size-8 mb-2 text-gray-300" />
                    <p className="text-sm">Waiting for data</p>
                    <p className="text-xs text-gray-300">User signups will appear here</p>
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
                {(stats?.revenueGrowth && stats.revenueGrowth.length > 0 && stats.revenueGrowth.some(r => r.revenue > 0)) ? (
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
                        formatter={(value: any) => [`₹${value}`, 'Revenue']}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp className="size-8 mb-2 text-gray-300" />
                    <p className="text-sm">₹0 revenue</p>
                    <p className="text-xs text-gray-300">Subscription revenue will appear here</p>
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

          {/* Most Viewed Listings + Top Categories + WhatsApp Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Most Viewed Listings Leaderboard */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Eye className="size-4 text-[#4169E1]" />
                Most Viewed Listings
              </h3>
              <div className="space-y-2">
                {stats?.mostViewedListings && stats.mostViewedListings.length > 0 ? (
                  stats.mostViewedListings.map((listing, idx) => (
                    <div key={listing.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/50 border border-gray-50">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        idx === 0 ? 'bg-[#D4AF37]' : idx === 1 ? 'bg-[#C0C0C0]' : idx === 2 ? 'bg-[#CD7F32]' : 'bg-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{listing.name}</p>
                        <p className="text-xs text-gray-400">{listing.category}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{listing.viewsCount} views</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    {statsLoading ? 'Loading...' : 'No view data yet'}
                  </p>
                )}
              </div>
            </GlassCard>

            {/* Top Categories Pie Chart */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <PieChartIcon className="size-4 text-[#D4AF37]" />
                Top Categories
              </h3>
              <div className="h-48">
                {stats?.listingsByCategory && stats.listingsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.listingsByCategory}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={(props: any) => `${props.category}: ${props.count}`}
                        labelLine={false}
                      >
                        {stats.listingsByCategory.map((_, index) => {
                          const COLORS = ['#D4AF37', '#4169E1', '#50C878', '#FF6B6B', '#9B59B6', '#E67E22', '#1ABC9C', '#95A5A6']
                          return <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PieChartIcon className="size-8 mb-2 text-gray-300" />
                    <p className="text-sm">No category data</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* WhatsApp Tracking Stats */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle className="size-4 text-green-500" />
                Click-to-WhatsApp
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 rounded-xl bg-green-50/50 border border-green-100">
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.whatsappClicks || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">WhatsApp Button Clicks</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Leads</span>
                    <span className="font-semibold">{stats?.totalLeads || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Via WhatsApp</span>
                    <span className="font-semibold text-green-600">{stats?.whatsappClicks || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Conversion Rate</span>
                    <span className="font-semibold text-[#D4AF37]">
                      {stats?.totalLeads ? Math.round(((stats.whatsappClicks || 0) / stats.totalLeads) * 100) : 0}%
                    </span>
                  </div>
                </div>
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
              <MediaUploader
                value={newCityHero}
                onChange={setNewCityHero}
                guideline="hero"
                folder="choutuppal/cities"
                label="Hero Image"
                className="col-span-1 sm:col-span-2"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Brand Name</Label>
                <Input placeholder="e.g. Choutuppal App" value={newCityBrandName}
                  onChange={(e) => setNewCityBrandName(e.target.value)}
                  className="bg-white/50 border-white/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Primary Color</Label>
                <div className="flex gap-2">
                  <Input value={newCityPrimaryColor} onChange={(e) => setNewCityPrimaryColor(e.target.value)}
                    className="bg-white/50 border-white/40 flex-1" />
                  <div className="w-10 h-10 rounded-lg border shrink-0" style={{ backgroundColor: newCityPrimaryColor }} />
                </div>
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

              {/* Bulk Actions Bar */}
              {selectedListings.size > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                  <span className="text-sm font-medium text-[#D4AF37] self-center mr-2">{selectedListings.size} selected</span>
                  <Button size="sm" className="h-7 text-xs bg-green-600 text-white" disabled={bulkActionLoading} onClick={() => handleBulkAction('approve')}>
                    <CheckCircle className="size-3 mr-1" />Approve Selected
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-600" disabled={bulkActionLoading} onClick={() => handleBulkAction('reject')}>
                    <XCircle className="size-3 mr-1" />Reject Selected
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-[#D4AF37]/30 text-[#D4AF37]" disabled={bulkActionLoading} onClick={() => handleBulkAction('feature')}>
                    <Star className="size-3 mr-1" />Feature Selected
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedListings(new Set())}>
                    Clear Selection
                  </Button>
                </motion.div>
              )}

              {/* Business Listings */}
              <TabsContent value="business">
                {listingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
                  </div>
                ) : adminListings.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <Store className="size-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No {listingFilter === 'all' ? '' : listingFilter} business listings</p>
                    <p className="text-xs text-gray-400 mt-1">New business submissions will appear here for review</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <input
                              type="checkbox"
                              checked={selectedListings.size === adminListings.length && adminListings.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedListings(new Set(adminListings.map(l => l.id)))
                                } else {
                                  setSelectedListings(new Set())
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </TableHead>
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
                                <input
                                  type="checkbox"
                                  checked={selectedListings.has(listing.id)}
                                  onChange={(e) => {
                                    const next = new Set(selectedListings)
                                    if (e.target.checked) next.add(listing.id); else next.delete(listing.id)
                                    setSelectedListings(next)
                                  }}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>
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
                                  {listing.status !== 'APPROVED' && (
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
                                  {listing.status !== 'REJECTED' && (
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
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <Building2 className="size-7 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No {listingFilter === 'all' ? '' : listingFilter} real estate listings</p>
                    <p className="text-xs text-gray-400 mt-1">New property submissions will appear here for review</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <input
                              type="checkbox"
                              checked={selectedListings.size === reListings.length && reListings.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedListings(new Set(reListings.map(l => l.id)))
                                } else {
                                  setSelectedListings(new Set())
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </TableHead>
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
                                <input
                                  type="checkbox"
                                  checked={selectedListings.has(listing.id)}
                                  onChange={(e) => {
                                    const next = new Set(selectedListings)
                                    if (e.target.checked) next.add(listing.id); else next.delete(listing.id)
                                    setSelectedListings(next)
                                  }}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>
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
                                  {listing.status !== 'APPROVED' && (
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
                                  {listing.status !== 'REJECTED' && (
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
            TAB: USER MANAGEMENT
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="users" className="mt-4 space-y-4">
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <UserCog className="size-4 text-[#4169E1]" />
                User Management
                <Badge variant="secondary">{adminUsers.length} users</Badge>
              </h3>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <Input
                    placeholder="Search name, phone, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 h-8 text-sm bg-white/50 border-white/40 w-full sm:w-56"
                  />
                </div>
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="h-8 text-sm w-28 bg-white/50 border-white/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="size-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Listings</TableHead>
                      <TableHead className="hidden sm:table-cell">Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-sm">{u.fullName}</TableCell>
                        <TableCell className="text-sm text-gray-500">{u.phone}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-gray-500">{u.email || '—'}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${
                            u.subscriptionTier === 'premium' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' :
                            u.subscriptionTier === 'pro' ? 'bg-[#4169E1]/10 text-[#4169E1]' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {u.subscriptionTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'banned' ? 'bg-red-100 text-red-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{u._count.listings}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 items-end">
                            <Select
                              value={u.role}
                              disabled={!isSuperAdmin}
                              onValueChange={(newRole) => handleUserAction(u.id, 'changeRole', undefined, { newRole })}
                            >
                              <SelectTrigger className="h-7 w-32 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="city_admin">City Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="banned">Banned</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {(u.role === 'agent' || u.role === 'city_admin') && (
                              <Select
                                value={u.role === 'agent' ? u.agentCityId || '' : u.managedCityId || ''}
                                disabled={!isSuperAdmin}
                                onValueChange={(cityId) => handleUserAction(u.id, 'changeRole', undefined, { newRole: u.role, cityId })}
                              >
                                <SelectTrigger className="h-7 w-32 text-xs border-dashed border-gray-300">
                                  <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cities.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <div className="flex gap-1 mt-1">
                            <Dialog open={addCoinsDialog === u.id} onOpenChange={(open) => { if (!open) setAddCoinsDialog(null) }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-6 text-xs border-[#D4AF37]/30 text-[#D4AF37]" onClick={() => setAddCoinsDialog(u.id)}>
                                  <Coins className="size-3 mr-0.5" />Coins
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Coins to {u.fullName}</DialogTitle>
                                  <DialogDescription>Current balance: {u.coinsBalance} coins</DialogDescription>
                                </DialogHeader>
                                <Input
                                  type="number"
                                  placeholder="Amount (e.g. 50)"
                                  value={addCoinsAmount}
                                  onChange={(e) => setAddCoinsAmount(e.target.value)}
                                />
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setAddCoinsDialog(null)}>Cancel</Button>
                                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white" onClick={() => handleUserAction(u.id, 'addCoins', addCoinsAmount)}>
                                    Add Coins
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            </div>
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
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <Inbox className="size-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No leads yet</p>
                <p className="text-xs text-gray-400 mt-1">Leads will appear here when customers enquire about listings</p>
              </div>
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
          {/* Sub-tabs for News / Blogs */}
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant={contentSubTab === 'news' ? 'default' : 'outline'}
              onClick={() => setContentSubTab('news')}
              className={contentSubTab === 'news' ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white' : ''}
            >
              <FileText className="size-3.5 mr-1" />News
            </Button>
            <Button
              size="sm"
              variant={contentSubTab === 'blogs' ? 'default' : 'outline'}
              onClick={() => setContentSubTab('blogs')}
              className={contentSubTab === 'blogs' ? 'bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white' : ''}
            >
              <Edit3 className="size-3.5 mr-1" />Blogs
            </Button>
          </div>

          {contentSubTab === 'news' ? (
            <>
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
                  {isCityAdmin && managedCityId ? (
                    <Input
                      value={cities.find((c) => c.id === managedCityId)?.name || 'Your City'}
                      disabled
                      className="bg-gray-100 border-white/40"
                    />
                  ) : (
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
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MediaUploader
                  value={newsForm.imageUrl}
                  onChange={(url) => setNewsForm({ ...newsForm, imageUrl: url })}
                  guideline="news"
                  folder="choutuppal/news"
                  acceptVideo
                  label="Article Thumbnail / Video"
                />
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
            </>
          ) : (
            <>
          {/* ═══════════════════════════════════════════════════════════════════════
              BLOGS SUB-TAB
          ═══════════════════════════════════════════════════════════════════════ */}

          {/* Blog Editor Form */}
          <GlassCard variant="gold">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Edit3 className="size-4 text-[#4169E1]" />
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Title</Label>
                  <Input
                    placeholder="Blog title..."
                    value={blogForm.title}
                    onChange={(e) => {
                      setBlogForm({
                        ...blogForm,
                        title: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                      })
                    }}
                    className="bg-white/50 border-white/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Slug</Label>
                  <Input
                    placeholder="auto-generated-from-title"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                    className="bg-white/50 border-white/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MediaUploader
                  value={blogForm.coverImageUrl}
                  onChange={(url) => setBlogForm({ ...blogForm, coverImageUrl: url })}
                  guideline="blog"
                  folder="choutuppal/blogs"
                  label="Cover Image"
                />
                <div className="space-y-1.5">
                  <Label className="text-sm">City</Label>
                  {isCityAdmin && managedCityId ? (
                    <Input
                      value={cities.find((c) => c.id === managedCityId)?.name || 'Your City'}
                      disabled
                      className="bg-gray-100 border-white/40"
                    />
                  ) : (
                    <Select value={blogForm.cityId} onValueChange={(val) => setBlogForm({ ...blogForm, cityId: val === '_global_' ? '' : val })}>
                      <SelectTrigger className="bg-white/50 border-white/40">
                        <SelectValue placeholder="Select city or Global" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_global_">🌍 Global (All Cities)</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* TipTap Toolbar for Blog */}
              <div className="space-y-1.5">
                <Label className="text-sm">Content</Label>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => blogEditor?.chain().focus().toggleBold().run()}>
                      <Bold className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => blogEditor?.chain().focus().toggleItalic().run()}>
                      <Italic className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => blogEditor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                      <Heading2 className="size-3.5" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { const url = window.prompt('Enter URL:'); if (url) blogEditor?.chain().focus().setLink({ href: url }).run() }}>
                      <Link2 className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => blogEditor?.chain().focus().toggleBulletList().run()}>
                      <List className="size-3.5" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => blogEditor?.chain().focus().toggleOrderedList().run()}>
                      <ListOrdered className="size-3.5" />
                    </Button>
                  </div>
                  <EditorContent
                    editor={blogEditor}
                    className="prose prose-sm max-w-none p-3 min-h-[200px] focus:outline-none [&_.tiptap]:min-h-[180px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400 [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
                  />
                </div>
              </div>

              {/* Published Toggle + Save */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={blogForm.isPublished}
                    onCheckedChange={(checked) => setBlogForm({ ...blogForm, isPublished: checked })}
                  />
                  <Label className="text-sm">
                    {blogForm.isPublished ? 'Published' : 'Draft'}
                  </Label>
                </div>
                <div className="flex gap-2">
                  {editingBlog && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingBlog(null)
                        if (blogEditor) blogEditor.commands.setContent('')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSaveBlog}
                      disabled={savingBlog || !blogForm.title}
                      className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white"
                    >
                      {savingBlog ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                      {editingBlog ? 'Update Blog' : 'Publish Blog'}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Blog List */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Edit3 className="size-4 text-[#4169E1]" />
              All Blog Posts
              <Badge variant="secondary" className="ml-1">{blogs.length}</Badge>
            </h3>
            {blogsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#4169E1]" />
              </div>
            ) : blogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No blog posts yet. Create your first blog above.</p>
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
                    {blogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {blog.coverImageUrl && (
                              <Image src={blog.coverImageUrl} alt="" width={32} height={32} className="w-8 h-8 rounded object-cover shrink-0" />
                            )}
                            <p className="font-medium text-sm max-w-[200px] truncate">{blog.title}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{blog.city?.name || <Badge variant="outline" className="text-xs">Global</Badge>}</TableCell>
                        <TableCell>
                          {blog.isPublished ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Published</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-500 border-gray-200">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(blog.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm" variant="outline"
                              onClick={() => setEditingBlog(blog)}
                              className="h-7 text-xs border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/5"
                            >
                              <Edit3 className="size-3 mr-0.5" />Edit
                            </Button>
                            <Dialog open={deleteBlogDialog === blog.id} onOpenChange={(open) => { if (!open) setDeleteBlogDialog(null) }}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm" variant="outline"
                                  onClick={() => setDeleteBlogDialog(blog.id)}
                                  className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="size-3 mr-0.5" />Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Blog</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete &quot;{blog.title}&quot;?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setDeleteBlogDialog(null)}>Cancel</Button>
                                  <Button variant="destructive" onClick={() => handleDeleteBlog(blog.id)}>Delete</Button>
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
            </>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 6: GAMIFICATION MANAGER
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="coupons" className="mt-4 space-y-4">
          <CouponManagement />
        </TabsContent>

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
            TAB: BANNER MANAGEMENT
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="banners" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Megaphone className="size-5 text-[#D4AF37]" />
              Banner Ads Management
            </h2>
            <Button
              onClick={() => {
                setEditingBanner(null)
                setBannerForm({ title: '', imageUrl: '', shopName: '', offerText: '', linkUrl: '', cityId: '', isActive: true })
                document.getElementById('banner-file-input')?.click()
              }}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
            >
              <Plus className="size-4 mr-1" /> Add Banner
            </Button>
          </div>

          {/* Hidden File Input for 1-Click Banner Creation */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="banner-file-input"
            onChange={async (e) => {
              const files = e.target.files
              if (!files || files.length === 0) return

              toast.info('Compressing and uploading image...')
              try {
                const file = files[0]
                let fileToUpload = file
                if (file.type.startsWith('image/')) {
                  const imageCompression = (await import('browser-image-compression')).default
                  const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true, initialQuality: 0.6 }
                  fileToUpload = await imageCompression(file, options)
                }

                const { data: uploadResult, error } = await supabase.storage
                  .from('listing-images')
                  .upload(`choutuppal/banners/${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '')}`, fileToUpload, { cacheControl: '3600', upsert: false });

                if (error) throw new Error('Upload failed');
                const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(uploadResult.path);
                const data = { url: urlData.publicUrl };


                setBannerForm((prev) => ({ ...prev, imageUrl: data.url }))
                setShowBannerForm(true)
              } catch (err) {
                toast.error('Failed to upload image')
              }
              e.target.value = ''
            }}
          />

          {/* Banner Form Dialog */}
          <Dialog open={showBannerForm} onOpenChange={setShowBannerForm}>
            <DialogContent className="sm:max-w-md max-h-[95vh] overflow-y-auto p-0 border-0 bg-white shadow-2xl rounded-xl">
              <div className="relative w-full aspect-[21/9] bg-gray-100 flex items-center justify-center overflow-hidden">
                {bannerForm.imageUrl ? (
                  <img src={bannerForm.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <Megaphone className="size-16 text-gray-300" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/40 text-white hover:bg-black/60 rounded-full"
                  onClick={() => setShowBannerForm(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Title *</Label>
                  <Input
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., 50% Off on All Medicines!"
                    className="mt-1 bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Shop Name</Label>
                  <Input
                    value={bannerForm.shopName}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, shopName: e.target.value }))}
                    placeholder="e.g., Ramesh Medicals"
                    className="mt-1 bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Offer Text</Label>
                  <Input
                    value={bannerForm.offerText}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, offerText: e.target.value }))}
                    placeholder="e.g., 20% డిస్కౌంట్!"
                    className="mt-1 bg-gray-50 border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Link URL</Label>
                  <Input
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm((prev) => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="https://... or /premium"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">City</Label>
                  <Select
                    value={bannerForm.cityId || 'all'}
                    onValueChange={(val) => setBannerForm((prev) => ({ ...prev, cityId: val === 'all' ? '' : val }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={bannerForm.isActive}
                    onCheckedChange={(checked) => setBannerForm((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label className="text-sm font-medium">
                    {bannerForm.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBannerForm(false)}>Cancel</Button>
                <Button onClick={handleSaveBanner} disabled={savingBanner} className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white">
                  {savingBanner ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
                  {editingBanner ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Banner Ads Table */}
          <GlassCard>
            {bannerLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-[#D4AF37]" />
              </div>
            ) : bannerAds.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Megaphone className="size-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No banner ads yet</p>
                <p className="text-sm">Click "Add Banner" to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Shop</TableHead>
                      <TableHead>Offer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bannerAds.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          {banner.imageUrl ? (
                            <div className="w-12 h-8 rounded overflow-hidden bg-gray-100">
                              <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-8 rounded bg-gradient-to-r from-[#D4AF37]/30 to-[#4169E1]/30 flex items-center justify-center">
                              <ImageIcon className="size-3 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">{banner.title}</TableCell>
                        <TableCell className="text-sm text-gray-600">{banner.shopName || '—'}</TableCell>
                        <TableCell className="text-sm text-[#D4AF37] font-medium">{banner.offerText || '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 items-center">
                            {getListingStatusBadge(banner)}
                            <button onClick={() => handleToggleBannerActive(banner)}>
                              <Badge className={banner.isActive ? 'bg-green-100 text-green-700 border-green-200 cursor-pointer' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-pointer'}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            {banner.status !== 'APPROVED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await fetch('/api/banners', { method: 'PUT', body: JSON.stringify({ id: banner.id, status: 'APPROVED' }) })
                                  setBannerAds(bannerAds.map(b => b.id === banner.id ? { ...b, status: 'APPROVED' } : b))
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="size-3.5" />
                              </Button>
                            )}
                            {banner.status !== 'REJECTED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await fetch('/api/banners', { method: 'PUT', body: JSON.stringify({ id: banner.id, status: 'REJECTED' }) })
                                  setBannerAds(bannerAds.map(b => b.id === banner.id ? { ...b, status: 'REJECTED' } : b))
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="size-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingBanner(banner)
                                setBannerForm({
                                  title: banner.title,
                                  imageUrl: banner.imageUrl || '',
                                  shopName: banner.shopName || '',
                                  offerText: banner.offerText || '',
                                  linkUrl: banner.linkUrl || '',
                                  cityId: banner.cityId || '',
                                  isActive: banner.isActive,
                                })
                                setShowBannerForm(true)
                              }}
                            >
                              <Edit3 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteBannerDialog(banner.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>

          {/* Delete Banner Dialog */}
          <Dialog open={!!deleteBannerDialog} onOpenChange={() => setDeleteBannerDialog(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Banner?</DialogTitle>
                <DialogDescription>This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteBannerDialog(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => deleteBannerDialog && handleDeleteBanner(deleteBannerDialog)}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: ANNOUNCEMENTS (TICKER)
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="announcements" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Megaphone className="size-5 text-[#4169E1]" />
              Announcements Ticker
            </h2>
            <Button
              onClick={() => {
                setEditingAnnouncement(null)
                setAnnouncementForm({ text: '', isActive: true })
                setShowAnnouncementForm(true)
              }}
              className="bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white"
            >
              <Plus className="size-4 mr-1" /> Add Announcement
            </Button>
          </div>

          {/* Preview of live ticker */}
          {announcements.filter((a) => a.isActive).length > 0 && (
            <div className="w-full bg-[#4169E1]/10 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl py-2 px-4 overflow-hidden">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#4169E1] whitespace-nowrap flex items-center gap-1 shrink-0">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  తాజా వార్త:
                </span>
                <p className="text-sm font-semibold text-[#4169E1] whitespace-nowrap animate-marquee">
                  {announcements.filter((a) => a.isActive).map((a) => a.text).join('  ✦  ')}
                </p>
              </div>
            </div>
          )}

          {/* Announcement Form Dialog */}
          <Dialog open={showAnnouncementForm} onOpenChange={setShowAnnouncementForm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
                <DialogDescription>
                  Telugu text that scrolls in the announcement ticker on the home page
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm font-medium">Announcement Text (Telugu) *</Label>
                  <Textarea
                    value={announcementForm.text}
                    onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder="🚨 చౌటుప్పల్ సూపర్ యాప్ డౌన్‌లోడ్ చేసుకోండి!"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={announcementForm.isActive}
                    onCheckedChange={(checked) => setAnnouncementForm((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label className="text-sm font-medium">
                    {announcementForm.isActive ? 'Active (visible in ticker)' : 'Inactive (hidden)'}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>Cancel</Button>
                <Button onClick={handleSaveAnnouncement} disabled={savingAnnouncement} className="bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white">
                  {savingAnnouncement ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
                  {editingAnnouncement ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Announcements Table */}
          <GlassCard>
            {announcementLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-[#4169E1]" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Megaphone className="size-10 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No announcements yet</p>
                <p className="text-sm">Add announcements to display in the home page ticker</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Announcement Text</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-28 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((ann) => (
                      <TableRow key={ann.id}>
                        <TableCell className="font-medium text-sm max-w-[400px]">{ann.text}</TableCell>
                        <TableCell>
                          <button onClick={() => handleToggleAnnouncementActive(ann)}>
                            <Badge className={ann.isActive ? 'bg-green-100 text-green-700 border-green-200 cursor-pointer' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-pointer'}>
                              {ann.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingAnnouncement(ann)
                                setAnnouncementForm({ text: ann.text, isActive: ann.isActive })
                                setShowAnnouncementForm(true)
                              }}
                            >
                              <Edit3 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteAnnouncementDialog(ann.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>

          {/* Delete Announcement Dialog */}
          <Dialog open={!!deleteAnnouncementDialog} onOpenChange={() => setDeleteAnnouncementDialog(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Announcement?</DialogTitle>
                <DialogDescription>This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteAnnouncementDialog(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => deleteAnnouncementDialog && handleDeleteAnnouncement(deleteAnnouncementDialog)}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: CITY BRANDING (SUPER ADMIN ONLY)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="branding" className="mt-4 space-y-4">
          {/* Add New City with Branding */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="size-4 text-[#D4AF37]" />
              Add New City with Branding
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">City Name *</Label>
                <Input placeholder="e.g. Warangal" value={newCityBranding.name}
                  onChange={(e) => setNewCityBranding({ ...newCityBranding, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  className="bg-white/50 border-white/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Slug *</Label>
                <Input placeholder="e.g. warangal" value={newCityBranding.slug}
                  onChange={(e) => setNewCityBranding({ ...newCityBranding, slug: e.target.value })}
                  className="bg-white/50 border-white/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">State</Label>
                <Input value={newCityBranding.state}
                  onChange={(e) => setNewCityBranding({ ...newCityBranding, state: e.target.value })}
                  className="bg-white/50 border-white/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Brand Name</Label>
                <Input placeholder="e.g. Warangal App" value={newCityBranding.brandName}
                  onChange={(e) => setNewCityBranding({ ...newCityBranding, brandName: e.target.value })}
                  className="bg-white/50 border-white/40" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <MediaUploader value={newCityBranding.logoUrl} onChange={(url) => setNewCityBranding({ ...newCityBranding, logoUrl: url })}
                guideline="logo" folder="cities/branding" label="Logo" />
              <MediaUploader value={newCityBranding.heroImageUrl} onChange={(url) => setNewCityBranding({ ...newCityBranding, heroImageUrl: url })}
                guideline="hero" folder="cities/branding" label="Hero Image" />
              <div className="space-y-1.5">
                <Label className="text-sm">Primary Color</Label>
                <div className="flex gap-2">
                  <Input value={newCityBranding.primaryColor} onChange={(e) => setNewCityBranding({ ...newCityBranding, primaryColor: e.target.value })}
                    className="bg-white/50 border-white/40 flex-1" />
                  <div className="w-10 h-10 rounded-lg border shrink-0" style={{ backgroundColor: newCityBranding.primaryColor }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input value={newCityBranding.secondaryColor} onChange={(e) => setNewCityBranding({ ...newCityBranding, secondaryColor: e.target.value })}
                    className="bg-white/50 border-white/40 flex-1" />
                  <div className="w-10 h-10 rounded-lg border shrink-0" style={{ backgroundColor: newCityBranding.secondaryColor }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Latitude</Label>
                <Input value={newCityBranding.latitude} onChange={(e) => setNewCityBranding({ ...newCityBranding, latitude: e.target.value })}
                  className="bg-white/50 border-white/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Longitude</Label>
                <Input value={newCityBranding.longitude} onChange={(e) => setNewCityBranding({ ...newCityBranding, longitude: e.target.value })}
                  className="bg-white/50 border-white/40" />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button onClick={handleAddCityBranding} disabled={addingCityBranding || !newCityBranding.name || !newCityBranding.slug}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white">
                {addingCityBranding ? <><Loader2 className="size-4 mr-2 animate-spin" />Adding...</> : <><Plus className="size-4 mr-2" />Add City</>}
              </Button>
            </motion.div>
          </GlassCard>

          {/* Existing Cities Branding */}
          {cities.map((city) => {
            const edit = brandingEdits[city.id] || {
              brandName: city.brandName || '',
              logoUrl: city.logoUrl || '',
              heroImageUrl: city.heroImageUrl || '',
              primaryColor: city.primaryColor || '#4169E1',
              secondaryColor: city.secondaryColor || '#D4AF37',
              latitude: String(city.latitude ?? 17.2985),
              longitude: String(city.longitude ?? 78.9256),
            }
            const updateEdit = (key: string, value: string) =>
              setBrandingEdits((prev) => ({ ...prev, [city.id]: { ...edit, [key]: value } }))

            return (
              <GlassCard key={city.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Palette className="size-4 text-[#4169E1]" />
                    {city.name}
                    <Badge variant="secondary" className="text-xs">{city.slug}</Badge>
                    <Badge variant="outline" className="text-xs">{city.state}</Badge>
                  </h3>
                  <Button size="sm" onClick={() => handleSaveBranding(city.id)}
                    disabled={savingBranding === city.id || !brandingEdits[city.id]}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white h-8 text-xs">
                    {savingBranding === city.id ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Save className="size-3.5 mr-1" />}
                    Save
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Brand Name</Label>
                    <Input value={edit.brandName} onChange={(e) => updateEdit('brandName', e.target.value)}
                      className="bg-white/50 border-white/40" />
                  </div>
                  <MediaUploader value={edit.logoUrl} onChange={(url) => updateEdit('logoUrl', url)}
                    guideline="logo" folder={`cities/${city.slug}/branding`} label="Logo" />
                  <MediaUploader value={edit.heroImageUrl} onChange={(url) => updateEdit('heroImageUrl', url)}
                    guideline="hero" folder={`cities/${city.slug}/branding`} label="Hero Image" />
                  <div className="space-y-1.5">
                    <Label className="text-sm">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input value={edit.primaryColor} onChange={(e) => updateEdit('primaryColor', e.target.value)}
                        className="bg-white/50 border-white/40 flex-1" />
                      <div className="w-10 h-10 rounded-lg border shrink-0" style={{ backgroundColor: edit.primaryColor }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input value={edit.secondaryColor} onChange={(e) => updateEdit('secondaryColor', e.target.value)}
                        className="bg-white/50 border-white/40 flex-1" />
                      <div className="w-10 h-10 rounded-lg border shrink-0" style={{ backgroundColor: edit.secondaryColor }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Latitude</Label>
                    <Input value={edit.latitude} onChange={(e) => updateEdit('latitude', e.target.value)}
                      className="bg-white/50 border-white/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Longitude</Label>
                    <Input value={edit.longitude} onChange={(e) => updateEdit('longitude', e.target.value)}
                      className="bg-white/50 border-white/40" />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex gap-2">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Primary</p>
                        <div className="w-12 h-12 rounded-xl border-2 border-white/50 shadow-sm" style={{ backgroundColor: edit.primaryColor }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Secondary</p>
                        <div className="w-12 h-12 rounded-xl border-2 border-white/50 shadow-sm" style={{ backgroundColor: edit.secondaryColor }} />
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: ADMIN MANAGEMENT (SUPER ADMIN ONLY)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="admin-mgmt" className="mt-4 space-y-4">
          {/* Current City Admins */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCog className="size-4 text-[#4169E1]" />
              City Admins
              <Badge variant="secondary" className="ml-1">{cityAdmins.length}</Badge>
            </h3>
            {cityAdminsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#4169E1]" />
              </div>
            ) : cityAdmins.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No city admins assigned yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Managed City</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cityAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium text-sm">{admin.fullName}</TableCell>
                        <TableCell className="text-sm text-gray-500">{admin.phone}</TableCell>
                        <TableCell>
                          {admin.managedCity ? (
                            <Badge className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20">{admin.managedCity.name}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">No city</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline"
                            onClick={() => handleRevokeCityAdmin(admin.id)}
                            className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50">
                            <XCircle className="size-3 mr-0.5" />Revoke Admin
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>

          {/* Assign City Admin */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#D4AF37]" />
              Assign City Admin
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <Input placeholder="Search by name or phone..." value={assignAdminSearch}
                    onChange={(e) => setAssignAdminSearch(e.target.value)}
                    className="pl-8 bg-white/50 border-white/40" />
                </div>
                <Button size="sm" variant="outline" onClick={handleSearchUsers} className="h-9">
                  <Search className="size-3.5 mr-1" />Search
                </Button>
              </div>
              {searchedUsers.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {searchedUsers.map((u) => (
                    <button key={u.id}
                      onClick={() => { setAssignAdminUserId(u.id); setAssignAdminSearch(u.fullName) }}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        assignAdminUserId === u.id ? 'bg-[#4169E1]/10 border border-[#4169E1]/30' : 'bg-white/50 hover:bg-white/70 border border-transparent'
                      }`}>
                      <span className="font-medium">{u.fullName}</span>
                      <span className="text-gray-400 ml-2">{u.phone}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={assignAdminCityId} onValueChange={setAssignAdminCityId}>
                  <SelectTrigger className="bg-white/50 border-white/40">
                    <SelectValue placeholder="Select city to manage" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignCityAdmin} disabled={assigningAdmin || !assignAdminUserId || !assignAdminCityId}
                  className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white">
                  {assigningAdmin ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ShieldCheck className="size-4 mr-2" />}
                  Assign City Admin
                </Button>
              </div>
            </div>
          </GlassCard>
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: ADMIN REQUESTS (SUPER ADMIN ONLY)
        ═══════════════════════════════════════════════════════════════════════ */}
        {isSuperAdmin && (
        <TabsContent value="admin-requests" className="mt-4 space-y-4">
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Inbox className="size-4 text-[#4169E1]" />
                Admin Requests
                <Badge variant="secondary" className="ml-1">{adminRequests.length}</Badge>
              </h3>
              <div className="flex gap-1">
                {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                  <Button key={filter} size="sm" variant={adminRequestFilter === filter ? 'default' : 'outline'}
                    onClick={() => setAdminRequestFilter(filter)}
                    className={`h-7 text-xs capitalize ${adminRequestFilter === filter ? 'bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white' : ''}`}>
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {adminRequestsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#4169E1]" />
              </div>
            ) : adminRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No admin requests found.</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{req.user.fullName}</p>
                          <p className="text-xs text-gray-400">{req.user.phone}</p>
                        </TableCell>
                        <TableCell className="text-sm">{req.cityName}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">{req.reason || '—'}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          {req.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>}
                          {req.status === 'approved' && <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>}
                          {req.status === 'rejected' && <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === 'pending' ? (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline"
                                onClick={() => handleAdminRequestAction(req.id, 'approved')}
                                disabled={processingRequest === req.id}
                                className="h-7 text-xs border-green-300 text-green-600 hover:bg-green-50">
                                {processingRequest === req.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3 mr-0.5" />}
                                Approve
                              </Button>
                              <Button size="sm" variant="outline"
                                onClick={() => handleAdminRequestAction(req.id, 'rejected')}
                                disabled={processingRequest === req.id}
                                className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50">
                                <XCircle className="size-3 mr-0.5" />Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB: MUSIC LIBRARY
        ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="music" className="mt-4 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Music className="size-5 text-[#D4AF37]" />
                Music Library
              </h3>
              <Button
                onClick={() => {
                  setEditingMusic(null)
                  setMusicForm({ name: '', artist: 'Royalty Free', audioUrl: '', genre: 'Telugu', duration: 30, isActive: true })
                  setIsRoyaltyFreeConfirmed(false)
                  setShowMusicForm(true)
                }}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white"
              >
                <Plus className="size-4 mr-1" />Add Track
              </Button>
            </div>

            {musicLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
              </div>
            ) : musicTracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Disc3 className="size-12 mx-auto mb-2 opacity-30" />
                <p>No music tracks yet. Add your first royalty-free track!</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Genre</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {musicTracks.map((track) => (
                      <TableRow key={track.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">{track.name}</TableCell>
                        <TableCell className="text-gray-600">{track.artist}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</TableCell>
                        <TableCell>
                          <Badge className={track.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                            {track.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await fetch(`/api/music-library/${track.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isActive: !track.isActive }),
                                })
                                fetchMusicTracks()
                                toast.success(`Track ${track.isActive ? 'deactivated' : 'activated'}`)
                              }}
                              title={track.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <ToggleLeft className={`size-4 ${track.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingMusic(track)
                                setMusicForm({
                                  name: track.name,
                                  artist: track.artist,
                                  audioUrl: track.audioUrl,
                                  genre: track.genre,
                                  duration: track.duration,
                                  isActive: track.isActive,
                                })
                                setIsRoyaltyFreeConfirmed(true)
                                setShowMusicForm(true)
                              }}
                            >
                              <Edit3 className="size-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteMusicDialog(track.id)}
                            >
                              <Trash2 className="size-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>

          {/* Add/Edit Music Track Dialog */}
          <Dialog open={showMusicForm} onOpenChange={(open) => {
            if (!open) {
              setShowMusicForm(false)
              setEditingMusic(null)
              setIsRoyaltyFreeConfirmed(false)
            }
          }}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Disc3 className="size-5 text-[#D4AF37]" />
                  {editingMusic ? 'Edit Track' : 'Add Royalty-Free Track'}
                </DialogTitle>
                <DialogDescription>
                  {editingMusic
                    ? 'Update the track details below.'
                    : 'Add a royalty-free music track to the library. Only royalty-free and commercially safe audio is allowed.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="music-name">Track Name *</Label>
                  <Input
                    id="music-name"
                    placeholder="e.g. Peaceful Morning"
                    value={musicForm.name}
                    onChange={(e) => setMusicForm({ ...musicForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="music-artist">Artist</Label>
                  <Input
                    id="music-artist"
                    placeholder="Royalty Free"
                    value={musicForm.artist}
                    onChange={(e) => setMusicForm({ ...musicForm, artist: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="music-url">Audio URL *</Label>
                  <Input
                    id="music-url"
                    placeholder="https://example.com/audio/track.mp3"
                    value={musicForm.audioUrl}
                    onChange={(e) => setMusicForm({ ...musicForm, audioUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Direct URL to the audio file (MP3, OGG, etc.)</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="music-genre">Genre</Label>
                    <Select value={musicForm.genre} onValueChange={(val) => setMusicForm({ ...musicForm, genre: val })}>
                      <SelectTrigger id="music-genre">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Telugu">Telugu</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Instrumental">Instrumental</SelectItem>
                        <SelectItem value="Lo-Fi">Lo-Fi</SelectItem>
                        <SelectItem value="Ambient">Ambient</SelectItem>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="Folk">Folk</SelectItem>
                        <SelectItem value="Devotional">Devotional</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="music-duration">Duration (seconds)</Label>
                    <Input
                      id="music-duration"
                      type="number"
                      min={1}
                      placeholder="30"
                      value={musicForm.duration}
                      onChange={(e) => setMusicForm({ ...musicForm, duration: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <Label htmlFor="music-active" className="text-sm font-medium">Active</Label>
                  <Switch
                    id="music-active"
                    checked={musicForm.isActive}
                    onCheckedChange={(checked) => setMusicForm({ ...musicForm, isActive: checked })}
                  />
                </div>

                {/* COPYRIGHT CONFIRMATION - MANDATORY */}
                <div className={`rounded-lg border-2 p-4 ${isRoyaltyFreeConfirmed ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="royalty-free-confirm"
                      checked={isRoyaltyFreeConfirmed}
                      onChange={(e) => setIsRoyaltyFreeConfirmed(e.target.checked)}
                      className="mt-1 size-4 rounded border-gray-300 accent-[#D4AF37]"
                    />
                    <div>
                      <Label htmlFor="royalty-free-confirm" className="text-sm font-semibold cursor-pointer">
                        I confirm this audio is royalty-free and safe for commercial use.
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        You must verify that this audio track is properly licensed for commercial use.
                        YouTube links, Spotify links, or pirated content are strictly prohibited.
                        Only upload audio that you have the legal right to distribute.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowMusicForm(false)
                  setEditingMusic(null)
                  setIsRoyaltyFreeConfirmed(false)
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!musicForm.name.trim()) {
                      toast.error('Track name is required')
                      return
                    }
                    if (!musicForm.audioUrl.trim()) {
                      toast.error('Audio URL is required')
                      return
                    }
                    // Block YouTube/Spotify/pirated content URLs
                    const blockedPatterns = ['youtube.com', 'youtu.be', 'spotify.com', 'spotify.link']
                    const lowerUrl = musicForm.audioUrl.toLowerCase()
                    if (blockedPatterns.some((p) => lowerUrl.includes(p))) {
                      toast.error('YouTube, Spotify, or pirated content links are NOT allowed. Only direct audio file URLs are accepted.')
                      return
                    }
                    if (!isRoyaltyFreeConfirmed) {
                      toast.error('You must confirm this audio is royalty-free and safe for commercial use before submitting.')
                      return
                    }

                    setSavingMusic(true)
                    try {
                      if (editingMusic) {
                        const res = await fetch(`/api/music-library/${editingMusic.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(musicForm),
                        })
                        if (!res.ok) throw new Error('Failed to update track')
                        toast.success('Track updated successfully')
                      } else {
                        const res = await fetch('/api/music-library', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...musicForm,
                            isRoyaltyFreeConfirmed: true,
                          }),
                        })
                        if (!res.ok) {
                          const data = await res.json()
                          throw new Error(data.error || 'Failed to create track')
                        }
                        toast.success('Track added to music library')
                      }
                      setShowMusicForm(false)
                      setEditingMusic(null)
                      setIsRoyaltyFreeConfirmed(false)
                      fetchMusicTracks()
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Failed to save track')
                    } finally {
                      setSavingMusic(false)
                    }
                  }}
                  disabled={savingMusic}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white"
                >
                  {savingMusic && <Loader2 className="size-4 mr-1 animate-spin" />}
                  {editingMusic ? 'Update Track' : 'Add Track'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Music Track Confirmation Dialog */}
          <Dialog open={!!deleteMusicDialog} onOpenChange={(open) => { if (!open) setDeleteMusicDialog(null) }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="size-5" />
                  Delete Music Track
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this track? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteMusicDialog(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!deleteMusicDialog) return
                    try {
                      const res = await fetch(`/api/music-library/${deleteMusicDialog}`, { method: 'DELETE' })
                      if (!res.ok) throw new Error('Failed to delete track')
                      toast.success('Track deleted')
                      setDeleteMusicDialog(null)
                      fetchMusicTracks()
                    } catch {
                      toast.error('Failed to delete track')
                    }
                  }}
                >
                  Delete Track
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <MediaUploader
                value={settings?.logoUrl || ''}
                onChange={(url) => setSettings((s) => s ? { ...s, logoUrl: url } : s)}
                guideline="logo"
                folder="choutuppal/branding"
                label="App Logo"
              />
              <MediaUploader
                value={heroImageUrl}
                onChange={setHeroImageUrl}
                guideline="hero"
                folder="choutuppal/branding"
                label="Hero Background Image"
              />
            </div>
          </GlassCard>

          {/* Contact & WhatsApp Integration */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="size-4 text-[#25D366]" />
              Contact & WhatsApp Integration
            </h3>
            {settings ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Contact Person Name</Label>
                    <Input
                      value={settings.contactName || ''}
                      onChange={(e) => setSettings({ ...settings, contactName: e.target.value })}
                      placeholder="Citizen CSC"
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Contact Phone</Label>
                    <Input
                      value={settings.contactPhone || ''}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      placeholder="8790083706"
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Contact Address</Label>
                  <Textarea
                    value={settings.contactAddress || ''}
                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                    placeholder="Choutuppal, Yadadri, Telangana-508252"
                    rows={2}
                    className="bg-white/50 border-white/40 resize-none"
                  />
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">WhatsApp Support Number</Label>
                    <Input
                      value={settings.whatsappSupportNumber || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappSupportNumber: e.target.value })}
                      placeholder="918790083706"
                      className="bg-white/50 border-white/40"
                    />
                    <p className="text-xs text-gray-400">With country code, no + sign (e.g., 918790083706)</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">WhatsApp Community Invite Link</Label>
                    <Input
                      value={settings.whatsappCommunityLink || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappCommunityLink: e.target.value })}
                      placeholder="https://chat.whatsapp.com/..."
                      className="bg-white/50 border-white/40"
                    />
                    <p className="text-xs text-gray-400">Leave empty to hide Community button on Home</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">WhatsApp Channel Follow Link</Label>
                  <Input
                    value={settings.whatsappChannelLink || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappChannelLink: e.target.value })}
                    placeholder="https://whatsapp.com/channel/..."
                    className="bg-white/50 border-white/40"
                  />
                  <p className="text-xs text-gray-400">Leave empty to hide Channel button on Home</p>
                </div>
                
                <Separator className="my-2" />
                <h4 className="font-medium text-sm text-gray-700">Custom WhatsApp Texts</h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Hero Chat Text</Label>
                    <Input
                      value={settings.heroWhatsappText || ''}
                      onChange={(e) => setSettings({ ...settings, heroWhatsappText: e.target.value })}
                      placeholder="నమస్కారం..."
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Franchise Text</Label>
                    <Input
                      value={settings.franchiseWhatsappText || ''}
                      onChange={(e) => setSettings({ ...settings, franchiseWhatsappText: e.target.value })}
                      placeholder="నా నగరానికి ఫ్రాంచైజీ కోసం..."
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Agent Text</Label>
                    <Input
                      value={settings.agentWhatsappText || ''}
                      onChange={(e) => setSettings({ ...settings, agentWhatsappText: e.target.value })}
                      placeholder="ఏజెంట్ గా చేరాలనుకుంటున్నాను..."
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                </div>

                <Separator className="my-2" />
                <h4 className="font-medium text-sm text-gray-700">Social Media Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Instagram URL</Label>
                    <Input
                      value={settings.instagramUrl || ''}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Facebook URL</Label>
                    <Input
                      value={settings.facebookUrl || ''}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">YouTube URL</Label>
                    <Input
                      value={settings.youtubeUrl || ''}
                      onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="bg-white/50 border-white/40"
                    />
                  </div>
                </div>

                <motion.div whileTap={{ scale: 0.95 }} className="pt-2">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    {savingSettings ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                    Save Marketing & Contact
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-[#D4AF37]" />
              </div>
            )}
          </GlassCard>

          {/* Broadcast Notification */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Megaphone className="size-4 text-[#4169E1]" />
              Broadcast Notification
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Message to send all subscribers</Label>
                <Input
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. New feature launched! Check it out..."
                  className="bg-white/50 border-white/40"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MediaUploader
                  value={broadcastImageUrl}
                  onChange={setBroadcastImageUrl}
                  guideline="banner"
                  folder="choutuppal/broadcasts"
                  label="Rich Media Image"
                  acceptVideo
                />
                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1">
                    <Clock className="size-3" />Schedule Time (optional)
                  </Label>
                  <Input
                    type="datetime-local"
                    value={broadcastScheduledAt}
                    onChange={(e) => setBroadcastScheduledAt(e.target.value)}
                    className="bg-white/50 border-white/40"
                  />
                  <p className="text-xs text-gray-400">Leave empty to send instantly</p>
                </div>
              </div>
              <Button
                onClick={handleBroadcastUpgrade}
                disabled={broadcasting || !broadcastMsg.trim()}
                className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white"
              >
                {broadcasting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" />}
                {broadcastScheduledAt ? 'Schedule Broadcast' : 'Send to All'}
              </Button>
              {broadcastResult && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-green-600 flex items-center gap-1"
                >
                  <CheckCircle className="size-3.5" /> {broadcastResult}
                </motion.p>
              )}
            </div>
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

          {/* SEO & Meta Manager */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="size-4 text-[#4169E1]" />
              SEO & Meta Manager
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Global Meta Title</Label>
                <Input
                  value={seoForm.metaTitle}
                  onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                  placeholder="Choutuppal 2.0 - Your Hyper-Local Super App"
                  className="bg-white/50 border-white/40"
                />
                <p className="text-xs text-gray-400">Appears in browser tab and Google search results</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Global Meta Description</Label>
                <Textarea
                  value={seoForm.metaDescription}
                  onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                  placeholder="Discover businesses, services, real estate, and local news in Choutuppal."
                  className="bg-white/50 border-white/40"
                  rows={2}
                />
                <p className="text-xs text-gray-400">Shown below your title in search results (max 160 chars)</p>
              </div>
              <MediaUploader
                value={seoForm.ogImageUrl}
                onChange={(url) => setSeoForm({ ...seoForm, ogImageUrl: url })}
                guideline="og"
                folder="choutuppal/seo"
                label="OG Preview Image (WhatsApp/Facebook sharing)"
              />
              <Button
                onClick={handleSaveSEO}
                className="bg-gradient-to-r from-[#4169E1] to-[#3457B2] text-white"
              >
                <Save className="size-4 mr-2" />Save SEO Settings
              </Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
