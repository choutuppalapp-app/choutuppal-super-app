'use client'

import { useEffect, useState, useRef } from 'react'
import { Volume2, VolumeX, Pause, Play } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Announcement {
  id: string
  text: string
  isActive: boolean
  citySlug: string | null
}

export function AnnouncementTicker() {
  const selectedCity = useAppStore((s) => s.selectedCity)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [ready, setReady] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

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
        // Silently fail — ticker is non-critical
      } finally {
        setReady(true)
      }
    }
    fetch_()
  }, [selectedCity])

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleVoiceToggle = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const fullText = announcements.map((a) => a.text).join('. ')
    const utterance = new SpeechSynthesisUtterance(fullText)
    utterance.lang = 'te-IN'
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  if (!ready || announcements.length === 0) return null

  // Join with bullet separators, triple for seamless CSS marquee loop
  const tickerText = announcements.map((a) => a.text).join('   •   ')
  const repeatedText = `${tickerText}   •   ${tickerText}   •   ${tickerText}`

  return (
    <div className="w-full flex items-center bg-gray-900 border-y border-yellow-500/30 overflow-hidden select-none">
      {/* Left badge — speaker icon + label */}
      <div className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-500 px-3 py-2 self-stretch">
        <Volume2 className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
        <span className="text-gray-900 text-[11px] font-black uppercase tracking-wider whitespace-nowrap hidden sm:block">
          LIVE
        </span>
      </div>

      {/* Scrolling ticker text */}
      <div 
        className="flex-1 overflow-hidden py-2"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: 'ticker-scroll 10s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <span className="text-yellow-300 text-sm font-semibold px-6 whitespace-nowrap">
            {repeatedText}
          </span>
        </div>
      </div>

      {/* Voice / TTS toggle button */}
      <button
        onClick={handleVoiceToggle}
        className={`flex-shrink-0 flex items-center justify-center w-9 h-full transition-colors border-l border-yellow-500/20 self-stretch px-2 ${
          isSpeaking
            ? 'bg-yellow-500 hover:bg-yellow-400'
            : 'bg-gray-800 hover:bg-gray-700'
        }`}
        aria-label={isSpeaking ? 'Stop voice reading' : 'Read announcements aloud in Telugu'}
        title={isSpeaking ? 'Stop voice' : 'Read in Telugu'}
      >
        {isSpeaking ? (
          <VolumeX className="w-3.5 h-3.5 text-gray-900" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
        )}
      </button>

      {/* Pause / Play toggle button */}
      <button
        onClick={() => setIsPaused((p) => !p)}
        className="flex-shrink-0 flex items-center justify-center w-9 h-full bg-gray-800 hover:bg-gray-700 transition-colors border-l border-yellow-500/20 self-stretch px-2"
        aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? (
          <Play className="w-3.5 h-3.5 text-yellow-400" />
        ) : (
          <Pause className="w-3.5 h-3.5 text-yellow-400" />
        )}
      </button>

      {/* Inline keyframe style */}
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
