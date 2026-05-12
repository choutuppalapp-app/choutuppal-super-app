'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, Coins, Globe, Inbox, Store, Eye, Phone,
  Clock, CheckCircle, AlertCircle, Gift, TrendingUp,
  QrCode, ArrowUpRight, Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { GlassCard } from '@/components/glass-card'
import { useAppStore } from '@/lib/store'

interface UserListing {
  id: string
  slug: string
  name: string
  category: string
  isApproved: boolean
  isPremium: boolean
  isFeatured: boolean
  viewsCount: number
  createdAt: string
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

export function DashboardView() {
  const {
    currentUser,
    dashboardTab,
    setDashboardTab,
    addNotification,
    setShowLeadForm,
    setLeadFormListingId,
    setSelectedListing,
    navigateTo,
  } = useAppStore()

  const [listings, setListings] = useState<UserListing[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [coinBalance, setCoinBalance] = useState(0)
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([])
  const [loadingCoins, setLoadingCoins] = useState(false)
  const [claimingDaily, setClaimingDaily] = useState(false)

  // Fetch user listings
  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/listings?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        const userLists = (data.listings || []).filter(
          (l: UserListing & { user: { id: string } }) => l.user?.id === currentUser.id
        )
        setListings(userLists)
      })
      .catch(() => {})
  }, [currentUser])

  // Fetch leads for user
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
    setLoadingCoins(true)
    fetch(`/api/coins?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCoinBalance(data.balance ?? 0)
        setCoinTransactions(data.transactions ?? [])
      })
      .catch(() => {})
      .finally(() => setLoadingCoins(false))
  }, [currentUser])

  useEffect(() => {
    fetchCoins()
  }, [fetchCoins])

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

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* User header */}
      <GlassCard variant="gold">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#4169E1] flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {currentUser?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{currentUser?.fullName || 'Guest'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 text-xs">
                {currentUser?.subscriptionTier || 'free'} plan
              </Badge>
              <div className="flex items-center gap-1 text-sm text-[#D4AF37] font-medium">
                <Coins className="size-4" />
                {coinBalance} coins
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-white/40 backdrop-blur-xl border border-white/30 p-1 rounded-xl">
          <TabsTrigger value="overview" className="flex-1 min-w-0 text-xs sm:text-sm">
            <Crown className="size-3.5 mr-1 hidden sm:inline" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="coins" className="flex-1 min-w-0 text-xs sm:text-sm">
            <Coins className="size-3.5 mr-1 hidden sm:inline" />
            Coins
          </TabsTrigger>
          <TabsTrigger value="mini-website" className="flex-1 min-w-0 text-xs sm:text-sm">
            <Globe className="size-3.5 mr-1 hidden sm:inline" />
            Website
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex-1 min-w-0 text-xs sm:text-sm">
            <Inbox className="size-3.5 mr-1 hidden sm:inline" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex-1 min-w-0 text-xs sm:text-sm">
            <Store className="size-3.5 mr-1 hidden sm:inline" />
            Listings
          </TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-4">
            <GlassCard>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Crown className="size-5 text-[#D4AF37]" />
                My Subscription
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['free', 'pro', 'premium'].map((plan) => {
                  const isCurrent = currentUser?.subscriptionTier === plan
                  const prices: Record<string, string> = { free: '₹0', pro: '₹499/mo', premium: '₹999/mo' }
                  const features: Record<string, string[]> = {
                    free: ['1 Listing', 'Basic Analytics', '5 Coins/Day'],
                    pro: ['5 Listings', 'Advanced Analytics', 'Priority Support', '20 Coins/Day'],
                    premium: ['Unlimited Listings', 'Full Analytics', 'Dedicated Manager', '50 Coins/Day', 'Featured Badge'],
                  }

                  return (
                    <GlassCard
                      key={plan}
                      variant={isCurrent ? 'gold' : 'default'}
                      className={`text-center ${isCurrent ? 'ring-2 ring-[#D4AF37]/50' : ''}`}
                    >
                      <h3 className="font-bold text-gray-800 capitalize text-lg">{plan}</h3>
                      <p className="text-2xl font-bold text-[#D4AF37] my-2">{prices[plan]}</p>
                      <ul className="space-y-1 text-sm text-gray-600 mb-4">
                        {features[plan].map((f, i) => (
                          <li key={i} className="flex items-center justify-center gap-1">
                            <CheckCircle className="size-3 text-green-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <Badge className="bg-[#D4AF37] text-white border-none">Current Plan</Badge>
                      ) : (
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                          >
                            Upgrade
                          </Button>
                        </motion.div>
                      )}
                    </GlassCard>
                  )
                })}
              </div>
            </GlassCard>
          </div>
        </TabsContent>

        {/* Coins Tab */}
        <TabsContent value="coins" className="mt-4">
          <div className="space-y-4">
            {/* Balance card */}
            <GlassCard variant="gold">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Your Balance</p>
                  <div className="flex items-center gap-2">
                    <Coins className="size-8 text-[#D4AF37]" />
                    <span className="text-4xl font-bold text-gray-900">{coinBalance}</span>
                  </div>
                </div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleDailyClaim}
                    disabled={claimingDaily}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
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

            {/* Transaction history */}
            <GlassCard>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-[#4169E1]" />
                Transaction History
              </h3>
              {coinTransactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No transactions yet</p>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {coinTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.amount >= 0
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          <ArrowUpRight
                            className={`size-4 ${
                              tx.amount < 0 ? 'rotate-90' : ''
                            }`}
                          />
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
                      <span
                        className={`font-bold text-sm ${
                          tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.amount >= 0 ? '+' : ''}
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        {/* Mini Website Tab */}
        <TabsContent value="mini-website" className="mt-4">
          <div className="space-y-4">
            {listings.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Globe className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No mini-website yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create a listing to get your mini-website
                </p>
              </GlassCard>
            ) : (
              listings.map((listing) => (
                <GlassCard key={listing.id} variant={listing.isPremium ? 'gold' : 'default'}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{listing.name}</h3>
                      <Badge
                        variant="secondary"
                        className="bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20 mt-1"
                      >
                        {listing.category}
                      </Badge>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="size-4 text-[#4169E1]" />
                          {listing.viewsCount} views
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="size-4 text-[#4169E1]" />
                          <span className="text-[#4169E1] text-xs break-all">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/listing/{listing.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedListing(listing.slug)
                              navigateTo('listing')
                            }}
                            className="border-[#4169E1]/30 text-[#4169E1]"
                          >
                            <Eye className="size-3.5 mr-1" />
                            View
                          </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/listing/${listing.slug}`
                              )
                              addNotification('Link copied!')
                            }}
                            className="border-[#D4AF37]/30 text-[#D4AF37]"
                          >
                            <QrCode className="size-3.5 mr-1" />
                            Copy Link
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="text-center p-3 rounded-xl bg-white/50 border border-white/30">
                      <p className="text-2xl font-bold text-[#D4AF37]">{listing.viewsCount}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="mt-4">
          <GlassCard>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Inbox className="size-5 text-[#4169E1]" />
              Lead Inbox
            </h2>
            {leads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No leads yet</p>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Requirement</TableHead>
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
                        <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                          {lead.requirementText || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
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

        {/* My Listings Tab */}
        <TabsContent value="listings" className="mt-4">
          <div className="space-y-3">
            {listings.length === 0 ? (
              <GlassCard className="text-center py-12">
                <Store className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No listings yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first listing</p>
              </GlassCard>
            ) : (
              listings.map((listing) => (
                <GlassCard key={listing.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {listing.name}
                        </h3>
                        {listing.isApproved ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            <CheckCircle className="size-3 mr-0.5" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                            <AlertCircle className="size-3 mr-0.5" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{listing.category}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {listing.viewsCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedListing(listing.slug)
                            navigateTo('listing')
                          }}
                          className="border-[#4169E1]/30 text-[#4169E1] text-xs"
                        >
                          View
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
