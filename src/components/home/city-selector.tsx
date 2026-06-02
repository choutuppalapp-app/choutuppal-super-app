'use client'

import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { GlassCard } from '@/components/glass-card'

// ─── Types (must match city-visibility-manager.tsx) ───────────────────────────
interface CityConfig {
  id: number
  name: string
  slug: string
  showOnHome: boolean
  priority: number
}

const STORAGE_KEY = 'manaCitiesConfig'

// ─── City color palette (deterministic by city name) ──────────────────────────
const CITY_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: 'bg-rose-500' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', accent: 'bg-violet-500' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', accent: 'bg-cyan-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', accent: 'bg-teal-500' },
]

function getCityColor(index: number) {
  return CITY_COLORS[index % CITY_COLORS.length]
}

// ─── Load cities from localStorage ────────────────────────────────────────────
function loadVisibleCities(): CityConfig[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Filter: only show cities with showOnHome === true
    // Sort: by priority ascending (1, 2, 3...)
    return parsed
      .filter((c: CityConfig) => c.showOnHome)
      .sort((a: CityConfig, b: CityConfig) => a.priority - b.priority)
  } catch {
    return []
  }
}

/**
 * CitySelector — Reads manaCitiesConfig from LocalStorage and displays
 * city cards that the user can click to navigate to /city/[slug].
 *
 * Only cities where showOnHome === true are shown, sorted by priority.
 * Listens for the 'manaCitiesConfigChanged' custom event for instant updates.
 */
export function CitySelector() {
  const [cities, setCities] = useState<CityConfig[]>(() => loadVisibleCities())

  const selectedCity = useAppStore((s) => s.selectedCity)
  const switchCity = useAppStore((s) => s.switchCity)

  // Listen for changes from the admin panel
  useEffect(() => {
    const handler = () => {
      setCities(loadVisibleCities())
    }
    window.addEventListener('manaCitiesConfigChanged', handler)
    // Also listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) handler()
    })
    return () => {
      window.removeEventListener('manaCitiesConfigChanged', handler)
    }
  }, [])

  const handleCityClick = (slug: string) => {
    if (slug === selectedCity) return
    switchCity(slug)
  }

  // Don't render anything if no visible cities
  if (cities.length === 0) return null

  return (
    <section className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-[#4169E1]" />
        <h2 className="text-lg font-bold text-gray-800">Explore Cities</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cities.map((city, index) => {
          const color = getCityColor(index)
          const isActive = city.slug === selectedCity

          return (
            <button
              key={city.id}
              onClick={() => handleCityClick(city.slug)}
              className={`relative overflow-hidden rounded-xl border transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'border-[#4169E1] ring-2 ring-[#4169E1]/30 shadow-md'
                  : `${color.border} hover:shadow-sm`
              }`}
            >
              <GlassCard className={`!p-0 h-full ${color.bg}`}>
                <div className="p-4 flex flex-col items-center gap-2 text-center">
                  {/* City initial letter avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                      isActive ? 'bg-[#4169E1]' : color.accent
                    }`}
                  >
                    {city.name.charAt(0).toUpperCase()}
                  </div>

                  {/* City name */}
                  <span
                    className={`text-sm font-semibold leading-tight ${
                      isActive ? 'text-[#4169E1]' : color.text
                    }`}
                  >
                    {city.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex items-center gap-1 text-[10px] text-[#4169E1] font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4169E1] animate-pulse" />
                      Current
                    </div>
                  )}
                </div>
              </GlassCard>
            </button>
          )
        })}
      </div>
    </section>
  )
}
