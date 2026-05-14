'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { CityData } from '@/lib/store'

/**
 * SettingsInitializer — Fetches site settings and cities from API on first mount.
 * Also triggers geolocation detection for multi-city auto-selection.
 * Placed in root layout so settings are available globally before components render.
 */
export function SettingsInitializer() {
  const fetchSiteSettings = useAppStore((s) => s.fetchSiteSettings)
  const fetchPlatformSettings = useAppStore((s) => s.fetchPlatformSettings)
  const setAvailableCities = useAppStore((s) => s.setAvailableCities)
  const detectLocation = useAppStore((s) => s.detectLocation)
  const locationDetected = useAppStore((s) => s.locationDetected)

  useEffect(() => {
    fetchSiteSettings()
    fetchPlatformSettings()
  }, [fetchSiteSettings, fetchPlatformSettings])

  // Fetch available cities and detect location
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch('/api/cities')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            const cities: CityData[] = data.map((c: Record<string, unknown>) => ({
              id: c.id as string,
              name: c.name as string,
              slug: c.slug as string,
              state: (c.state as string) || 'Telangana',
              brandName: (c.brandName as string) || `${c.name} App`,
              logoUrl: (c.logoUrl as string) || null,
              heroImageUrl: (c.heroImageUrl as string) || null,
              primaryColor: (c.primaryColor as string) || '#4169E1',
              secondaryColor: (c.secondaryColor as string) || '#D4AF37',
              latitude: (c.latitude as number) || 17.2985,
              longitude: (c.longitude as number) || 78.9256,
            }))
            setAvailableCities(cities)
          }
        }
      } catch {
        // Non-critical
      }
    }
    fetchCities()
  }, [setAvailableCities])

  // Auto-detect location once cities are loaded
  useEffect(() => {
    if (!locationDetected) {
      // Small delay to ensure cities are loaded first
      const timer = setTimeout(() => {
        detectLocation()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [locationDetected, detectLocation])

  return null // renders nothing
}
