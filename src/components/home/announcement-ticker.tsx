'use client'

import { useEffect, useState, useRef } from 'react'

interface Announcement {
  id: string
  text: string
  isActive: boolean
}

export function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements?activeOnly=true')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setAnnouncements(data)
          }
        }
      } catch {
        // Silently fail — ticker is non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  // Don't render anything if no announcements or still loading
  if (loading || announcements.length === 0) return null

  // Join announcements with stars
  const tickerText = announcements.map((a) => a.text).join('  ✦  ')

  return (
    <div className="w-full bg-[#4169E1]/10 backdrop-blur-md border-b border-[#D4AF37]/30 py-2 overflow-hidden relative">
      {/* Fixed badge on the left */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-[#4169E1]/15 backdrop-blur-sm border-r border-[#D4AF37]/20 px-3">
        <span className="text-xs font-bold text-[#4169E1] whitespace-nowrap flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          తాజా వార్త:
        </span>
      </div>

      {/* Scrolling text container */}
      <div className="ml-24 overflow-hidden" ref={scrollRef}>
        <div className="flex animate-marquee">
          <div className="flex-shrink-0 pr-16">
            <p className="text-sm font-semibold text-[#4169E1] whitespace-nowrap">
              {tickerText}
            </p>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex-shrink-0 pr-16">
            <p className="text-sm font-semibold text-[#4169E1] whitespace-nowrap">
              {tickerText}
            </p>
          </div>
          {/* Triple it for very long seamless loops */}
          <div className="flex-shrink-0 pr-16">
            <p className="text-sm font-semibold text-[#4169E1] whitespace-nowrap">
              {tickerText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
