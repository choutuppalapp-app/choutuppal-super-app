'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

/**
 * HeroSection — COMPLETE REWRITE
 *
 * 5 STRICT RULES ENFORCED:
 *
 * RULE 1: Client-Only Rendering (THE ONLY PERMANENT FIX)
 *   Because Framer Motion in sibling components and complex gradients
 *   break SSR, DO NOT render the Hero on the server.
 *   if (!mounted) return <skeleton placeholder>
 *   The skeleton is a SINGLE <section> tag with bg-gray-100 animate-pulse.
 *   Server and client first render produce the EXACT same element.
 *   The full hero only renders AFTER hydration on the client.
 *
 * RULE 2: NEVER change DOM structure conditionally
 *   No blur circles that swap positions with content containers.
 *   The mounted version has a FIXED DOM tree that never changes.
 *
 * RULE 3: ZERO INLINE STYLES
 *   ALL backgrounds use Tailwind CSS classes ONLY:
 *     bg-gradient-to-br from-[#4169E1] to-[#D4AF37]
 *     bg-[radial-gradient(ellipse_at_top_right,#4169E140,transparent_60%)]
 *     bg-[radial-gradient(ellipse_at_bottom_left,#D4AF3733,transparent_60%)]
 *   ZERO style={{ background: "..." }}, ZERO style={{ color: "..." }}.
 *   NO OptimizedImage (it injects style={{ objectFit: 'cover' }}).
 *
 * RULE 4: ENFORCE max-h-[300px]
 *   className="relative overflow-hidden max-h-[300px] mt-4" — ALWAYS.
 *   Present on BOTH the skeleton and the full hero. NEVER removed.
 *
 * RULE 5: No Framer Motion
 *   Zero <motion.div>, zero framer-motion imports.
 */

export function HeroSection() {
  const { navigateTo, siteSettings, currentCity } = useAppStore()

  /* ─── RULE 1: CLIENT-ONLY RENDERING ────────────────────────────────────────
   * Server:        mounted = false → skeleton placeholder (single <section>)
   * Client first:  mounted = false → SAME skeleton (NO hydration mismatch!)
   * After hydrate: mounted = true  → full hero (legitimate re-render)
   */
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  /* ─── RULE 1: SKELETON PLACEHOLDER ────────────────────────────────────────
   * A single <section> tag. Server and client render EXACTLY the same thing.
   * No gradients, no text, no images — just a pulsing gray box.
   * This COMPLETELY eliminates any hydration mismatch risk.
   */
  if (!mounted) {
    return (
      /* RULE 4: max-h-[300px] permanently enforced */
      <section className="relative overflow-hidden max-h-[300px] mt-4 bg-gray-100 animate-pulse rounded-xl" />
    )
  }

  // ─── Derived values (only computed after mount, safe from hydration)
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

  /* ─── FULL HERO — client only, after hydration ────────────────────────────
   * RULE 2: Fixed DOM structure. Overlay containers are absolute inset-0.
   *         Content container is relative with padding. Never changes.
   * RULE 3: ZERO inline styles. All Tailwind classes.
   * RULE 4: max-h-[300px] on the section.
   * RULE 5: Zero Framer Motion.
   */
  return (
    /* RULE 4: max-h-[300px] permanently enforced */
    <section className="relative overflow-hidden max-h-[300px] mt-4">

      {/* ─── Background ─── RULE 2: absolute inset-0, always */}
      {heroImageUrl ? (
        <div className="absolute inset-0">
          {/* RULE 3: className="object-cover" — NOT style={{ objectFit: 'cover' }} */}
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
          {/* RULE 3: bg-gradient-to-br — NOT style={{ background: "linear-gradient(...)" }} */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4169E1] to-[#D4AF37]" />
          {/* RULE 3: bg-[radial-gradient(...)] — NOT style={{ background: "radial-gradient(...)" }} */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#4169E140,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#D4AF3733,transparent_60%)]" />
        </>
      )}

      {/* Decorative orb — RULE 2: absolute, fixed position, always in same DOM location */}
      <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/10 blur-2xl animate-pulse" />

      {/* ─── Content ─── RULE 2: relative, fixed position, always in same DOM location */}
      <div className="relative px-4 py-8 sm:py-10 max-w-4xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-md mb-3">
            {/* RULE 3: text-[#D4AF37] — NOT style={{ color: "#D4AF37" }} */}
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
            {/* RULE 3: bg-gradient-to-r — NOT style={{ background: "linear-gradient(...)" }} */}
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
