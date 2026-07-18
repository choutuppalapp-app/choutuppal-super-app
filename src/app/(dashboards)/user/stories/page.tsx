'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import StoryCreator from '@/components/story-creator'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function UserStoriesPage() {
  const { user, isLoading } = useAuth()
  const [stories, setStories] = useState<any[]>([])
  const [loadingStories, setLoadingStories] = useState(true)
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [cities, setCities] = useState<any[]>([])

  const fetchStories = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/stories?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setStories(data)
      }
    } catch (err) {
      console.error('Error fetching user stories:', err)
    } finally {
      setLoadingStories(false)
    }
  }

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities')
      if (res.ok) {
        const data = await res.json()
        setCities(data)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchStories()
      fetchCities()
    }
  }, [user])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this story?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Story deleted successfully!')
        fetchStories()
      } else {
        toast.error('Failed to delete story')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to manage your stories.</p>
      </div>
    )
  }

  const activeCityId = cities[0]?.id || 'default'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent">
            My Stories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Stories are visible to all users on the home page and expire automatically after 24 hours.
          </p>
        </div>
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Upload Story
        </button>
      </div>

      {loadingStories ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[9/16] bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8 shadow-sm">
          <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No active stories</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Share local daily updates, shop offers, or personal updates with everyone in Choutuppal.
          </p>
          <button
            onClick={() => setIsCreatorOpen(true)}
            className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:scale-105 transition-transform"
          >
            Create Your First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative aspect-[9/16] group flex flex-col justify-between"
            >
              {story.mediaType === 'VIDEO' ? (
                <video src={story.mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={story.mediaUrl} alt={story.title || 'Story'} className="absolute inset-0 w-full h-full object-cover" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />

              {/* Top info */}
              <div className="relative z-20 p-3 flex justify-between items-start">
                <span className="text-[10px] bg-blue-900/80 backdrop-blur-md text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {story.mediaType}
                </span>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="bg-red-500/90 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow hover:scale-105"
                  title="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom text */}
              <div className="relative z-20 p-3.5 space-y-1.5">
                {story.text && (
                  <p className="text-white text-xs font-bold line-clamp-2 leading-relaxed">
                    {story.text}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-gray-300 text-[10px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Posted {formatDistanceToNow(new Date(story.createdAt))} ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreatorOpen && (
        <StoryCreator
          isOpen={isCreatorOpen}
          onClose={() => setIsCreatorOpen(false)}
          cityId={activeCityId}
          userId={user.id}
          onStoryCreated={fetchStories}
        />
      )}
    </div>
  )
}
