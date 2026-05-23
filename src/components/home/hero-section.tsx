'use client'

import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { OptimizedImage } from '@/components/optimized-image'
import { useMounted } from '@/hooks/use-mounted'

/**
 * HeroSection — COMPLETE REWRITE
 *
 * RULES ENFORCED:
 * 1. Hero container: relative overflow-hidden max-h-[300px] — ALWAYS, server AND client
 * 2. NO Framer Motion <motion.div> on the server — prevents hydration mismatch
 * 3. Only animate AFTER mount using useEffect(() => setMounted(true), [])
 * 4. Static <div> on SSR, <motion.div> on client — server/client HTML matches
 * 5. All className and style must be identical between server and first client paint
 */

export function HeroSection() {
  const { navigateTo, siteSettings, currentCity, themePrimary, themeSecondary } = useAppStore()
  const mounted = useMounted()
  const cityName = currentCity.name || 'Choutuppal'
  const brandName = currentCity.brandName || 'Choutuppal App'
  const primary = themePrimary || '#D4AF37'
  const secondary = themeSecondary || '#4169E1'

  const whatsappNumber = siteSettings.whatsappSupportNumber || '919912353705'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(brandName)}%20Team`

  const heroImageUrl = currentCity.heroImageUrl || siteSettings.heroImageUrl || null

  const badgeText = currentCity.slug === 'choutuppal'
    ? 'మన ఊరి సూపర్ యాప్'
    : `${brandName} — Your City Super App`

  const isChoutuppal = currentCity.slug === 'choutuppal'
  const headlinePrimary = isChoutuppal ? 'చౌటుప్పల్ కి స్వాగతం!' : `Welcome to ${cityName}!`
  const headlineSecondary = isChoutuppal ? 'ఇది మన ఊరి డిజిటల్ విప్లవం.' : "Your city's digital revolution starts here."

  const description = isChoutuppal
    ? 'అత్యుత్తమ లోకల్ షాపులు, ప్రీమియం రియల్ ఎస్టేట్ డీల్స్, మరియు తాజా స్థానిక వార్తలు... అన్నీ ఇప్పుడు ఒకే యాప్‌లో!'
    : 'Discover the best local shops, premium real estate deals, and the latest city news — all in one app!'

  // Animation props — only applied after mount
  const contentStyle = mounted ? { opacity: 1, transform: 'translateY(0)' } : { opacity: 1, transform: 'translateY(0)' }
  const badgeStyle = mounted ? { opacity: 1, transform: 'scale(1)' } : { opacity: 1, transform: 'scale(1)' }

  return (
    <section className="relative overflow-hidden max-h-[300px] mt-4">
      {/* Background */}
      {heroImageUrl ? (
        <div className="absolute inset-0">
          <OptimizedImage
            src={heroImageUrl}
            alt={`${cityName} Hero`}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
      ) : (
        <>
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

      {/* Decorative orb — static div, no motion animation on SSR */}
      {mounted && (
        <div
          className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/10 blur-2xl"
          style={{ animation: 'heroOrb 6s ease-in-out infinite' }}
        />
      )}

      {/* Content — always visible, no opacity:0 or transform on SSR */}
      <div className="relative px-4 py-8 sm:py-10 max-w-4xl mx-auto">
        <div className="text-center" style={contentStyle}>
          {/* Sparkle badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md mb-3"
            style={badgeStyle}
          >
            <Sparkles className="size-3.5" style={{ color: primary }} />
            <span className="text-xs font-medium text-white">{badgeText}</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
            <span className="text-white">{headlinePrimary}</span>
            <br />
            <span className={heroImageUrl ? 'text-gray-200' : 'text-white/90'}>
              {headlineSecondary}
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm text-white/80 max-w-xl mx-auto mb-4 leading-relaxed line-clamp-2">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
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
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur text-white border border-white/40 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-white/30 transition-colors text-sm min-h-[40px]"
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* CSS keyframes for the orb animation — only loaded on client */}
      {mounted && (
        <style jsx>{`
          @keyframes heroOrb {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.5; }
          }
        `}</style>
      )}
    </section>
  )
}
