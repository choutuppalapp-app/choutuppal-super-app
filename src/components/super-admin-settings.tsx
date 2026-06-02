'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Globe,
  Network,
  Plus,
  Save,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowRightLeft,
  Shield,
  MapPin,
  Settings,
  CreditCard,
  Ticket,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { GlassCard } from '@/components/glass-card'
import { useDomainRouting, type SubdomainMapping } from '@/hooks/use-domain-routing'
import { CityVisibilityManager } from '@/components/admin/city-visibility-manager'
import { usePaymentConfig } from '@/hooks/use-payment-config'
import { toast } from 'sonner'

// ─── Helper: generate subdomain prefix from city name ──────────────────────────
function generatePrefix(cityName: string): string {
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Animation Variants ────────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
}

const rowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
}

// ─── Tab type ────────────────────────────────────────────────────────────────────
type AdminTab = 'domain' | 'cities' | 'app-config'

// ─── App Config Tab Component ────────────────────────────────────────────────

function AppConfigTab({
  paymentConfig,
  paymentConfigLoaded,
  isFreeLaunch,
  togglePaymentGateway,
  effectiveFreeMessage,
  setFreeMessageDraft,
  setFreeMessageDirty,
  updateFreeListingMessage,
}: {
  paymentConfig: { paymentGatewayEnabled: boolean; freeListingMessage: string; freeLaunchCouponCode: string }
  paymentConfigLoaded: boolean
  isFreeLaunch: boolean
  togglePaymentGateway: (enabled: boolean) => void
  effectiveFreeMessage: string
  setFreeMessageDraft: (v: string) => void
  setFreeMessageDirty: (v: boolean) => void
  updateFreeListingMessage: (msg: string) => void
}) {
  if (!paymentConfigLoaded) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  const handleSaveMessage = () => {
    updateFreeListingMessage(effectiveFreeMessage.trim())
    setFreeMessageDirty(false)
    toast.success('Free listing message saved!')
  }

  return (
    <div className="space-y-5">
      {/* ── Payment Gateway Status Banner ── */}
      <div
        className={`rounded-xl p-4 flex items-center gap-3 transition-colors duration-300 border ${
          isFreeLaunch
            ? 'bg-green-50/80 border-green-200'
            : 'bg-blue-50/80 border-blue-200'
        }`}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
            isFreeLaunch ? 'bg-green-100' : 'bg-blue-100'
          }`}
        >
          <CreditCard
            className={`w-5 h-5 ${isFreeLaunch ? 'text-green-600' : 'text-blue-600'}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              isFreeLaunch ? 'text-green-800' : 'text-blue-800'
            }`}
          >
            {isFreeLaunch ? '🚀 Free Launch Mode Active' : '💳 Payment Gateway Active'}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isFreeLaunch ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            {isFreeLaunch
              ? 'All premium listings are FREE. No payment required from users.'
              : 'Razorpay checkout is active. Users will be charged for premium listings.'}
          </p>
        </div>
        <Badge
          className={`shrink-0 ${
            isFreeLaunch
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-blue-100 text-blue-800 border-blue-200'
          }`}
        >
          {isFreeLaunch ? 'FREE' : 'PAID'}
        </Badge>
      </div>

      {/* ── Payment Gateway Toggle Card ── */}
      <GlassCard variant="default">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4169E1]/10">
              <CreditCard className="w-5 h-5 text-[#4169E1]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Payment Gateway</h2>
              <p className="text-sm text-muted-foreground">Enable or disable Razorpay checkout</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#4169E1]" />
                  Enable Payment Gateway
                </Label>
                <p className="text-xs text-muted-foreground">
                  When OFF, all premium listings are free. When ON, Razorpay checkout is used.
                </p>
              </div>
              <Switch
                checked={paymentConfig.paymentGatewayEnabled}
                onCheckedChange={(checked) => {
                  togglePaymentGateway(checked)
                  toast.success(checked ? 'Payment gateway enabled' : 'Free launch mode activated', {
                    description: checked
                      ? 'Users will be charged via Razorpay'
                      : 'All premium listings are now FREE',
                  })
                }}
                className="data-[state=checked]:bg-[#4169E1] data-[state=unchecked]:bg-gray-300"
              />
            </div>

            {/* Status indicator */}
            <div
              className={`rounded-lg p-3 transition-colors duration-300 ${
                isFreeLaunch
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-blue-50 border border-blue-100'
              }`}
            >
              <p
                className={`text-sm ${
                  isFreeLaunch ? 'text-green-700' : 'text-blue-700'
                }`}
              >
                {isFreeLaunch ? (
                  <>
                    <strong>Current:</strong> Free Launch Mode — Users can post premium listings without
                    payment. Coupon <code className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-xs font-mono">{paymentConfig.freeLaunchCouponCode}</code> is auto-applied.
                  </>
                ) : (
                  <>
                    <strong>Current:</strong> Payment Mode — Razorpay checkout will open for paid plans.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── Free Listing Message Card ── */}
      <GlassCard variant="default">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#D4AF37]/10">
              <Settings className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Free Listing Message</h2>
              <p className="text-sm text-muted-foreground">
                Banner shown on pricing page when gateway is OFF
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="free-message" className="text-sm font-medium">
              Banner Message
            </Label>
            <div className="flex gap-3">
              <Input
                id="free-message"
                placeholder="🎉 Early Bird Offer: Post Premium Listings for FREE!"
                value={effectiveFreeMessage}
                onChange={(e) => {
                  setFreeMessageDraft(e.target.value)
                  setFreeMessageDirty(true)
                }}
                className="flex-1 h-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveMessage()
                }}
              />
              <Button
                onClick={handleSaveMessage}
                disabled={!effectiveFreeMessage.trim()}
                className="h-10 px-5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#C9A533] hover:to-[#A88518] text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                <span className="ml-1.5 hidden sm:inline">Save</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This message appears as a promotional banner on the Pricing page
            </p>
          </div>

          {/* Preview */}
          {effectiveFreeMessage && (
            <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
              <p className="text-xs font-medium text-green-600 mb-1.5">Preview:</p>
              <div className="rounded-lg bg-white border border-green-200 p-3 shadow-sm">
                <p className="text-sm font-semibold text-green-800">{effectiveFreeMessage}</p>
                <p className="text-xs text-green-600 mt-1">No Credit Card Required ✨</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Launch Coupon Info Card ── */}
      <GlassCard variant="default">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
              <Ticket className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Launch Coupon</h2>
              <p className="text-sm text-muted-foreground">
                Auto-applied 100% discount coupon during free launch
              </p>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Coupon Code:</span>
              <code className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-sm font-mono font-bold tracking-wider">
                {paymentConfig.freeLaunchCouponCode}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Discount:</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">100% OFF</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Status:</span>
              <Badge className={isFreeLaunch ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                {isFreeLaunch ? 'Auto-Applied' : 'Inactive (Gateway ON)'}
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            When the Payment Gateway is OFF, this coupon is automatically applied on the checkout
            page, making all paid plans free. Create this coupon in the Coupon Manager to activate.
          </p>
        </div>
      </GlassCard>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState<AdminTab>('domain')

  // Payment config
  const {
    config: paymentConfig,
    isLoaded: paymentConfigLoaded,
    togglePaymentGateway,
    updateFreeListingMessage,
    isFreeLaunch,
  } = usePaymentConfig()
  const [freeMessageDraft, setFreeMessageDraft] = useState('')
  const [freeMessageDirty, setFreeMessageDirty] = useState(false)

  const effectiveFreeMessage = freeMessageDirty ? freeMessageDraft : paymentConfig.freeListingMessage

  const {
    baseDomain,
    isCustomDomainActive,
    subdomainMappings,
    isLoaded,
    saveBaseDomain,
    toggleCustomDomain,
    addMapping,
    updateMapping,
    deleteMapping,
    getCityUrl,
  } = useDomainRouting()

  // ─── Base Domain State ───────────────────────────────────────────────────
  // Use derived value: show baseDomain when user hasn't modified (dirty), else show their input
  const [domainInput, setDomainInput] = useState('')
  const [domainDirty, setDomainDirty] = useState(false)
  const [savingDomain, setSavingDomain] = useState(false)

  // The effective display value: synced with baseDomain when not dirty
  const effectiveDomain = domainDirty ? domainInput : baseDomain

  // ─── Subdomain Mapping Form ──────────────────────────────────────────────
  const [newCityName, setNewCityName] = useState('')
  const [manualPrefix, setManualPrefix] = useState<string | null>(null)

  // Computed prefix: auto-generate from city name unless user manually edited
  const newPrefix = manualPrefix !== null ? manualPrefix : generatePrefix(newCityName)

  const handlePrefixManualEdit = (value: string) => {
    setManualPrefix(value)
  }

  const handleCityNameChange = (value: string) => {
    setNewCityName(value)
    // Reset to auto-generation mode when city name changes
    setManualPrefix(null)
  }

  // ─── Edit Dialog State ───────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<SubdomainMapping | null>(null)
  const [editCityName, setEditCityName] = useState('')
  const [editPrefix, setEditPrefix] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // ─── Delete Confirmation Dialog State ────────────────────────────────────
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleDomainChange = (value: string) => {
    setDomainInput(value)
    setDomainDirty(true)
  }

  const handleSaveDomain = async () => {
    const trimmed = effectiveDomain.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    if (!trimmed) {
      toast.error('Domain cannot be empty')
      return
    }
    setSavingDomain(true)
    // Simulate a brief async operation for UX
    await new Promise((r) => setTimeout(r, 400))
    saveBaseDomain(trimmed)
    setSavingDomain(false)
    setDomainDirty(false) // Reset dirty flag so input syncs with new baseDomain
    toast.success('Domain settings saved', {
      description: `Base domain set to ${trimmed}`,
    })
  }

  const handleToggleDomain = (checked: boolean) => {
    toggleCustomDomain(checked)
    if (checked) {
      toast.success('Subdomain routing activated', {
        description: `Cities will be accessible at [prefix].${baseDomain}`,
      })
    } else {
      toast.info('Switched to path-based routing', {
        description: 'Cities will be accessible at /city/[slug]',
      })
    }
  }

  const handleAddMapping = () => {
    const trimmedCity = newCityName.trim()
    const trimmedPrefix = newPrefix.trim().toLowerCase()

    if (!trimmedCity) {
      toast.error('City name is required')
      return
    }
    if (!trimmedPrefix) {
      toast.error('Subdomain prefix is required')
      return
    }
    if (!/^[a-z0-9-]+$/.test(trimmedPrefix)) {
      toast.error('Prefix can only contain lowercase letters, numbers, and hyphens')
      return
    }
    // Check for duplicate prefix
    if (subdomainMappings.some((m) => m.subdomainPrefix === trimmedPrefix)) {
      toast.error('This subdomain prefix already exists')
      return
    }

    addMapping(trimmedCity, trimmedPrefix)
    setNewCityName('')
    setManualPrefix(null)
    toast.success('Mapping added', {
      description: `${trimmedCity} → ${trimmedPrefix}.${baseDomain}`,
    })
  }

  const openEditDialog = (mapping: SubdomainMapping) => {
    setEditingMapping(mapping)
    setEditCityName(mapping.cityName)
    setEditPrefix(mapping.subdomainPrefix)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingMapping) return
    const trimmedCity = editCityName.trim()
    const trimmedPrefix = editPrefix.trim().toLowerCase()

    if (!trimmedCity) {
      toast.error('City name is required')
      return
    }
    if (!trimmedPrefix) {
      toast.error('Subdomain prefix is required')
      return
    }
    if (!/^[a-z0-9-]+$/.test(trimmedPrefix)) {
      toast.error('Prefix can only contain lowercase letters, numbers, and hyphens')
      return
    }
    // Check for duplicate prefix (excluding current mapping)
    if (
      subdomainMappings.some(
        (m) => m.subdomainPrefix === trimmedPrefix && m.id !== editingMapping.id
      )
    ) {
      toast.error('This subdomain prefix already exists')
      return
    }

    setSavingEdit(true)
    await new Promise((r) => setTimeout(r, 300))
    updateMapping(editingMapping.id, trimmedCity, trimmedPrefix)
    setSavingEdit(false)
    setEditDialogOpen(false)
    toast.success('Mapping updated', {
      description: `${trimmedCity} → ${trimmedPrefix}.${baseDomain}`,
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialogId) return
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 300))
    deleteMapping(deleteDialogId)
    setDeleting(false)
    setDeleteDialogId(null)
    toast.success('Mapping deleted')
  }

  // ─── Loading Skeleton ────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* ─── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('domain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
            activeTab === 'domain'
              ? 'bg-white text-[#4169E1] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          Domain Settings
        </button>
        <button
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
            activeTab === 'cities'
              ? 'bg-white text-[#4169E1] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Manage Cities
        </button>
        <button
          onClick={() => setActiveTab('app-config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
            activeTab === 'app-config'
              ? 'bg-white text-[#4169E1] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          App Config
        </button>
      </div>

      {/* ─── Tab Content ─────────────────────────────────────────────────── */}
      {activeTab === 'app-config' ? (
        <AppConfigTab
          paymentConfig={paymentConfig}
          paymentConfigLoaded={paymentConfigLoaded}
          isFreeLaunch={isFreeLaunch}
          togglePaymentGateway={togglePaymentGateway}
          effectiveFreeMessage={effectiveFreeMessage}
          setFreeMessageDraft={setFreeMessageDraft}
          setFreeMessageDirty={setFreeMessageDirty}
          updateFreeListingMessage={updateFreeListingMessage}
        />
      ) : activeTab === 'cities' ? (
        <CityVisibilityManager />
      ) : (
      <>
      {/* ─── Section 1: DNS Setup Guide Alert ─────────────────────────────── */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Alert
          className="border-l-4 border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">
            DNS Configuration Required
          </AlertTitle>
          <AlertDescription className="text-amber-700/80 dark:text-amber-400/80 text-sm leading-relaxed">
            To make subdomains work, ensure you have added a{' '}
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Wildcard DNS &quot;A&quot; Record (*)
            </span>{' '}
            pointing to your server IP in your domain provider&apos;s DNS settings, and a{' '}
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Wildcard SSL certificate
            </span>{' '}
            is installed.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* ─── Section 2: Base Domain Configuration ─────────────────────────── */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <GlassCard variant="default">
          <div className="space-y-5">
            {/* Card Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4169E1]/10">
                <Globe className="w-5 h-5 text-[#4169E1]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Base Domain Configuration</h2>
                <p className="text-sm text-muted-foreground">Set your primary domain and routing mode</p>
              </div>
            </div>

            <Separator />

            {/* Primary Domain Input */}
            <div className="space-y-2">
              <Label htmlFor="primary-domain" className="text-sm font-medium">
                Primary Domain
              </Label>
              <div className="flex gap-3">
                <Input
                  id="primary-domain"
                  placeholder="e.g., mana.in"
                  value={effectiveDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  className="flex-1 h-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveDomain()
                  }}
                />
                <Button
                  onClick={handleSaveDomain}
                  disabled={savingDomain}
                  className="h-10 px-5 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#C9A533] hover:to-[#A88518] text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {savingDomain ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">Save</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your root domain without www or protocols (e.g., mana.in)
              </p>
            </div>

            <Separator />

            {/* Custom Domain Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-[#4169E1]" />
                    Activate Custom Domain Routing
                  </Label>
                </div>
                <Switch
                  checked={isCustomDomainActive}
                  onCheckedChange={handleToggleDomain}
                  className="data-[state=checked]:bg-[#22c55e] data-[state=unchecked]:bg-gray-300"
                />
              </div>

              {/* Description that changes color based on toggle */}
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                className="rounded-lg p-3 transition-colors duration-300"
                style={{
                  backgroundColor: isCustomDomainActive
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(156, 163, 175, 0.08)',
                }}
              >
                <p
                  className={`text-sm transition-colors duration-300 ${
                    isCustomDomainActive
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isCustomDomainActive ? (
                    <>
                      <strong>ON:</strong> Subdomain routing — Cities accessible at{' '}
                      <code className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-mono">
                        [prefix].{baseDomain}
                      </code>
                    </>
                  ) : (
                    <>
                      <strong>OFF:</strong> Path-based routing — Cities accessible at{' '}
                      <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-mono">
                        /city/[slug]
                      </code>
                    </>
                  )}
                </p>
              </motion.div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Section 3: Subdomain Management Card ─────────────────────────── */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <GlassCard variant="default">
          <div className="space-y-5">
            {/* Card Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4169E1]/10">
                <Network className="w-5 h-5 text-[#4169E1]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Manage City Subdomains</h2>
                <p className="text-sm text-muted-foreground">
                  Map cities to their subdomain prefixes
                </p>
              </div>
            </div>

            <Separator />

            {/* Add New Mapping Form */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                Add New Mapping
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city-name" className="text-xs font-medium text-muted-foreground">
                    City Name
                  </Label>
                  <Input
                    id="city-name"
                    placeholder="e.g., Hyderabad"
                    value={newCityName}
                    onChange={(e) => handleCityNameChange(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subdomain-prefix" className="text-xs font-medium text-muted-foreground">
                    Subdomain Prefix
                  </Label>
                  <Input
                    id="subdomain-prefix"
                    placeholder="e.g., hyderabad"
                    value={newPrefix}
                    onChange={(e) => handlePrefixManualEdit(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              {/* Live preview */}
              {newPrefix && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  Preview:{' '}
                  <code className="px-1.5 py-0.5 rounded bg-[#4169E1]/10 text-[#4169E1] font-mono">
                    {newPrefix}.{baseDomain}
                  </code>
                </motion.p>
              )}
              <Button
                onClick={handleAddMapping}
                disabled={!newCityName.trim() || !newPrefix.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-[#4169E1] to-[#3155c1] hover:from-[#3b5fd4] hover:to-[#2a4cb0] text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Mapping
              </Button>
            </div>

            <Separator />

            {/* Mappings Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Current Mappings
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {subdomainMappings.length} {subdomainMappings.length === 1 ? 'entry' : 'entries'}
                </Badge>
              </div>

              {subdomainMappings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <Network className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    No subdomain mappings yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first mapping above.
                  </p>
                </motion.div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>City Name</TableHead>
                        <TableHead>Subdomain</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {subdomainMappings.map((mapping, index) => (
                          <motion.tr
                            key={mapping.id}
                            variants={rowVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            layout
                            className="border-b transition-colors hover:bg-muted/50 group"
                          >
                            <TableCell className="text-center text-muted-foreground text-sm font-mono">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {mapping.cityName}
                            </TableCell>
                            <TableCell>
                              <code className="px-2 py-1 rounded-md bg-[#4169E1]/10 text-[#4169E1] text-xs font-mono font-semibold">
                                {mapping.subdomainPrefix}.{baseDomain}
                              </code>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(mapping)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-[#4169E1] hover:bg-[#4169E1]/10"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialogId(mapping.id)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── Section 4: Current Routing Status Banner ─────────────────────── */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className={`rounded-xl p-4 flex items-center gap-3 transition-colors duration-500 border ${
            isCustomDomainActive
              ? 'bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-[#4169E1]/5 dark:bg-[#4169E1]/10 border-[#4169E1]/20 dark:border-[#4169E1]/30'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
              isCustomDomainActive
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-[#4169E1]/10'
            }`}
          >
            <Shield
              className={`w-5 h-5 ${
                isCustomDomainActive ? 'text-green-600 dark:text-green-400' : 'text-[#4169E1]'
              }`}
            />
          </div>
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                isCustomDomainActive
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-[#4169E1]'
              }`}
            >
              Current Mode: {isCustomDomainActive ? 'Subdomain Routing' : 'Path-Based Routing'}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isCustomDomainActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-[#4169E1]/70'
              }`}
            >
              {isCustomDomainActive ? (
                <>
                  Cities accessible at{' '}
                  <code className="font-mono font-semibold">
                    [prefix].{baseDomain}
                  </code>
                </>
              ) : (
                <>
                  Cities accessible at{' '}
                  <code className="font-mono font-semibold">/city/[slug]</code>
                </>
              )}
            </p>
          </div>
          <Badge
            className={`ml-auto shrink-0 ${
              isCustomDomainActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700'
                : 'bg-[#4169E1]/10 text-[#4169E1] border-[#4169E1]/20'
            }`}
          >
            {isCustomDomainActive ? 'Active' : 'Default'}
          </Badge>
        </div>
      </motion.div>

      </>
      )}

      {/* ─── Edit Mapping Dialog ──────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#4169E1]" />
              Edit Subdomain Mapping
            </DialogTitle>
            <DialogDescription>
              Update the city name and subdomain prefix for this mapping.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-city-name" className="text-sm font-medium">
                City Name
              </Label>
              <Input
                id="edit-city-name"
                value={editCityName}
                onChange={(e) => setEditCityName(e.target.value)}
                placeholder="e.g., Hyderabad"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-prefix" className="text-sm font-medium">
                Subdomain Prefix
              </Label>
              <Input
                id="edit-prefix"
                value={editPrefix}
                onChange={(e) => setEditPrefix(e.target.value.toLowerCase())}
                placeholder="e.g., hyderabad"
              />
              {editPrefix && (
                <p className="text-xs text-muted-foreground mt-1">
                  Preview:{' '}
                  <code className="px-1.5 py-0.5 rounded bg-[#4169E1]/10 text-[#4169E1] font-mono">
                    {editPrefix}.{baseDomain}
                  </code>
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={savingEdit}
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={savingEdit || !editCityName.trim() || !editPrefix.trim()}
              className="bg-gradient-to-r from-[#4169E1] to-[#3155c1] hover:from-[#3b5fd4] hover:to-[#2a4cb0] text-white"
            >
              {savingEdit ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Check className="w-4 h-4 mr-1.5" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ───────────────────────────────────── */}
      <AlertDialog
        open={!!deleteDialogId}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subdomain Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mapping? This action cannot be undone.
              {deleteDialogId && (
                <span className="block mt-2 font-medium text-foreground">
                  {subdomainMappings.find((m) => m.id === deleteDialogId)?.cityName} →{' '}
                  {subdomainMappings.find((m) => m.id === deleteDialogId)?.subdomainPrefix}.
                  {baseDomain}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
