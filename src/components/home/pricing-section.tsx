'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Crown, Zap, Star, Megaphone, Ticket } from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { ApplyCoupon, CouponDiscountSummary } from '@/components/apply-coupon'
import { useCouponStore } from '@/hooks/use-coupon-store'

interface PricingPlan {
  id: string
  name: string
  price: string
  priceValue: number // numeric value for coupon calculations
  period: string
  description: string
  icon: React.ElementType
  features: { text: string; included: boolean }[]
  accent: string
  variant: 'default' | 'gold' | 'premium'
  popular?: boolean
}

const PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceValue: 0,
    period: '',
    description: 'Get started with basic visibility',
    icon: Zap,
    features: [
      { text: '1 Business Listing', included: true },
      { text: 'Basic Profile Page', included: true },
      { text: 'WhatsApp Button', included: true },
      { text: 'Featured Placement', included: false },
      { text: 'Analytics Dashboard', included: false },
      { text: 'Priority Support', included: false },
    ],
    accent: 'text-gray-600',
    variant: 'default',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    priceValue: 299,
    period: '/mo',
    description: 'Grow your business reach',
    icon: Star,
    features: [
      { text: '5 Business Listings', included: true },
      { text: 'Enhanced Profile', included: true },
      { text: 'WhatsApp + Lead Forms', included: true },
      { text: 'Featured Placement', included: true },
      { text: 'Analytics Dashboard', included: true },
      { text: 'Priority Support', included: false },
    ],
    accent: 'text-[#4169E1]',
    variant: 'default',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹499',
    priceValue: 499,
    period: '/mo',
    description: 'Maximum visibility & features',
    icon: Crown,
    features: [
      { text: 'Unlimited Listings', included: true },
      { text: 'Premium Gold Profile', included: true },
      { text: 'All Lead Capture Tools', included: true },
      { text: 'Top Featured Placement', included: true },
      { text: 'Full Analytics Suite', included: true },
      { text: 'Priority 24/7 Support', included: true },
    ],
    accent: 'text-[#D4AF37]',
    variant: 'gold',
    popular: true,
  },
  {
    id: 'banner',
    name: 'Banner Ad',
    price: '₹99',
    priceValue: 99,
    period: '/day',
    description: 'Single day promotion blast',
    icon: Megaphone,
    features: [
      { text: '24hr Banner Placement', included: true },
      { text: 'Homepage Visibility', included: true },
      { text: 'Click-through Tracking', included: true },
      { text: 'Custom Design Support', included: false },
      { text: 'A/B Testing', included: false },
      { text: 'Dedicated Manager', included: false },
    ],
    accent: 'text-orange-500',
    variant: 'default',
  },
]

export function PricingSection() {
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const { navigateTo } = useAppStore()
  const { appliedCoupon } = useCouponStore()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // ─── Memoized discount calculations ─────────────────────────────────────
  // Derive all discount values from appliedCoupon using useMemo.
  // appliedCoupon is a stable reference from useState (not useSyncExternalStore),
  // so useMemo will only recompute when the coupon actually changes.

  const discountAmount = useMemo(
    () => appliedCoupon?.discountAmount ?? 0,
    [appliedCoupon],
  )

  const getDiscountedPrice = useMemo(
    () => (plan: PricingPlan): number => {
      if (plan.priceValue <= 0 || discountAmount === 0) return plan.priceValue
      return Math.max(0, plan.priceValue - discountAmount)
    },
    [discountAmount],
  )

  const hasActiveDiscount = discountAmount > 0 && !!appliedCoupon

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    const plan = PLANS.find((p) => p.id === planId)
    if (plan && plan.priceValue > 0) {
      setSelectedPlan(planId)
      return
    }
    toast.success('Welcome! Your free listing is ready.')
    setTimeout(() => navigateTo('dashboard'), 1500)
  }

  const handleCheckout = () => {
    if (!selectedPlan) return
    const plan = PLANS.find((p) => p.id === selectedPlan)
    if (!plan) return

    const discountedPrice = getDiscountedPrice(plan)
    const saved = plan.priceValue - discountedPrice

    toast.success('Payment gateway opening...', {
      description: saved > 0
        ? `You're paying ₹${discountedPrice} (saved ₹${saved} with coupon!)`
        : `Amount: ₹${plan.priceValue}${plan.period}`,
      duration: 4000,
    })
    setSelectedPlan(null)
    setTimeout(() => navigateTo('dashboard'), 1500)
  }

  // Checkout modal for selected plan
  const checkoutPlan = PLANS.find((p) => p.id === selectedPlan)
  const checkoutDiscountedPrice = checkoutPlan ? getDiscountedPrice(checkoutPlan) : 0

  return (
    <section className="px-4 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-lg font-bold text-gray-800 mb-1">💎 Pricing Plans</h2>
        <p className="text-sm text-gray-500">Choose the right plan for your business</p>
      </motion.div>

      {/* Coupon input — above the plans */}
      <div className="mb-6">
        <ApplyCoupon
          cartTotal={checkoutPlan?.priceValue || 499}
          onCouponApplied={(discount) => {
            toast.success(`Great! Your coupon will be applied at checkout`)
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan, index) => {
          const discountedPrice = getDiscountedPrice(plan)
          const planHasDiscount = hasActiveDiscount && plan.priceValue > 0 && discountedPrice < plan.priceValue

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <GlassCard
                variant={plan.variant}
                className="!p-4 h-full flex flex-col relative"
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-white text-[10px] font-bold border-0 shadow-md whitespace-nowrap">
                      👑 Most Popular
                    </Badge>
                  </div>
                )}

                {/* Icon */}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <plan.icon className={`size-5 ${plan.accent}`} />
                  <h3 className={`font-bold text-base ${plan.accent}`}>{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-2">
                  {planHasDiscount ? (
                    <div>
                      <span className="text-sm text-gray-400 line-through">{plan.price}</span>
                      <span className="text-2xl font-bold text-green-600 ml-1">₹{discountedPrice}</span>
                      {plan.period && (
                        <span className="text-sm text-gray-500">{plan.period}</span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-gray-800">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-gray-500">{plan.period}</span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-3">{plan.description}</p>

                {/* Features */}
                <div className="space-y-1.5 flex-1 mb-4">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-2">
                      {feature.included ? (
                        <Check className="size-3.5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="size-3.5 text-gray-300 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full text-sm font-semibold ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#C5A233] hover:to-[#A8882A] text-white shadow-md'
                        : plan.id === 'pro'
                        ? 'bg-[#4169E1] hover:bg-[#3457B5] text-white'
                        : 'bg-white/60 hover:bg-white/80 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {plan.price === 'Free' ? 'Get Started' : 'Subscribe'}
                  </Button>
                </motion.div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Checkout Dialog */}
      {selectedPlan && checkoutPlan && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlan(null) }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#4169E1] px-6 py-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Ticket className="w-5 h-5" />
                <h2 className="text-lg font-bold">Checkout</h2>
              </div>
              <p className="text-sm text-white/80">{checkoutPlan.name} Plan</p>
            </div>

            {/* Body */}
            <div className="bg-white p-6 space-y-4">
              <CouponDiscountSummary originalTotal={checkoutPlan.priceValue} />

              <ApplyCoupon
                cartTotal={checkoutPlan.priceValue}
                className="!border-gray-100 !bg-gray-50/50"
              />

              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#4169E1] text-white font-bold h-12 text-base shadow-lg hover:opacity-90 transition-opacity"
              >
                Pay ₹{checkoutDiscountedPrice} Now
              </Button>

              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
