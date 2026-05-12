'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'
import { OptimizedImage } from '@/components/optimized-image'

interface Story {
  id: string
  title: string
  imageUrl: string
  isPremium: boolean
  viewsCount: number
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
}

// Fallback placeholder SVG for broken images
const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIzMiIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjMyIiB5PSIzNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0Q0QUYzNyIgZm9udC1zaXplPSIyMCI+8J+OpzwvdGV4dD48L3N2Zz4='

export function StoriesSection() {
  const { selectedCity } = useAppStore()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [cityId, setCityId] = useState<string | null>(null)

  // Fetch cityId from slug
  useEffect(() => {
    async function fetchCity() {
      try {
        const res = await fetch('/api/cities')
        if (res.ok) {
          const cities = await res.json()
          const city = cities.find((c: { slug: string; id: string }) => c.slug === selectedCity)
          if (city) setCityId(city.id)
        }
      } catch {
        // ignore
      }
    }
    fetchCity()
  }, [selectedCity])

  // Fetch stories
  useEffect(() => {
    async function fetchStories() {
      if (!cityId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/stories?cityId=${cityId}`)
        if (res.ok) {
          const data = await res.json()
          setStories(data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
  }, [cityId])

  if (!loading && stories.length === 0) return null

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3">
      {/* Horizontal Scroll Container - Hides Scrollbar */}
      <div className="flex overflow-x-auto gap-4 px-4 scrollbar-hide">

        {/* 1. "Add Your Story" Button (First Item) */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
            <span className="text-2xl text-gray-400">+</span>
          </div>
          <span className="text-[10px] text-gray-500 w-16 text-center truncate">Your Story</span>
        </div>

        {/* 2. Loading skeletons */}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
            <Skeleton className="w-[68px] h-[68px] rounded-full" />
            <Skeleton className="w-16 h-3 rounded" />
          </div>
        ))}

        {/* 3. Map through stories */}
        {!loading && stories.map((story) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
          >
            {/* Avatar Ring Logic */}
            <div
              className={`w-[68px] h-[68px] rounded-full flex items-center justify-center p-[2px] ${
                story.isPremium
                  ? 'bg-gradient-to-tr from-[#D4AF37] to-[#FDB931] shadow-md shadow-yellow-200'
                  : 'bg-gradient-to-tr from-gray-300 to-gray-400'
              }`}
            >
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                <OptimizedImage
                src={story.imageUrl || PLACEHOLDER_AVATAR}
                alt={story.title}
                fill
                className="w-full h-full object-cover"
                fallbackType="avatar"
              />
              </div>
            </div>
            {/* Name Text */}
            <span className="text-[10px] text-gray-700 w-16 text-center truncate font-medium">
              {story.user?.fullName || story.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
