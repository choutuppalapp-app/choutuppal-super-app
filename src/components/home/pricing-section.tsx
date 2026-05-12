'use client'

import { motion } from 'framer-motion'
import { Check, X, Crown, Zap, Star, Megaphone } from 'lucide-react'
import { GlassCard } from '@/components/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PricingPlan {
  id: string
  name: string
  price: string
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PLANS.map((plan, index) => (
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
                <span className="text-2xl font-bold text-gray-800">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-gray-500">{plan.period}</span>
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
        ))}
      </div>
    </section>
  )
}
