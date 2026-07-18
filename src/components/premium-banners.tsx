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
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">ప్రత్యేక ప్రకటనలు</h2>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-auto aspect-[16/9] md:aspect-auto md:h-[450px] md:max-w-none bg-gradient-to-r from-blue-900 to-yellow-500 p-[3px] rounded-3xl shadow-2xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden cursor-pointer group"
      >
        <div className="relative w-full h-full bg-white rounded-[21px] overflow-hidden flex flex-col">
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
                // Modern Tailwind Custom 16:9 Landscape Infographics
                <div
                  className={`w-full h-full bg-gradient-to-br ${(currentSlide as any).gradient} text-white p-5 md:p-6 flex flex-col justify-between select-none relative`}
                >
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10 text-[100px] md:text-[140px] pointer-events-none select-none">
                    {(currentSlide as any).icon}
                  </div>

                  {/* Header info */}
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex flex-col gap-1">
                      <span className="self-start text-[9px] font-extrabold tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase">
                        {(currentSlide as any).badge}
                      </span>
                      <h3 className="text-lg md:text-xl font-black font-telugu leading-snug mt-1">
                        {(currentSlide as any).title}
                      </h3>
                      <p className="text-[10px] md:text-xs font-bold text-yellow-400 font-telugu">
                        {(currentSlide as any).subtitle}
                      </p>
                    </div>
                    <div className="text-4xl shrink-0">
                      {(currentSlide as any).icon}
                    </div>
                  </div>

                  {/* Footer description & button */}
                  <div className="flex items-center justify-between gap-4 mt-auto relative z-10">
                    <p className="text-[10px] md:text-xs text-gray-200 leading-relaxed font-telugu max-w-[70%]">
                      {(currentSlide as any).desc}
                    </p>
                    <div className="bg-white text-blue-900 font-black text-center px-4 py-2 rounded-xl shadow-md text-[10px] md:text-xs hover:bg-yellow-400 hover:text-black transition duration-200 shrink-0">
                      మరిన్ని వివరాలు ➔
                    </div>
                  </div>
                </div>
              ) : (
                // Live Cloudflare R2 Uploaded Ads (16:9)
                <div className="w-full h-full relative group">
                  <Image
                    src={(currentSlide as any).imageUrl}
                    alt="Premium Royal Ad"
                    fill
                    sizes="(max-width: 768px) 100vw, 576px"
                    priority
                    className="object-cover w-full h-full rounded-[21px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                  
                  {/* Share button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (navigator.share) {
                        navigator.share({
                          title: 'Choutuppal App Premium Royal Ad',
                          url: (currentSlide as any).linkUrl || window.location.href
                        })
                      }
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition z-25"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Click trigger overlay */}
                  {(currentSlide as any).linkUrl && (
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-end">
                      <a 
                        href={(currentSlide as any).linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-extrabold text-center px-5 py-2.5 rounded-xl shadow-lg text-[10px] md:text-xs"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition z-30 opacity-0 group-hover:opacity-100 duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition z-30 opacity-0 group-hover:opacity-100 duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Slides Indicator dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDirection(idx > currentIndex ? 1 : -1)
                    setCurrentIndex(idx)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
          మీ ప్రకటన ఇక్కడ ఇవ్వండి
        </button>
      </div>
    </section>
  )
}
export { PremiumBanners }
