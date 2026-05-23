'use client'

import { motion } from 'framer-motion'
import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { OptimizedImage } from '@/components/optimized-image'

/**
 * HeroSection — COMPLETE REWRITE
 *
 * RULES ENFORCED:
 * 1. Hero container: relative overflow-hidden max-h-[300px] — NEVER exceeds 300px
 * 2. <Image fill> inside it: style={{ objectFit: 'cover' }} — proper cropping
 * 3. Content padding reduced to fit within 300px
 * 4. No py-12/py-16/py-20 — constrained height
 */
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

  // Badge text
  const badgeText = currentCity.slug === 'choutuppal'
    ? 'మన ఊరి సూపర్ యాప్'
    : `${brandName} — Your City Super App`

  // Headline
  const isChoutuppal = currentCity.slug === 'choutuppal'
  const headlinePrimary = isChoutuppal
    ? 'చౌటుప్పల్ కి స్వాగతం!'
    : `Welcome to ${cityName}!`
  const headlineSecondary = isChoutuppal
    ? 'ఇది మన ఊరి డిజిటల్ విప్లవం.'
    : 'Your city\'s digital revolution starts here.'

  // Description
  const description = isChoutuppal
    ? 'అత్యుత్తమ లోకల్ షాపులు, ప్రీమియం రియల్ ఎస్టేట్ డీల్స్, మరియు తాజా స్థానిక వార్తలు... అన్నీ ఇప్పుడు ఒకే యాప్‌లో!'
    : `Discover the best local shops, premium real estate deals, and the latest city news — all in one app!`

  return (
    <section className="relative overflow-hidden max-h-[300px] mt-4">
      {/* Background: City hero image OR gradient fallback */}
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
        </>
      )}

      {/* Decorative floating orbs */}
      <motion.div
        className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/10 blur-2xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content — constrained to fit in max-h-[300px] */}
      <div className="relative px-4 py-8 sm:py-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Sparkle badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md mb-3"
          >
            <Sparkles className="size-3.5" style={{ color: primary }} />
            <span className="text-xs font-medium text-white">{badgeText}</span>
          </motion.div>

          {/* Headline — smaller text to fit in 300px */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold leading-tight mb-2"
          >
            <span className="text-white">{headlinePrimary}</span>
            <br />
            <span className={heroImageUrl ? 'text-gray-200' : 'text-white/90'}>
              {headlineSecondary}
            </span>
          </motion.h1>

          {/* Description — compact */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-white/80 max-w-xl mx-auto mb-4 leading-relaxed line-clamp-2"
          >
            {description}
          </motion.p>

          {/* CTA Buttons — compact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2"
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigateTo('explore')}
                size="sm"
                className="text-white font-bold px-6 py-2 shadow-lg text-sm min-h-[40px]"
                style={{
                  background: `linear-gradient(to right, ${primary}, ${secondary})`,
                  boxShadow: `0 6px 10px -3px ${primary}30`,
                }}
              >
                Explore Now
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur text-white border border-white/40 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-white/30 transition-colors text-sm min-h-[40px]"
              >
                <MessageCircle className="size-4" />
                Chat on WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
