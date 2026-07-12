'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

interface ReviewFormProps {
  listingId: string
  onSuccess: () => void
}

export default function ReviewForm({ listingId, onSuccess }: ReviewFormProps) {
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('రివ్యూ రాయడానికి దయచేసి లాగిన్ అవ్వండి.')
      setShowLoginModal(true)
      return
    }

    if (rating === 0) {
      toast.error('దయచేసి మీ రేటింగ్ ఎంచుకోండి.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (res.ok) {
        toast.success('రివ్యూ విజయవంతంగా సబ్మిట్ చేయబడింది! 🌟')
        setComment('')
        setRating(0)
        onSuccess()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'రివ్యూ సబ్మిట్ చేయడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800">మీ రేటింగ్ ఇవ్వండి</h3>
      
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoverRating || rating)
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 text-gray-300 hover:scale-110 transition active:scale-95"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  filled ? 'fill-yellow-450 text-yellow-450' : 'text-gray-305'
                }`}
              />
            </button>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="comment" className="text-xs font-bold text-gray-700">రివ్యూ రాయండి</label>
        <textarea
          id="comment"
          rows={3}
          placeholder="ఈ షాపు లేదా సర్వీస్ గురించి మీ అనుభవాన్ని రాయండి..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition resize-none bg-gray-50/50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-75"
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            సబ్మిట్ అవుతోంది...
          </div>
        ) : (
          'సబ్మిట్ చేయండి'
        )}
      </button>
    </form>
  )
}
export { ReviewForm }
