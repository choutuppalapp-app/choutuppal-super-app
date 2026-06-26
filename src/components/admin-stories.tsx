'use client'

import { useState, useEffect } from 'react'
import { getAdminStories, deleteAdminStory } from '@/app/actions/admin-actions'
import { Loader2, Trash2, Clock, ShieldAlert } from 'lucide-react'

export default function AdminStories() {
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await getAdminStories()
      setStories(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to moderate (delete) this story?')) return
    try {
      await deleteAdminStory(id)
      fetchData()
    } catch (e) {
      alert('Error deleting story')
    }
  }

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins}m left`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-orange-50 border border-orange-100 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Stories Moderation</h2>
          <p className="text-sm text-orange-700 mt-1">Review active user stories and moderate inappropriate content.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stories.map((s: any) => {
            const timeRemaining = getRemainingTime(s.expiresAt)
            const isExpired = timeRemaining === 'Expired'
            return (
              <div key={s.id} className={`rounded-xl overflow-hidden relative border ${isExpired ? 'border-red-200' : 'border-gray-200'} shadow-sm`}>
                <div className="aspect-[9/16] bg-gray-900 relative">
                  {s.mediaType === 'VIDEO' ? (
                    <video src={s.mediaUrl} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <img src={s.mediaUrl} className="w-full h-full object-cover opacity-80" />
                  )}
                  
                  <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <span className={`text-[10px] px-2 py-1 rounded bg-black/60 text-white flex items-center gap-1 backdrop-blur-md ${isExpired ? 'text-red-300' : ''}`}>
                      <Clock className="w-3 h-3" /> {timeRemaining}
                    </span>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {stories.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No stories available to moderate.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
