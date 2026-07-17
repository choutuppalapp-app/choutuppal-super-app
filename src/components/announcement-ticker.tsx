'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

export default function AnnouncementTicker() {
  const [announcementText, setAnnouncementText] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const settings = await res.json()
          setAnnouncementText(settings.announcementText || '')
          setIsActive(settings.isAnnouncementActive ?? false)
        } else {
          setAnnouncementText('ముఖ్య గమనిక: చౌటుప్పల్ సూపర్ యాప్ లో మీ వ్యాపారాన్ని ఉచితంగా నమోదు చేసుకోండి...')
          setIsActive(true)
        }
      } catch (err) {
        console.error('Failed to fetch settings', err)
        setAnnouncementText('ముఖ్య గమనిక: చౌటుప్పల్ సూపర్ యాప్ లో మీ వ్యాపారాన్ని ఉచితంగా నమోదు చేసుకోండి...')
        setIsActive(true)
      } finally {
        setReady(true)
      }
    }
    fetchSettings()
  }, [])

  if (!ready || !isActive) return null

  const textToDisplay = announcementText.trim() || 'ముఖ్య గమనిక: చౌటుప్పల్ సూపర్ యాప్ లో మీ వ్యాపారాన్ని ఉచితంగా నమోదు చేసుకోండి...'
  const tickerText = textToDisplay + '   •   '

  return (
    <div className="w-full flex items-center bg-gradient-to-r from-blue-900 to-yellow-500 text-white overflow-hidden select-none py-1.5 px-3 z-50">
      <div 
        className="flex-1 overflow-hidden relative flex items-center cursor-pointer"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex whitespace-nowrap animate-marquee"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <span className="text-white text-xs font-semibold px-4">
            {tickerText}
          </span>
          <span className="text-white text-xs font-semibold px-4">
            {tickerText}
          </span>
          <span className="text-white text-xs font-semibold px-4">
            {tickerText}
          </span>
          <span className="text-white text-xs font-semibold px-4">
            {tickerText}
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsPaused((p) => !p)}
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-2"
        aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
      >
        {isPaused ? (
          <Play className="w-3.5 h-3.5 text-white" fill="currentColor" />
        ) : (
          <Pause className="w-3.5 h-3.5 text-white" fill="currentColor" />
        )}
      </button>
    </div>
  )
}
export { AnnouncementTicker }
