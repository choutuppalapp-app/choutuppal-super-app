'use client'

import useSWR from 'swr'
import { Store, Trash2, Calendar, MapPin, Layers, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface Listing {
  id: string
  title: string
  description: string
  category: {
    name: string
  } | null
  imageUrl: string | null
  phone: string
  address: string | null
  createdAt: string
  user: {
    id: string
    fullName: string
  } | null
}

export default function AdminListingsPage() {
  const { data: listings, error, mutate } = useSWR<Listing[]>(
    '/api/listings?all=true',
    (url) => fetch(url).then((res) => res.json())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('లిస్టింగ్ విజయవంతంగా తొలగించబడింది.')
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
      <div className="bg-red-50 text-red-600 p-4 rounded-xl font-semibold">
        డేటా లోడ్ చేయడంలో విఫలమైంది.
      </div>
    )
  }

  if (!listings) {
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
          <Store className="w-6 h-6 text-blue-600" />
          లిస్టింగ్ల నిర్వహణ (Listings Moderation)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యాప్‌లో నమోదైన బిజినెస్ మరియు సేవలను ఇక్కడ పర్యవేక్షించి, స్పామ్ లిస్టింగ్‌లను తొలగించవచ్చు.
        </p>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        {listings.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            ఎటువంటి లిస్టింగ్‌లు కనుగొనబడలేదు.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">వ్యాపార సమాచారం (Business Info)</th>
                  <th className="px-6 py-4">వర్గం (Category)</th>
                  <th className="px-6 py-4">ఫోన్ / చిరునామా (Contact)</th>
                  <th className="px-6 py-4">నమోదైన తేదీ (Created At)</th>
                  <th className="px-6 py-4 text-right">చర్యలు (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm text-gray-700">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-150 overflow-hidden relative shrink-0 flex items-center justify-center text-gray-400">
                          {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                            {listing.title}
                            <a href={`/listings/${listing.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            నమోదు చేసినవారు: {listing.user?.fullName || 'Anonymous'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-100">
                        <Layers className="w-3 h-3" />
                        {listing.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-gray-800">{listing.phone}</div>
                      {listing.address && (
                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{listing.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-2 px-4 rounded-md shadow-md hover:scale-105 transition-transform inline-flex items-center gap-1.5 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        తొలగించండి
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
