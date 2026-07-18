'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, ImageIcon, UploadCloud, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function UserBannersPage() {
  const { user, isLoading } = useAuth()
  const [banners, setBanners] = useState<any[]>([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [isCreatingBanner, setIsCreatingBanner] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cities, setCities] = useState<any[]>([])

  const [bannerData, setBannerData] = useState({
    title: '',
    shopName: '',
    offerText: '',
    linkUrl: '',
    imageUrl: '',
    cityId: ''
  })

  const fetchBanners = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/banners?userId=${user.id}&all=true`)
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (err) {
      console.error('Error fetching banners:', err)
    } finally {
      setLoadingBanners(false)
    }
  }

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities')
      if (res.ok) {
        const data = await res.json()
        setCities(data)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBanners()
      fetchCities()
    }
  }, [user])

  const compressAndUpload = async (file: File, folder: string) => {
    setIsUploading(true)
    try {
      let fileToUpload = file
      if (file.type.startsWith('image/')) {
        try {
          const imageCompression = (await import('browser-image-compression')).default
          const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true }
          fileToUpload = await imageCompression(file, options)
        } catch (err) {
          console.error('Image compression error:', err)
        }
      }

      const formData = new FormData()
      formData.append('file', fileToUpload)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Upload API failure:', errorData)
        toast.error('Image upload failed: ' + (errorData.error || 'Unknown error'))
        throw new Error('Upload failed')
      }

      const data = await res.json()
      return { url: data.url }
    } finally {
      setIsUploading(false)
    }
  }

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    toast.info('Uploading image...')
    try {
      const data = await compressAndUpload(files[0], 'banners')
      setBannerData(prev => ({ ...prev, imageUrl: data.url }))
      toast.success('Uploaded banner successfully')
    } catch {
      toast.error('Failed to upload image')
    }
    e.target.value = ''
  }

  const submitBanner = async () => {
    if (!user || !bannerData.title || !bannerData.imageUrl) return
    setUploading(true)
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cityId: bannerData.cityId || cities[0]?.id || 'default',
          title: bannerData.title,
          shopName: bannerData.shopName || '',
          offerText: bannerData.offerText || null,
          linkUrl: bannerData.linkUrl || null,
          imageUrl: bannerData.imageUrl || null,
          isActive: true,
          expiresAt,
        }),
      })
      if (res.ok) {
        toast.success('Banner created successfully!')
        setIsCreatingBanner(false)
        setBannerData({ title: '', shopName: '', offerText: '', linkUrl: '', imageUrl: '', cityId: '' })
        fetchBanners()
      } else {
        const errData = await res.text()
        console.error('Banner submit API error:', errData)
        toast.error('Failed to create banner')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this banner?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Banner deleted successfully!')
        fetchBanners()
      } else {
        toast.error('Failed to delete banner')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to manage your banners.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isCreatingBanner ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent">
                My Banner Ads
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Display promotional banners to Choutuppal residents on the homepage. Banners expire automatically after 24 hours.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingBanner(true)}
              className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Banner
            </button>
          </div>

          {loadingBanners ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 bg-gray-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8 shadow-sm">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No active banners</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Promote your shop, discount offers, or new arrivals with custom 16:9 banner ads.
              </p>
              <button
                onClick={() => setIsCreatingBanner(true)}
                className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:scale-105 transition-transform"
              >
                Create Your First Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {banners.map((banner) => {
                const isExpired = banner.expiresAt ? new Date(banner.expiresAt) < new Date() : false
                return (
                  <div 
                    key={banner.id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition duration-300 relative"
                  >
                    <div className="h-40 relative bg-gray-100">
                      {banner.imageUrl && (
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
                      
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-all hover:scale-105"
                          title="Delete banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-4 z-10">
                        <h4 className="font-extrabold text-white text-lg drop-shadow">{banner.title}</h4>
                        {banner.shopName && (
                          <p className="text-xs text-gray-300 font-semibold">{banner.shopName}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1 gap-3 bg-white">
                      {banner.offerText && (
                        <p className="text-gray-700 text-sm font-semibold">{banner.offerText}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 text-[11px] text-gray-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Created {formatDistanceToNow(new Date(banner.createdAt))} ago
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[9px] font-black ${
                          isExpired 
                            ? 'bg-red-55/60 text-red-600' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-lg mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Create Banner Ad</h2>
            <button
              onClick={() => setIsCreatingBanner(false)}
              className="text-gray-500 hover:text-gray-800 font-bold text-sm flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-gray-800 font-bold text-xs uppercase tracking-wide">Banner Image *</span>
              <label className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl h-36 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative">
                {bannerData.imageUrl ? (
                  <img src={bannerData.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <UploadCloud className="w-7 h-7 text-blue-900" />
                    <span className="font-bold text-xs text-gray-500">Upload 16:9 Banner Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-gray-800 font-bold text-xs uppercase tracking-wide">Internal title *</span>
              <input 
                type="text" 
                placeholder="E.g., Special Diwali Offer" 
                value={bannerData.title} 
                onChange={e => setBannerData({...bannerData, title: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-gray-800 font-bold text-xs uppercase tracking-wide">Shop Name</span>
              <input 
                type="text" 
                placeholder="E.g., Sri Laxmi Traders" 
                value={bannerData.shopName} 
                onChange={e => setBannerData({...bannerData, shopName: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-gray-800 font-bold text-xs uppercase tracking-wide">Offer Text / Tagline</span>
              <input 
                type="text" 
                placeholder="E.g., Flat 20% off on all clothing items!" 
                value={bannerData.offerText} 
                onChange={e => setBannerData({...bannerData, offerText: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-gray-800 font-bold text-xs uppercase tracking-wide">Target Website / Link URL</span>
              <input 
                type="url" 
                placeholder="https://..." 
                value={bannerData.linkUrl} 
                onChange={e => setBannerData({...bannerData, linkUrl: e.target.value})} 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              onClick={submitBanner}
              disabled={uploading || isUploading || !bannerData.title || !bannerData.imageUrl}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isUploading ? (
                'Uploading...'
              ) : (
                'Publish Banner'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
