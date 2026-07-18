'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, Share2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Banner {
  id: string
  imageUrl: string
  linkUrl: string | null
  expiresAt: string
  createdAt: string
  uploadedBy: string
}

interface FallbackSlide {
  id: string
  title: string
  subtitle: string
  desc: string
  gradient: string
  icon: string
  badge: string
}

const FALLBACK_SLIDES: FallbackSlide[] = [
  {
    id: 'fallback-1',
    badge: 'ఉచిత బిజినెస్ ప్రమోషన్',
    title: 'మీ వ్యాపారాన్ని నమోదు చేయండి',
    subtitle: 'ఉచిత కస్టమర్ కనెక్ట్',
    desc: 'చౌటుప్పల్ యాప్ లో మీ వ్యాపారాన్ని ఉచితంగా నమోదు చేసుకోండి. మీ కస్టమర్ల సంఖ్యను పెంచుకోండి!',
    gradient: 'from-slate-900 via-blue-900 to-indigo-900',
    icon: '🏢',
  },
  {
    id: 'fallback-2',
    badge: 'స్థానిక రియల్ ఎస్టేట్',
    title: 'ప్లాట్లు & ఇళ్ళ వివరాలు',
    subtitle: 'నిజమైన అమ్మకందారులు',
    desc: 'చౌటుప్పల్ మరియు చుట్టుపక్కల ప్రాంతాల ప్లాట్లు, ఇళ్లు, వ్యవసాయ భూముల వివరాలు అన్నీ ఒకే చోట.',
    gradient: 'from-emerald-950 via-teal-900 to-cyan-900',
    icon: '🏡',
  },
  {
    id: 'fallback-3',
    badge: 'తాజా లోకల్ అప్డేట్స్',
    title: 'మన ఊరి వార్తలు',
    subtitle: '24/7 లైవ్ అప్డేట్స్',
    desc: 'చౌటుప్పల్ నియోజకవర్గ తాజా వార్తలు మరియు ముఖ్య సంఘటనలు ప్రతి నిమిషం మీ వేలికొనలపై.',
    gradient: 'from-red-950 via-rose-900 to-amber-900',
    icon: '📢',
  },
  {
    id: 'fallback-4',
    badge: 'డైలీ అప్డేట్స్',
    title: 'మీ విశేషాలు షేర్ చేయండి',
    subtitle: 'వాట్సాప్ తరహా స్టోరీస్',
    desc: 'మీ రోజువారీ విశేషాలను, ఆఫర్లను వాట్సాప్ స్టోరీస్ ద్వారా చౌటుప్పల్ ప్రజలందరికీ తెలియజేయండి.',
    gradient: 'from-purple-950 via-pink-900 to-rose-900',
    icon: '✨',
  },
]

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

export default function PremiumBanners() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const { data: banners } = useSWR<Banner[]>(
    '/api/banners/portrait',
    (url) => fetch(url).then((res) => res.json()),
    { refreshInterval: 10000 }
  )

  const slides = banners && banners.length > 0 ? banners : FALLBACK_SLIDES
  const isFallback = !banners || banners.length === 0

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const currentSlide = slides[currentIndex] || slides[0]

  return (
    <section className="px-4 py-4 w-full flex flex-col items-center">
      <div className="w-full max-w-sm flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider font-telugu">
            ప్రత్యేక ప్రకటనలు (Premium Ads)
          </h2>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
          9:16 Portrait
        </span>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-sm aspect-[9/16] bg-gradient-to-r from-blue-900 to-yellow-500 p-[2px] rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden cursor-pointer group"
      >
        <div className="relative w-full h-full bg-white rounded-[14px] overflow-hidden flex flex-col">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0 w-full h-full flex flex-col justify-between"
            >
              {isFallback ? (
                // Modern Tailwind Custom Infographics for Empty state
                <div
                  className={`w-full h-full bg-gradient-to-br ${(currentSlide as any).gradient} text-white p-6 flex flex-col justify-between select-none relative`}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 text-[120px] pointer-events-none select-none">
                    {(currentSlide as any).icon}
                  </div>

                  {/* Header info */}
                  <div className="flex flex-col gap-2 relative z-10">
                    <span className="self-start text-[10px] font-extrabold tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase">
                      {(currentSlide as any).badge}
                    </span>
                    <h3 className="text-2xl font-black font-telugu leading-snug mt-2">
                      {(currentSlide as any).title}
                    </h3>
                    <p className="text-xs font-bold text-yellow-400 font-telugu">
                      {(currentSlide as any).subtitle}
                    </p>
                  </div>

                  {/* Icon & Details */}
                  <div className="flex flex-col items-center justify-center py-6 text-6xl relative z-10">
                    {(currentSlide as any).icon}
                  </div>

                  {/* Footer description & button */}
                  <div className="flex flex-col gap-4 relative z-10">
                    <p className="text-xs text-gray-200 leading-relaxed font-telugu text-center">
                      {(currentSlide as any).desc}
                    </p>
                    <div className="w-full bg-white text-blue-900 font-black text-center py-3 rounded-xl shadow-md text-xs hover:bg-yellow-400 hover:text-black transition duration-200">
                      మరిన్ని వివరాలు ➔
                    </div>
                  </div>
                </div>
              ) : (
                // Live Cloudflare R2 Uploaded Ads
                <div className="w-full h-full relative group">
                  <Image
                    src={(currentSlide as any).imageUrl}
                    alt="Premium Banner Ad"
                    fill
                    sizes="(max-width: 768px) 100vw, 384px"
                    priority
                    className="object-cover w-full h-full rounded-[14px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                  
                  {/* Share button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (navigator.share) {
                        navigator.share({
                          title: 'Choutuppal App Premium Ad',
                          url: (currentSlide as any).linkUrl || window.location.href
                        })
                      }
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition z-25"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* Click trigger overlay */}
                  {(currentSlide as any).linkUrl && (
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <a 
                        href={(currentSlide as any).linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-extrabold text-center py-3 rounded-xl shadow-lg text-xs"
                      >
                        మరింత సమాచారం ➔
                      </a>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Left/Right Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition z-30 opacity-0 group-hover:opacity-100 duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition z-30 opacity-0 group-hover:opacity-100 duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Slides Indicator dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
export { PremiumBanners }
