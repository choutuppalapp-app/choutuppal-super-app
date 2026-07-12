'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Announcement {
  id: string
  text: string
  isActive: boolean
  citySlug: string | null
}

export default function AnnouncementTicker() {
  const selectedCity = useAppStore((s) => s.selectedCity)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [ready, setReady] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch('/api/announcements?activeOnly=true')
        if (res.ok) {
          const data: Announcement[] = await res.json()
          if (Array.isArray(data)) {
            const filtered = data.filter(
              (a) => !a.citySlug || a.citySlug === selectedCity
            )
            setAnnouncements(filtered)
          }
        }
      } catch {
        // Silently fail
      } finally {
        setReady(true)
      }
    }
    fetch_()
  }, [selectedCity])

  if (!ready || announcements.length === 0) return null

  const tickerText = announcements.map((a) => a.text).join('   •   ') + '   •   '

  return (
    <div className="w-full flex items-center bg-yellow-400 overflow-hidden select-none py-1">
      <button
        onClick={() => setIsPaused((p) => !p)}
        className="flex-shrink-0 flex items-center justify-center w-10 h-8 bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-md z-10 mr-2 rounded-r-lg"
        aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
      >
        {isPaused ? (
          <Play className="w-3.5 h-3.5 text-black" fill="currentColor" />
        ) : (
          <Pause className="w-3.5 h-3.5 text-black" fill="currentColor" />
        )}
      </button>

      <div 
        className="flex-1 overflow-hidden relative flex items-center"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: 'marquee-animation 25s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <span className="text-black text-xs font-black px-2">
            {tickerText}
          </span>
          <span className="text-black text-xs font-black px-2">
            {tickerText}
          </span>
          <span className="text-black text-xs font-black px-2">
            {tickerText}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes marquee-animation {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  )
}
export { AnnouncementTicker }
