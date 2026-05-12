'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Building2, Shield, Inbox, Gamepad2, Settings,
  Users, Store, TrendingUp, Phone, CheckCircle, XCircle,
  Star, Crown, Eye, Plus, Save, Loader2,
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
import { GlassCard } from '@/components/glass-card'
import { useAppStore } from '@/lib/store'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Stats {
  totalUsers: number
  totalListings: number
  totalLeads: number
  approvedListings: number
  featuredListings: number
  premiumListings: number
  totalReviews: number
  averageRating: number
  cities: Array<{
    id: string
    name: string
    slug: string
    _count: { listings: number; users: number; news: number; stories: number }
  }>
  leadsByStatus: Array<{ status: string; count: number }>
  listingsByCategory: Array<{ category: string; count: number }>
  usersByRole: Array<{ role: string; count: number }>
}

interface AdminListing {
  id: string
  slug: string
  name: string
  category: string
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  createdAt: string
  user: { id: string; fullName: string; phone: string; email?: string }
  city: { id: string; name: string; slug: string }
  _count: { reviews: number; leads: number }
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

export function AdminView() {
  const { adminTab, setAdminTab, addNotification } = useAppStore()

  const [stats, setStats] = useState<Stats | null>(null)
  const [adminListings, setAdminListings] = useState<AdminListing[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [cities, setCities] = useState<CityData[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [spinPrizes, setSpinPrizes] = useState<SpinPrize[]>([])
  const [loading, setLoading] = useState(true)
  const [listingFilter, setListingFilter] = useState('pending')
  const [savingSettings, setSavingSettings] = useState(false)

  // New city form
  const [newCityName, setNewCityName] = useState('')
  const [newCitySlug, setNewCitySlug] = useState('')
  const [newCityState, setNewCityState] = useState('Telangana')
  const [addingCity, setAddingCity] = useState(false)

  // Fetch stats
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [])

  // Fetch admin listings
  const fetchAdminListings = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('status', listingFilter)
    params.set('limit', '50')
    fetch(`/api/admin/listings?${params}`)
      .then((res) => res.json())
      .then((data) => setAdminListings(data.listings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [listingFilter])

  useEffect(() => {
    fetchAdminListings()
  }, [fetchAdminListings])

  // Fetch leads
  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Fetch cities
  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Fetch settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  // Fetch spin prizes
  useEffect(() => {
    // Reuse the stats endpoint for spin prizes - they're part of the seed data
    // Since there's no direct API for spin prizes, we'll create a placeholder
    setSpinPrizes([
      { id: '1', label: '50 Coins', prizeType: 'coins', prizeValue: 50, probability: 0.15, color: '#D4AF37', isActive: true },
      { id: '2', label: '20 Coins', prizeType: 'coins', prizeValue: 20, probability: 0.25, color: '#4169E1', isActive: true },
      { id: '3', label: '10 Coins', prizeType: 'coins', prizeValue: 10, probability: 0.25, color: '#50C878', isActive: true },
      { id: '4', label: '5 Coins', prizeType: 'coins', prizeValue: 5, probability: 0.15, color: '#FF6B6B', isActive: true },
      { id: '5', label: 'Free Listing', prizeType: 'free_listing', prizeValue: 0, probability: 0.05, color: '#9B59B6', isActive: true },
      { id: '6', label: 'Discount', prizeType: 'discount', prizeValue: 25, probability: 0.05, color: '#E67E22', isActive: true },
      { id: '7', label: 'Try Again', prizeType: 'none', prizeValue: 0, probability: 0.07, color: '#95A5A6', isActive: true },
      { id: '8', label: '100 Coins', prizeType: 'coins', prizeValue: 100, probability: 0.03, color: '#FFD700', isActive: true },
    ])
  }, [])

  const handleListingAction = async (listingId: string, action: string) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, action }),
      })
      if (res.ok) {
        addNotification(`Listing ${action} successful`)
        fetchAdminListings()
      }
    } catch {
      addNotification('Action failed')
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
        }),
      })
      if (res.ok) {
        addNotification(`City "${newCityName}" added!`)
        setNewCityName('')
        setNewCitySlug('')
        // Refresh cities
        const citiesRes = await fetch('/api/cities')
        const citiesData = await citiesRes.json()
        setCities(Array.isArray(citiesData) ? citiesData : cities)
      } else {
        addNotification('Failed to add city')
      }
    } catch {
      addNotification('Failed to add city')
    } finally {
      setAddingCity(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        addNotification('Settings saved!')
      }
    } catch {
      addNotification('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
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

  // Chart data
  const categoryChartData = stats?.listingsByCategory.map((c) => ({
    name: c.category,
    count: c.count,
  })) || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Admin header */}
      <GlassCard variant="gold">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center">
            <Shield className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Manage your super app</p>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white/40 backdrop-blur-xl border border-white/30 p-1 rounded-xl">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <BarChart3 className="size-3.5 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="cities" className="text-xs sm:text-sm">
            <Building2 className="size-3.5 mr-1" />
            Cities
          </TabsTrigger>
          <TabsTrigger value="moderation" className="text-xs sm:text-sm">
            <Shield className="size-3.5 mr-1" />
            Moderate
          </TabsTrigger>
          <TabsTrigger value="leads" className="text-xs sm:text-sm">
            <Inbox className="size-3.5 mr-1" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="gamification" className="text-xs sm:text-sm">
            <Gamepad2 className="size-3.5 mr-1" />
            Games
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Settings className="size-3.5 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#4169E1' },
              { label: 'Total Listings', value: stats?.totalListings || 0, icon: Store, color: '#D4AF37' },
              { label: 'Total Leads', value: stats?.totalLeads || 0, icon: TrendingUp, color: '#50C878' },
              { label: 'Avg Rating', value: stats?.averageRating || 0, icon: Star, color: '#FF6B6B' },
            ].map((stat) => (
              <GlassCard key={stat.label} className="text-center !p-4">
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="size-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Chart */}
          {categoryChartData.length > 0 && (
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="size-4 text-[#4169E1]" />
                Listings by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Additional stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3">Leads by Status</h3>
              <div className="space-y-2">
                {stats?.leadsByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                    <span className="text-sm capitalize text-gray-700">{item.status}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3">Users by Role</h3>
              <div className="space-y-2">
                {stats?.usersByRole.map((item) => (
                  <div key={item.role} className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                    <span className="text-sm capitalize text-gray-700">{item.role}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* City Manager Tab */}
        <TabsContent value="cities" className="mt-4 space-y-4">
          {/* Add city form */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="size-4 text-[#D4AF37]" />
              Add New City
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">City Name</Label>
                <Input
                  placeholder="e.g. Nalgonda"
                  value={newCityName}
                  onChange={(e) => {
                    setNewCityName(e.target.value)
                    setNewCitySlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
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
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="mt-3">
              <Button
                onClick={handleAddCity}
                disabled={addingCity || !newCityName || !newCitySlug}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
              >
                {addingCity ? 'Adding...' : 'Add City'}
              </Button>
            </motion.div>
          </GlassCard>

          {/* Cities list */}
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-3">All Cities</h3>
            {cities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No cities</p>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">{city.name}</TableCell>
                        <TableCell className="text-gray-500">{city.slug}</TableCell>
                        <TableCell className="text-gray-500">{city.state}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{city._count.listings}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{city._count.users}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Listing Moderation Tab */}
        <TabsContent value="moderation" className="mt-4 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="size-4 text-[#4169E1]" />
                Listing Moderation
              </h3>
              <Select value={listingFilter} onValueChange={setListingFilter}>
                <SelectTrigger className="w-[140px] bg-white/50 border-white/40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {adminListings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No {listingFilter} listings
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{listing.name}</p>
                            <p className="text-xs text-gray-400">{listing.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {listing.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{listing.user.fullName}</TableCell>
                        <TableCell className="text-sm">{listing.city.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{listing.viewsCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {!listing.isApproved && (
                              <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleListingAction(listing.id, 'approve')}
                                  className="h-7 text-xs border-green-300 text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="size-3 mr-0.5" />
                                  Approve
                                </Button>
                              </motion.div>
                            )}
                            {listing.isApproved && (
                              <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleListingAction(listing.id, 'reject')}
                                  className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="size-3 mr-0.5" />
                                  Reject
                                </Button>
                              </motion.div>
                            )}
                            {!listing.isFeatured && (
                              <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleListingAction(listing.id, 'feature')}
                                  className="h-7 text-xs border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5"
                                >
                                  <Star className="size-3 mr-0.5" />
                                  Feature
                                </Button>
                              </motion.div>
                            )}
                            {!listing.isPremium && (
                              <motion.div whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleListingAction(listing.id, 'makePremium')}
                                  className="h-7 text-xs border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/5"
                                >
                                  <Crown className="size-3 mr-0.5" />
                                  Premium
                                </Button>
                              </motion.div>
                            )}
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

        {/* Lead CRM Tab */}
        <TabsContent value="leads" className="mt-4">
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Inbox className="size-5 text-[#4169E1]" />
              Lead CRM
              <Badge variant="secondary" className="ml-1">{leads.length}</Badge>
            </h3>
            {leads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No leads</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium text-sm">
                          {lead.customerName || 'Anonymous'}
                        </TableCell>
                        <TableCell className="text-sm text-[#4169E1]">
                          {lead.customerPhone}
                        </TableCell>
                        <TableCell className="text-sm">{lead.listing.name}</TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-[150px] truncate">
                          {lead.requirementText || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {lead.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Gamification Tab */}
        <TabsContent value="gamification" className="mt-4 space-y-4">
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Gamepad2 className="size-5 text-[#D4AF37]" />
              Spin Wheel Prizes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spinPrizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-white/30"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: prize.color }}
                  >
                    {prize.prizeValue > 0 ? prize.prizeValue : '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800">{prize.label}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="capitalize">{prize.prizeType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{(prize.probability * 100).toFixed(0)}% chance</span>
                    </div>
                  </div>
                  <Badge
                    className={prize.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                  >
                    {prize.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <GlassCard>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="size-5 text-[#4169E1]" />
              Site Settings
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
                    <Label className="text-sm">Logo URL</Label>
                    <Input
                      value={settings.logoUrl || ''}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
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
                    {savingSettings ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="size-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                      />
                    ) : (
                      <Save className="size-4 mr-2" />
                    )}
                    Save Settings
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="size-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full"
                />
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
