'use client'

import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function HeroSection() {
  const { navigateTo } = useAppStore()

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-white/50 to-[#4169E1]/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(65,105,225,0.12),transparent_60%)]" />

      {/* Decorative floating orbs */}
      <motion.div
        className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#D4AF37]/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-[#4169E1]/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-xl border border-[#D4AF37]/30 shadow-md mb-6"
          >
            <Sparkles className="size-4 text-[#D4AF37]" />
            <span className="text-sm font-medium text-[#B8962E]">
              మన ఊరి సూపర్ యాప్
            </span>
          </motion.div>

          {/* Telugu Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4"
          >
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#B8962E] to-[#4169E1] bg-clip-text text-transparent">
              చౌటుప్పల్ కి స్వాగతం!
            </span>
            <br />
            <span className="text-gray-800">
              ఇది మన ఊరి డిజిటల్ విప్లవం.
            </span>
          </motion.h1>

          {/* Telugu Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            అత్యుత్తమ లోకల్ షాపులు, ప్రీమియం రియల్ ఎస్టేట్ డీల్స్, మరియు తాజా స్థానిక
            వార్తలు... అన్నీ ఇప్పుడు ఒకే యాప్‌లో, మీ అరచేతిలో!
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigateTo('explore')}
                size="lg"
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#C5A233] hover:to-[#A8882A] text-white font-bold px-8 py-3 shadow-lg shadow-[#D4AF37]/20 text-base"
              >
                Explore Now
                <ChevronRight className="size-5 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
