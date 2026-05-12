'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'

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

export function StoriesSection() {
  const { selectedCity } = useAppStore()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [cityId, setCityId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
    <section className="px-4 py-4">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-bold text-gray-800 mb-3"
      >
        ✨ Stories
      </motion.h2>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 snap-start">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                <Skeleton className="w-12 h-3 rounded" />
              </div>
            ))
          : stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 snap-start cursor-pointer"
              >
                {/* Story circle with optional gold ring */}
                <div className="relative">
                  {story.isPremium ? (
                    <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full p-[3px] bg-gradient-to-tr from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">
                      <div className="w-full h-full rounded-full p-[2px] bg-white">
                        <img
                          src={story.imageUrl || '/placeholder-story.jpg'}
                          alt={story.title}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSI0MCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjQwIiB5PSI0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0Q0QUYzNyIgZm9udC1zaXplPSIyNCI+8J+OpzwvdGV4dD48L3N2Zz4='
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full p-[2px] border-2 border-gray-200 bg-white">
                      <img
                        src={story.imageUrl || '/placeholder-story.jpg'}
                        alt={story.title}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSI0MCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjQwIiB5PSI0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0Q0QUYzNyIgZm9udC1zaXplPSIyNCI+8J+OpzwvdGV4dD48L3N2Zz4='
                        }}
                      />
                    </div>
                  )}
                  {/* Premium badge */}
                  {story.isPremium && (
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center shadow-md"
                    >
                      <span className="text-[8px]">👑</span>
                    </motion.div>
                  )}
                </div>

                {/* Title */}
                <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center max-w-[72px] sm:max-w-[84px] truncate">
                  {story.title}
                </span>
              </motion.div>
            ))}
      </div>
    </section>
  )
}
