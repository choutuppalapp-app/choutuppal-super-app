'use client'

import { motion } from 'framer-motion'
import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { OptimizedImage } from '@/components/optimized-image'

export function HeroSection() {
  const { navigateTo, siteSettings, currentCity, themePrimary, themeSecondary } = useAppStore()

  const cityName = currentCity.name || 'Choutuppal'
  const brandName = currentCity.brandName || 'Choutuppal App'
  const primary = themePrimary || '#D4AF37'
  const secondary = themeSecondary || '#4169E1'

  const whatsappNumber = siteSettings.whatsappSupportNumber || '919912353705'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(brandName)}%20Team`

  // Hero image: prefer city-specific, then site settings, then null
  const heroImageUrl = currentCity.heroImageUrl || siteSettings.heroImageUrl || null

  // Badge text: show brand-specific for non-Choutuppal, Telugu for Choutuppal
  const badgeText = currentCity.slug === 'choutuppal'
    ? 'మన ఊరి సూపర్ యాప్'
    : `${brandName} — Your City Super App`

  // Headline: Telugu for Choutuppal, English for others
  const isChoutuppal = currentCity.slug === 'choutuppal'
  const headlinePrimary = isChoutuppal
    ? 'చౌటుప్పల్ కి స్వాగతం!'
    : `Welcome to ${cityName}!`
  const headlineSecondary = isChoutuppal
    ? 'ఇది మన ఊరి డిజిటల్ విప్లవం.'
    : 'Your city\'s digital revolution starts here.'

  // Description: Telugu for Choutuppal, English for others
  const description = isChoutuppal
    ? 'అత్యుత్తమ లోకల్ షాపులు, ప్రీమియం రియల్ ఎస్టేట్ డీల్స్, మరియు తాజా స్థానిక వార్తలు... అన్నీ ఇప్పుడు ఒకే యాప్‌లో, మీ అరచేతిలో!'
    : `Discover the best local shops, premium real estate deals, and the latest city news — all in one app, right at your fingertips!`

  return (
    <section className="relative overflow-hidden mt-4">
      {/* Background: City hero image OR beautiful gradient fallback */}
      {heroImageUrl ? (
        <div className="absolute inset-0">
          <OptimizedImage
            src={heroImageUrl}
            alt={`${cityName} Hero`}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* Dark overlay on top of image for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
      ) : (
        <>
          {/* Default gradient background when no hero image is set */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${secondary}, ${primary})` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at top right, ${primary}40, transparent 60%)` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at bottom left, ${secondary}33, transparent 60%)` }}
          />
        </>
      )}

      {/* Decorative floating orbs */}
      <motion.div
        className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content — text is always white/light for contrast on both image & gradient */}
      <div className="relative px-4 py-12 sm:py-16 md:py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Sparkle badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md mb-6"
          >
            <Sparkles className="size-4" style={{ color: primary }} />
            <span className="text-sm font-medium text-white">
              {badgeText}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            <span className="text-white">
              {headlinePrimary}
            </span>
            <br />
            <span className={heroImageUrl ? 'text-gray-200' : 'text-white/90'}>
              {headlineSecondary}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigateTo('explore')}
                size="lg"
                className="text-white font-bold px-8 py-3 shadow-lg text-base min-h-[44px]"
                style={{
                  background: `linear-gradient(to right, ${primary}, ${secondary})`,
                  boxShadow: `0 10px 15px -3px ${primary}30`,
                }}
              >
                Explore Now
                <ChevronRight className="size-5 ml-1" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur text-white border border-white/40 font-bold px-8 py-3 rounded-xl shadow-md hover:bg-white/30 transition-colors text-base min-h-[44px]"
              >
                <MessageCircle className="size-5" />
                Chat on WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
