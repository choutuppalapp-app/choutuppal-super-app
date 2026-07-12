'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Tiffin', value: 'Tiffin' },
  { label: 'Medicals', value: 'Medicals' },
  { label: 'Salons', value: 'Salons' },
  { label: 'Plumbers', value: 'Plumbers' },
  { label: 'Real Estate', value: 'Real Estate' },
]

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialQuery = searchParams.get('query') || ''
  const initialCategory = searchParams.get('category') || ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const isFirstRender = useRef(true)

  const triggerSearch = (q: string, cat: string) => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('query', q.trim())
    if (cat) params.set('category', cat)
    router.push(`/search?${params.toString()}`)
  }

  // Debounced search trigger
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const timer = setTimeout(() => {
      triggerSearch(query, selectedCategory)
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    triggerSearch(query, selectedCategory)
  }

  const handleCategoryClick = (catVal: string) => {
    setSelectedCategory(catVal)
    triggerSearch(query, catVal)
  }

  return (
    <div className="w-full bg-white px-4 py-3 sticky top-0 z-30 border-b border-gray-100 shadow-sm">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="మీకు కావాల్సిన షాపు లేదా సర్వీస్ వెతకండి..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition bg-gray-50/50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-95 active:scale-95 transition-all text-sm shrink-0 flex items-center justify-center shadow-md"
        >
          వెతకండి
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 mt-2 scrollbar-hide max-w-2xl mx-auto">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.value
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryClick(cat.value)}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all whitespace-nowrap active:scale-95 ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-yellow-500 text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
export { SearchBar }
