'use client'

import { Phone, Calendar, User } from 'lucide-react'

interface ClassifiedCardProps {
  classified: {
    id: string
    title: string
    description: string
    category: string
    contactNumber: string
    imageUrl: string | null
    createdAt: string
    user: {
      fullName: string
      avatarUrl: string | null
    }
  }
}

export default function ClassifiedCard({ classified }: ClassifiedCardProps) {
  let categoryLabel = 'ప్రకటన'
  let categoryColor = 'bg-gray-105 text-gray-800 border-gray-200'

  if (classified.category === 'JOB') {
    categoryLabel = 'పనివాళ్లు కావాలి'
    categoryColor = 'bg-blue-50 text-blue-800 border-blue-200'
  } else if (classified.category === 'SALE') {
    categoryLabel = 'అమ్మబడును'
    categoryColor = 'bg-green-50 text-green-800 border-green-200'
  } else if (classified.category === 'RENT') {
    categoryLabel = 'అద్దెకు ఇవ్వబడును'
    categoryColor = 'bg-purple-50 text-purple-800 border-purple-200'
  }

  const handleCall = () => {
    window.location.href = `tel:${classified.contactNumber}`
  }

  return (
    <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div>
        {classified.imageUrl && (
          <div className="w-full aspect-video bg-gray-100 relative overflow-hidden">
            <img src={classified.imageUrl} alt={classified.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${categoryColor}`}>
              {categoryLabel}
            </span>
            <div className="text-[9px] text-gray-400 flex items-center gap-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{new Date(classified.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-gray-900 leading-snug">{classified.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 whitespace-pre-line">{classified.description}</p>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 space-y-3">
        <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3">
          <div className="w-6 h-6 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center shrink-0">
            {classified.user?.avatarUrl ? (
              <img src={classified.user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
          <span className="text-[10px] font-bold text-gray-500 truncate">{classified.user?.fullName || 'User'}</span>
        </div>

        <button
          onClick={handleCall}
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs"
        >
          <Phone className="w-3.5 h-3.5 text-white" />
          కాల్ చేయండి
        </button>
      </div>
    </div>
  )
}
export { ClassifiedCard }
