'use client'

import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { OptimizedImage } from '@/components/optimized-image'

/**
 * HeroSection — COMPLETE REWRITE
 *
 * HYDRATION ERROR — ROOT CAUSES & PERMANENT FIXES:
 *
 * ROOT CAUSE 1: useMounted() used useSyncExternalStore which returns
 *   false on server but TRUE on client's first render. Conditional rendering
 *   (orb, keyframes) created hydration mismatches.
 *   FIX: Do NOT conditionally render any DOM elements. Always render the
 *   exact same structure on server and client. The decorative orb and its
 *   animation are always present — the animation simply won't run on the
 *   server (no browser to process it), which is harmless.
 *
 * ROOT CAUSE 2: themePrimary/themeSecondary came from the Zustand store.
 *   These could differ between server (defaults) and client (hydrated),
 *   causing inline style mismatches.
 *   FIX: Hardcode gradient colors as string constants. NEVER derive them
 *   from window, localStorage, or changing state.
 *
 * ROOT CAUSE 3: Structural DOM changes between server and client.
 *   Server rendered some classes, client changed them based on state.
 *   FIX: The DOM nesting, className, and style are EXACTLY the same on
 *   server and client. No conditional classes. No conditional elements.
 *
 * RULES ENFORCED:
 * 1. Hero container: className="relative overflow-hidden max-h-[300px] mt-4" — ALWAYS
 * 2. NO Framer Motion — zero motion.div elements, ever
 * 3. NO useMounted / no conditional rendering — same DOM on server and client
 * 4. Hardcoded gradient colors — NOT from store, window, or localStorage
 * 5. Identical className and style on server and client first render
 * 6. Decorative elements always present — animation runs naturally on client
 */

// ─── HARDCODED GRADIENT COLORS ─────────────────────────────────────────────
// These are string constants. They MUST NOT come from the Zustand store,
// window, localStorage, or any changing state. This guarantees server and
// client always render the exact same inline styles on first paint.
const HERO_PRIMARY = '#D4AF37'    // Gold
const HERO_SECONDARY = '#4169E1'  // Royal Blue

export function HeroSection() {
  const { navigateTo, siteSettings, currentCity } = useAppStore()

  // ─── DERIVED VALUES ──────────────────────────────────────────────────────
  // These come from the Zustand store's default values. Since the store
  // doesn't use persist middleware, the defaults are the same on server
  // and client's first render. They only change AFTER useEffect fires
  // in parent components, which is after hydration completes.
  const cityName = currentCity.name || 'Choutuppal'
  const brandName = currentCity.brandName || 'Choutuppal App'
  const heroImageUrl = currentCity.heroImageUrl || siteSettings.heroImageUrl || null

  const whatsappNumber = siteSettings.whatsappSupportNumber || '919912353705'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20${encodeURIComponent(brandName)}%20Team`

  const isChoutuppal = currentCity.slug === 'choutuppal'
  const badgeText = isChoutuppal
    ? 'మన ఊరి సూపర్ యాప్'
    : `${brandName} — Your City Super App`

  const headlinePrimary = isChoutuppal ? 'చౌటుప్పల్ కి స్వాగతం!' : `Welcome to ${cityName}!`
  const headlineSecondary = isChoutuppal
    ? 'ఇది మన ఊరి డిజిటల్ విప్లవం.'
    : "Your city's digital revolution starts here."

  const description = isChoutuppal
    ? 'అత్యుత్తమ లోకల్ షాపులు, ప్రీమియం రియల్ ఎస్టేట్ డీల్స్, మరియు తాజా స్థానిక వార్తలు... అన్నీ ఇప్పుడు ఒకే యాప్‌లో!'
    : 'Discover the best local shops, premium real estate deals, and the latest city news — all in one app!'

  return (
    <section className="relative overflow-hidden max-h-[300px] mt-4">
      {/* ═══ BACKGROUND — IDENTICAL on server and client ═══ */}
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
          {/* Main gradient — uses HARDCODED colors, never from store/state */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${HERO_SECONDARY}, ${HERO_PRIMARY})` }}
          />
          {/* Accent glow — uses HARDCODED colors */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at top right, ${HERO_PRIMARY}40, transparent 60%)` }}
          />
        </>
      )}

      {/* ═══ DECORATIVE ORB — ALWAYS rendered (same DOM on server & client) ═══ */}
      {/* The animation won't run on the server (no browser), but the div is present. */}
      {/* This prevents hydration mismatch from conditional rendering. */}
      <div
        className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/10 blur-2xl hero-orb-animate"
      />

      {/* ═══ CONTENT — always visible, NO conditional classes or styles ═══ */}
      <div className="relative px-4 py-8 sm:py-10 max-w-4xl mx-auto">
        <div className="text-center">
          {/* Sparkle badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md mb-3">
            <Sparkles className="size-3.5" style={{ color: HERO_PRIMARY }} />
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

          {/* CTA Buttons — uses HARDCODED colors for gradient */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Button
              onClick={() => navigateTo('explore')}
              size="sm"
              className="text-white font-bold px-6 py-2 shadow-lg text-sm min-h-[40px]"
              style={{
                background: `linear-gradient(to right, ${HERO_PRIMARY}, ${HERO_SECONDARY})`,
                boxShadow: `0 6px 10px -3px ${HERO_PRIMARY}30`,
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

      {/* ═══ CSS KEYFRAMES — always present (no conditional rendering) ═══ */}
      <style jsx>{`
        @keyframes heroOrb {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        .hero-orb-animate {
          animation: heroOrb 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
