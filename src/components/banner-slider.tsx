'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  imageUrl: string | null
  shopName: string
  linkUrl: string | null
}

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'fallback-1',
    title: 'లిమిటెడ్ ఆఫర్: మీ వ్యాపారాన్ని కేవలం ₹99తో మా యాప్‌లో ప్రమోట్ చేసుకోండి!',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60',
    shopName: 'చౌటుప్పల్ యాప్ ప్రమోషన్స్',
    linkUrl: '/explore',
  },
]

export default function BannerSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data: banners } = useSWR<Banner[]>(
    '/api/banners?active=true',
    (url) => fetch(url).then((res) => res.json()),
    { fallbackData: FALLBACK_BANNERS, revalidateOnMount: true }
  )

  const list = banners && banners.length > 0 ? banners.filter(b => b.imageUrl) : FALLBACK_BANNERS

  useEffect(() => {
    if (list.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [list.length])

  const current = list[currentIndex] || FALLBACK_BANNERS[0]

  const handleBannerClick = (id: string) => {
    window.open(`/api/banner/click?id=${id}`, '_blank', 'noopener,noreferrer')
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % list.length)
  }

  return (
    <section className="px-4 py-2 w-full">
      <div 
        onClick={() => handleBannerClick(current.id)}
        className="relative overflow-hidden rounded-xl border border-gray-150 bg-white shadow-sm aspect-video cursor-pointer group transition-all duration-300 hover:shadow-md"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={current.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60'} 
            alt={current.title} 
            className="w-full aspect-video object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold text-white backdrop-blur-sm">
              {current.shopName}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white text-xs sm:text-sm font-extrabold leading-snug line-clamp-2 drop-shadow-md">
                {current.title}
              </p>
            </div>

            {list.length > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={handlePrev}
                  className="p-1 rounded-lg bg-black/40 border border-white/10 text-white hover:bg-black/60 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-1 rounded-lg bg-black/40 border border-white/10 text-white hover:bg-black/60 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
export { BannerSlider }
