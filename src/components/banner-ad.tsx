'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, Gift } from 'lucide-react'

interface Banner {
  id: string
  title: string
  imageUrl: string | null
  shopName: string
  offerText: string | null
  linkUrl: string | null
}

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'fallback-1',
    title: 'లిమిటెడ్ ఆఫర్: మీ వ్యాపారాన్ని కేవలం ₹99తో మా యాప్‌లో ప్రమోట్ చేసుకోండి!',
    imageUrl: null,
    shopName: 'చౌటుప్పల్ యాప్ ప్రమోషన్స్',
    offerText: 'ప్రత్యేక తగ్గింపు',
    linkUrl: '/explore',
  },
]

export default function BannerAd() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data: banners } = useSWR<Banner[]>(
    '/api/banners?active=true',
    (url) => fetch(url).then((res) => res.json()),
    { fallbackData: FALLBACK_BANNERS, revalidateOnMount: true }
  )

  const list = banners && banners.length > 0 ? banners : FALLBACK_BANNERS

  useEffect(() => {
    if (list.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [list.length])

  const current = list[currentIndex]

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
        className="relative overflow-hidden rounded-2xl border border-gray-150 bg-white p-4 shadow-sm min-h-[140px] flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-md"
      >
        {current.imageUrl ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={current.imageUrl} 
              alt={current.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 to-yellow-50/50" />
        )}

        <div className="relative z-10 flex flex-col justify-between h-full flex-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-bold text-yellow-600">
              <Gift className="w-3.5 h-3.5 animate-bounce" />
              ఈ రోజు ప్రత్యేక ఆఫర్
            </span>
            <span className={`text-[10px] font-bold ${current.imageUrl ? 'text-white/80' : 'text-gray-400'}`}>
              {current.shopName}
            </span>
          </div>

          <div className="my-3">
            <p className={`text-sm sm:text-base font-extrabold leading-snug line-clamp-2 ${current.imageUrl ? 'text-white' : 'text-gray-800'}`}>
              {current.title}
            </p>
            {current.offerText && (
              <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {current.offerText}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <button 
              className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              క్లిక్ చేయండి
            </button>

            {list.length > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrev}
                  className={`p-1.5 rounded-lg border transition-colors ${current.imageUrl ? 'bg-black/30 border-white/20 text-white hover:bg-black/55' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleNext}
                  className={`p-1.5 rounded-lg border transition-colors ${current.imageUrl ? 'bg-black/30 border-white/20 text-white hover:bg-black/55' : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100'}`}
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
export { BannerAd }
