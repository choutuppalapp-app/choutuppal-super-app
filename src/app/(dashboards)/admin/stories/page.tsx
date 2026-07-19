'use client'

import useSWR from 'swr'
import { PlaySquare, Trash2, Calendar, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Story {
  id: string
  title: string
  mediaType: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  createdAt: string
  expiresAt: string
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
}

export default function AdminStoriesPage() {
  const { data: stories, error, mutate } = useSWR<Story[]>(
    '/api/stories',
    (url) => fetch(url).then((res) => res.json())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('స్టోరీ విజయవంతంగా తొలగించబడింది.')
        mutate()
      } else {
        toast.error('తొలగించడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-650 p-4 rounded-xl font-semibold">
        డేటా లోడ్ చేయడంలో విఫలమైంది.
      </div>
    )
  }

  if (!stories) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PlaySquare className="w-6 h-6 text-blue-600" />
          యూзер స్టోరీల మోడరేషన్ (User Stories)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యూజర్లు పోస్ట్ చేసిన 24 గంటల స్టోరీలను పర్యవేక్షించి, స్పామ్ లేదా అభ్యంతరకర కంటెంట్‌ను ఇక్కడ తొలగించవచ్చు.
        </p>
      </div>

      {stories.length === 0 ? (
        <div className="bg-white border border-gray-150 rounded-2xl p-8 text-center text-gray-500 font-medium">
          ప్రస్తుతం ఎటువంటి యాక్టివ్ యూజర్ స్టోరీలు లేవు.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                {story.mediaType === 'VIDEO' ? (
                  <video src={story.mediaUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={story.mediaUrl} alt={story.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">
                  {story.mediaType}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border">
                      {story.user?.avatarUrl ? (
                        <img src={story.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-800 truncate">{story.user?.fullName || 'User'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(story.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(story.id)}
                  className="w-full bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-2 px-4 rounded-md shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-1.5 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  తొలగించండి
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
