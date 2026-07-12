'use client'

import { Star, User, Calendar } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    fullName: string
    avatarUrl: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-6 text-center text-gray-500 text-xs font-semibold shadow-sm">
        ఈ షాపుకి ఇంకా ఎటువంటి రివ్యూలు లేవు. మొదటి రివ్యూ మీరే రాయండి!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-800">వినియోగదారుల రివ్యూలు ({reviews.length})</h3>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center shrink-0">
                  {review.user?.avatarUrl ? (
                    <img src={review.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 leading-tight">{review.user?.fullName || 'User'}</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating ? 'fill-yellow-450 text-yellow-450' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {review.comment && (
              <p className="text-xs text-gray-650 leading-relaxed font-medium bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
export { ReviewList }
