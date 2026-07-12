'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { Briefcase, ArrowRight, Loader2 } from 'lucide-react'
import ClassifiedCard from '@/components/classified-card'

interface Classified {
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

export function ClassifiedsSection() {
  const { data: classifieds, error } = useSWR<Classified[]>(
    '/api/classifieds',
    (url) => fetch(url).then((res) => res.json())
  )

  const loading = !classifieds && !error
  const items = classifieds?.slice(0, 3) || []

  return (
    <section className="px-4 py-4 space-y-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          జాబ్స్ & క్లాసిఫైడ్స్ (Classifieds)
        </h2>
        <Link 
          href="/classifieds" 
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          అన్నీ చూడండి
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-500 text-center font-semibold">డేటా లోడ్ చేయడం విఫలమైంది.</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4 font-semibold">ఎటువంటి ప్రకటనలు లేవు.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((cls) => (
            <ClassifiedCard key={cls.id} classified={cls} />
          ))}
        </div>
      )}
    </section>
  )
}
export default ClassifiedsSection
