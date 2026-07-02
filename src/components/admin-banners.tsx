'use client'

import { useState, useEffect } from 'react'
import { getAdminBanners, deleteAdminBanner } from '@/app/actions/admin-actions'
import { Loader2, Trash2, Calendar, Link as LinkIcon, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    setLoading(true)
    try {
      const data = await getAdminBanners()
      setBanners(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) return
    try {
      await deleteAdminBanner(id)
      fetchBanners()
    } catch (error) {
      alert('Error deleting banner')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Banner Management</h2>
        <Badge variant="secondary" className="px-3 py-1 text-sm">{banners.length} Total</Badge>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
          No banners found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(banner => (
            <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="aspect-[21/9] bg-gray-100 relative">
                {banner.imageUrl ? (
                  <img loading="lazy" decoding="async" src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={banner.isActive ? 'default' : 'secondary'} className={banner.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {banner.isFree && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur text-blue-600 border-blue-200">
                      Free Ad
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1 text-lg mb-1">{banner.title}</h3>
                
                <div className="space-y-2 mt-2 flex-1">
                  {banner.shopName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">{banner.shopName}</span>
                    </div>
                  )}
                  {banner.linkUrl && (
                    <div className="flex items-center text-sm text-gray-600">
                      <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline line-clamp-1">
                        {banner.linkUrl}
                      </a>
                    </div>
                  )}
                  {banner.expiresAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      Expires: {new Date(banner.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
