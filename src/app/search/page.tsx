'use client'

import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import ListingCard from '@/components/listing-card'
import SearchBar from '@/components/search-bar'
import { Loader2, Search } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const category = searchParams.get('category') || ''

  const apiParams = new URLSearchParams()
  if (query) apiParams.set('query', query)
  if (category) apiParams.set('category', category)

  const { data: listings, error } = useSWR(
    `/api/search?${apiParams.toString()}`,
    (url) => fetch(url).then((res) => res.json())
  )

  const loading = !listings && !error

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <SearchBar />

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4 text-gray-400" />
            శోధన ఫలితాలు (Search Results)
          </h2>
          {(query || category) && (
            <p className="text-xs text-gray-400 mt-0.5">
              Showing results for {query && `"${query}"`} {category && `in category "${category}"`}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-650 p-4 rounded-xl text-center font-bold">
            ఫలితాలను లోడ్ చేయడంలో లోపం సంభవించింది.
          </div>
        ) : listings && listings.length === 0 ? (
          <div className="bg-white border border-gray-150 rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm text-gray-600 font-bold">
              క్షమించండి, మీ సెర్చ్ కి తగ్గ షాపులు దొరకలేదు.
            </p>
            <p className="text-xs text-gray-450 mt-1">
              దయచేసి వేరే పదాలతో శోధించండి.
            </p>
            <Link 
              href="/"
              className="mt-5 inline-flex bg-gradient-to-r from-blue-600 to-yellow-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-95 active:scale-95 transition"
            >
              హోమ్ పేజీకి వెళ్ళండి
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.isArray(listings) && listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}
