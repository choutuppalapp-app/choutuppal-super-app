'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, MapPin, Loader2, X, Users, Crown, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GlassCard } from '@/components/glass-card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

interface CityOption {
  id: string
  name: string
  slug: string
}

export function BecomeAdminCta() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const themePrimary = useAppStore((s) => s.themePrimary)
  const themeSecondary = useAppStore((s) => s.themeSecondary)
  const platformSettings = useAppStore((s) => s.platformSettings)
  const { isAuthenticated, user, setShowLoginModal } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [applicationType, setApplicationType] = useState<'city_admin' | 'agent'>('city_admin')
  const [cityName, setCityName] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cities, setCities] = useState<CityOption[]>([])

  const franchiseeFee = platformSettings?.city_admin_fee || '50000'

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!user) return
    if (applicationType === 'city_admin' && !cityName.trim()) {
      toast.error('City name is required')
      return
    }
    if (applicationType === 'agent' && !selectedCityId) {
      toast.error('Please select a city')
      return
    }

    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        userId: user.id,
        cityName: applicationType === 'city_admin' ? cityName.trim() : (cities.find(c => c.id === selectedCityId)?.name || ''),
        reason: reason.trim() || undefined,
        type: applicationType,
      }
      if (applicationType === 'agent') {
        payload.agentCityId = selectedCityId
      }

      const res = await fetch('/api/admin-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(
          applicationType === 'city_admin'
            ? 'Franchisee application submitted! Super Admin will review it.'
            : 'Agent application submitted! You will be notified once approved.',
          { duration: 5000 }
        )
        setShowModal(false)
        setCityName('')
        setReason('')
        setSelectedCityId('')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to submit application. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCtaClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    setShowModal(true)
  }

  return (
    <>
      {/* CTA Section - Two Cards Side by Side */}
      <section className="px-4 py-4 space-y-4">
        {/* Franchisee CTA */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard variant="premium" className="!p-0 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary}, ${themePrimary})`,
              }}
            />
            <div
              className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: themePrimary }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-15"
              style={{ backgroundColor: themeSecondary }}
            />

            <div className="relative z-10 text-center py-8 md:py-12 px-6 md:px-12">
              <motion.div
                initial={false}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-14 h-14 md:w-18 md:h-18 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`,
                }}
              >
                <Crown className="size-7 md:size-9 text-white" />
              </motion.div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Own This App for Your City! 🏙️
              </h2>

              <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mb-4 leading-relaxed">
                Become a City Admin (Franchisee) and run this platform in your city. 
                Manage local businesses, news, and community — earn revenue share from every transaction!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                {['Revenue Share', 'Full Dashboard', 'Manage Content', 'Grow Community'].map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/60 backdrop-blur-sm border border-white/40 text-gray-700"
                  >
                    <MapPin className="size-3" style={{ color: themePrimary }} />
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mb-5">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                  <IndianRupee className="size-3 mr-1" />
                  Franchisee Fee: ₹{Number(franchiseeFee).toLocaleString('en-IN')}
                </Badge>
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                  Non-refundable
                </Badge>
              </div>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    setApplicationType('city_admin')
                    handleCtaClick()
                  }}
                  size="lg"
                  className="rounded-xl px-8 py-3 text-base font-bold shadow-xl transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`,
                    color: '#fff',
                  }}
                >
                  <Crown className="size-5 mr-2" />
                  Apply for Franchisee
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Agent CTA */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <GlassCard className="!p-0 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${themeSecondary}, ${themePrimary})`,
              }}
            />
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-15"
              style={{ backgroundColor: themeSecondary }}
            />

            <div className="relative z-10 text-center py-8 md:py-10 px-6 md:px-12">
              <motion.div
                initial={false}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${themeSecondary}, ${themePrimary})`,
                }}
              >
                <Users className="size-6 md:size-7 text-white" />
              </motion.div>

              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Join as an Agent & Earn Commission! 💰
              </h2>

              <p className="text-gray-600 text-sm max-w-lg mx-auto mb-4 leading-relaxed">
                Onboard businesses, sell premium listings, and earn commission on every sale. 
                Work flexibly in your city — no upfront fee required!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                {[
                  `${platformSettings?.agent_commission_listing || '20'}% on Listings`,
                  `${platformSettings?.agent_commission_banner || '15'}% on Banners`,
                  'No Upfront Fee',
                  'Flexible Hours',
                ].map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/50 backdrop-blur-sm border border-white/30 text-gray-600"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    setApplicationType('agent')
                    handleCtaClick()
                  }}
                  size="default"
                  className="rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${themeSecondary}, ${themePrimary})`,
                    color: '#fff',
                  }}
                >
                  <Users className="size-4 mr-2" />
                  Join as Agent
                </Button>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="size-4 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${themePrimary}15` }}
                  >
                    {applicationType === 'city_admin' ? (
                      <Crown className="size-6" style={{ color: themePrimary }} />
                    ) : (
                      <Users className="size-6" style={{ color: themePrimary }} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {applicationType === 'city_admin' ? 'Apply as City Admin (Franchisee)' : 'Join as Agent'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {applicationType === 'city_admin'
                      ? `Franchisee Fee: ₹${Number(franchiseeFee).toLocaleString('en-IN')} (non-refundable)`
                      : 'Earn commission on every business you onboard'}
                  </p>
                </div>

                <div className="space-y-4">
                  {applicationType === 'city_admin' ? (
                    <div className="space-y-2">
                      <Label htmlFor="cityName" className="text-sm font-medium text-gray-700">
                        City Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                          id="cityName"
                          placeholder="e.g. Hyderabad, Warangal..."
                          value={cityName}
                          onChange={(e) => setCityName(e.target.value)}
                          className="pl-9 rounded-xl"
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Select City <span className="text-red-500">*</span>
                      </Label>
                      <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Choose your city" />
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

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                      Why do you want to {applicationType === 'city_admin' ? 'manage this city' : 'become an agent'}?{' '}
                      <span className="text-gray-400">(optional)</span>
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder={
                        applicationType === 'city_admin'
                          ? 'Tell us about your connection to this city...'
                          : 'Tell us about your sales experience and local network...'
                      }
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="rounded-xl min-h-[80px] resize-none"
                      disabled={submitting}
                    />
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || (applicationType === 'city_admin' ? !cityName.trim() : !selectedCityId)}
                      className="w-full rounded-xl py-3 font-bold text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${themePrimary}, ${themeSecondary})`,
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          {applicationType === 'city_admin' ? (
                            <Crown className="size-4 mr-2" />
                          ) : (
                            <Users className="size-4 mr-2" />
                          )}
                          Submit Application
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
