'use client'

import Image from 'next/image'
import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

/**
 * HeroSection — COMPLETE REWRITE (next/dynamic ssr:false edition)
 *
 * ═══════════════════════════════════════════════════════════════
 * This component is loaded via next/dynamic with ssr: false
 * in page.tsx. That means:
 *   - The server NEVER renders this component.
 *   - The server only renders the <DynamicHeroSection /> loading
 *     placeholder (a simple gray div).
 *   - The client loads this component AFTER hydration.
 *   - ZERO hydration mismatch possible because server and client
 *     never try to render the same DOM for the hero.
 *
 * Because ssr:false handles the hydration problem externally,
 * there is NO NEED for a mounted state gate inside this component.
 * This component is ALWAYS client-only, always mounted.
 * ═══════════════════════════════════════════════════════════════
 *
 * RULES ENFORCED:
 *
 * RULE 1: NO mounted state gate. ssr:false handles hydration.
 *         No useState(false) + useEffect + if(!mounted) return skeleton.
 *         That pattern was the CAUSE of the hydration mismatch
 *         because it swaps DOM between server and client.
 *
 * RULE 2: ZERO inline styles. ALL visual styling via Tailwind.
 *         NO style={{ background: "linear-gradient(...)" }}
 *         NO style={{ background: "radial-gradient(...)" }}
 *         NO style={{ objectFit: "cover" }}
 *         USE: bg-gradient-to-br from-[#4169E1] to-[#D4AF37]
 *         USE: className="object-cover" on Image
 *         NO OptimizedImage (it injects style={{ objectFit: 'cover' }})
 *
 * RULE 3: ENFORCE max-h-[300px] on the root <section>.
 *         className="relative overflow-hidden max-h-[300px] mt-4"
 *         ALWAYS present. NEVER removed. NEVER conditionally changed.
 *
 * RULE 4: NO Framer Motion. Zero imports from framer-motion.
 *         Zero <motion.div>, zero AnimatePresence.
 */

export function HeroSection() {
  const { navigateTo, siteSettings, currentCity } = useAppStore()

  /* ─── Derived values ──────────────────────────────────────────── */
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

  /* ─── RENDER ─────────────────────────────────────────────────────
   * RULE 3: max-h-[300px] permanently enforced on root <section>.
   * RULE 2: ZERO inline styles. All Tailwind.
   * RULE 4: ZERO Framer Motion.
   * RULE 1: NO mounted gate. ssr:false in page.tsx handles it.
   */
  return (
    <section className="relative overflow-hidden max-h-[300px] mt-4 rounded-xl">

      {/* ─── Background ─── */}
      {heroImageUrl ? (
        <div className="absolute inset-0">
          {/* RULE 2: className="object-cover" — NOT style={{ objectFit: 'cover' }} */}
          <Image
            src={heroImageUrl}
            alt={`${cityName} Hero`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
      ) : (
        <>
          {/* RULE 2: bg-gradient-to-br — NOT style={{ background: "linear-gradient(...)" }} */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4169E1] to-[#D4AF37]" />
          {/* RULE 2: bg-[radial-gradient(...)] — NOT style={{ background: "radial-gradient(...)" }} */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#4169E140,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#D4AF3733,transparent_60%)]" />
        </>
      )}

      {/* Decorative orb */}
      <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/10 blur-2xl animate-pulse" />

      {/* ─── Content ─── */}
      <div className="relative px-4 py-8 sm:py-10 max-w-4xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md mb-3">
            {/* RULE 2: text-[#D4AF37] — NOT style={{ color: "#D4AF37" }} */}
            <Sparkles className="size-3.5 text-[#D4AF37]" />
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
            {/* RULE 2: bg-gradient-to-r — NOT style={{ background: "linear-gradient(...)" }} */}
            <Button
              onClick={() => navigateTo('explore')}
              size="sm"
              className="text-white font-bold px-6 py-2 shadow-lg text-sm min-h-[40px] bg-gradient-to-r from-[#D4AF37] to-[#4169E1] hover:from-[#C9A533] hover:to-[#3b5fd4]"
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
    </section>
  )
}
