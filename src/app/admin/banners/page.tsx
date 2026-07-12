'use client'

import useSWR from 'swr'
import { Image as ImageIcon, Trash2, Calendar, MousePointer, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Banner {
  id: string
  title: string
  imageUrl: string | null
  shopName: string
  linkUrl: string | null
  expiresAt: string | null
  clicks: number
  isActive: boolean
  status: string
}

export default function AdminBannersPage() {
  const { data: banners, error, mutate } = useSWR<Banner[]>(
    '/api/banners?all=true',
    (url) => fetch(url).then((res) => res.json())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner ad?')) return

    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('బ్యానర్ విజయవంతంగా తొలగించబడింది.')
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

  if (!banners) {
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
          <ImageIcon className="w-6 h-6 text-blue-600" />
          బ్యానర్ ప్రకటనల నిర్వహణ (Banner Ads)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యాప్‌లో ప్రదర్శించబడే అన్ని రకాల బ్యానర్ ప్రకటనల క్లిక్స్ మరియు మోడరేషన్ ఇక్కడ చేయవచ్చు.
        </p>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        {banners.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">
            ఎటువంటి బ్యానర్ ప్రకటనలు కనుగొనబడలేదు.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">ప్రకటన సమాచారం (Banner)</th>
                  <th className="px-6 py-4">లింక్ (Target URL)</th>
                  <th className="px-6 py-4">క్లిక్స్ (Clicks)</th>
                  <th className="px-6 py-4">గడువు (Expiry)</th>
                  <th className="px-6 py-4 text-right">చర్యలు (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm text-gray-700">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shrink-0">
                          {banner.imageUrl ? (
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">{banner.shopName || 'Shop Name'}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{banner.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {banner.linkUrl ? (
                        <a 
                          href={banner.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-semibold"
                        >
                          లింక్ చూడండి
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                        <MousePointer className="w-3 h-3" />
                        {banner.clicks} Clicks
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {banner.expiresAt ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(banner.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold transition"
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
