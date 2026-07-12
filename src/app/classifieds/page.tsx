'use client'

import { useState } from 'react'
import useSWR from 'swr'
import ClassifiedCard from '@/components/classified-card'
import ClassifiedForm from '@/components/classified-form'
import { Plus, X, ListFilter, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const FILTERS = [
  { label: 'All (అన్నీ)', value: '' },
  { label: 'Jobs (ఉద్యోగాలు)', value: 'JOB' },
  { label: 'For Sale (అమ్మకాలు)', value: 'SALE' },
  { label: 'Rent (అద్దెలు)', value: 'RENT' },
]

export default function ClassifiedsPage() {
  const [selectedFilter, setSelectedFilter] = useState('')
  const [showForm, setShowForm] = useState(false)

  const apiParams = new URLSearchParams()
  if (selectedFilter) {
    apiParams.set('category', selectedFilter)
  }

  const { data: classifieds, error, mutate } = useSWR(
    `/api/classifieds?${apiParams.toString()}`,
    (url) => fetch(url).then((res) => res.json())
  )

  const loading = !classifieds && !error

  const handleFormSuccess = () => {
    setShowForm(false)
    mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 text-gray-900">
      <header className="bg-white border-b border-gray-150 px-4 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-base text-gray-900">జాబ్స్ & క్లాసిఫైడ్స్ (Classifieds)</h1>
            <p className="text-[10px] text-gray-400">చౌటుప్పల్‌లో ఉద్యోగాలు, అమ్మకాలు మరియు అద్దెలు</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            showForm
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-gradient-to-r from-blue-600 to-yellow-500 text-white hover:opacity-95'
          }`}
        >
          {showForm ? (
            <div className="flex items-center gap-1">
              <X className="w-4 h-4" />
              రద్దు చేయి
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              ప్రకటన వేయండి
            </div>
          )}
        </button>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-200">
            <ClassifiedForm onSuccess={handleFormSuccess} />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <ListFilter className="w-4 h-4 text-gray-400" />
            ఫిల్టర్స్ (Filter by)
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {FILTERS.map((f) => {
              const active = selectedFilter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setSelectedFilter(f.value)}
                  className={`text-xs font-bold px-4 py-2 rounded-full border whitespace-nowrap active:scale-95 transition-all ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-yellow-500 text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold text-sm">
            ప్రకటనలను లోడ్ చేయడంలో విఫలమైంది.
          </div>
        ) : classifieds && classifieds.length === 0 ? (
          <div className="bg-white border border-gray-150 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm text-gray-600 font-bold">
              క్షమించండి, ఈ విభాగంలో ఎటువంటి ప్రకటనలు లేవు.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              మొదటి ప్రకటన వేయడానికి పైన ఉన్న బటన్‌ను క్లిక్ చేయండి.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.isArray(classifieds) && classifieds.map((cls: any) => (
              <ClassifiedCard key={cls.id} classified={cls} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
export { ClassifiedsPage }
