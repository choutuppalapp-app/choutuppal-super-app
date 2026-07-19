'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, ImageIcon, UploadCloud, ArrowLeft, Loader2, ExternalLink } from 'lucide-react'
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [bannerData, setBannerData] = useState({
    linkUrl: '',
    imageUrl: ''
  })

  const fetchBanners = async () => {
    if (!user) return
    try {
      const res = await fetch('/api/banners/portrait?all=true')
      if (res.ok) {
        const data = await res.json()
        // Filter by user.id
        const userBanners = data.filter((b: any) => b.uploadedBy === user.id)
        setBanners(userBanners)
      }
    } catch (err) {
      console.error('Error fetching banners:', err)
    } finally {
      setLoadingBanners(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBanners()
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
    const file = files[0]
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  const submitBanner = async () => {
    if (!user || (!selectedFile && !bannerData.imageUrl)) {
      toast.error('Please select an image first')
      return
    }
    setUploading(true)
    try {
      let uploadedUrl = bannerData.imageUrl

      // Upload file to Cloudflare R2 if selected
      if (selectedFile) {
        toast.info('Uploading image to storage...')
        const uploadResult = await compressAndUpload(selectedFile, 'banners')
        uploadedUrl = uploadResult.url
        setBannerData(prev => ({ ...prev, imageUrl: uploadedUrl }))
      }

      if (!uploadedUrl) {
        toast.error('Image upload failed')
        setUploading(false)
        return
      }

      // Publish record to Prisma database
      toast.info('Publishing banner to database...')
      const res = await fetch('/api/banners/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrl,
          linkUrl: bannerData.linkUrl || null,
          uploadedBy: user.id
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          toast.success('Successfully Published!')
          alert('Successfully Published!')
          setIsCreatingBanner(false)
          setBannerData({ linkUrl: '', imageUrl: '' })
          setSelectedFile(null)
          setPreviewUrl('')
          fetchBanners()
        } else {
          toast.error('Failed to publish banner: ' + (data.error || ''))
        }
      } else {
        const errData = await res.json()
        console.error('Banner submit API error:', errData)
        toast.error('Failed to publish banner: ' + (errData.error || ''))
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      toast.error('Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this banner?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/banners/portrait?id=${id}`, { method: 'DELETE' })
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
                Display 16:9 promotional banners to Choutuppal residents on the homepage. Banners expire automatically after 24 hours.
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
                    <div className="aspect-[16/9] relative bg-gray-100">
                      {banner.imageUrl && (
                        <img src={banner.imageUrl} alt="Banner ad" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />
                      
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition-all hover:scale-105"
                          title="Delete banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {banner.linkUrl && (
                        <a 
                          href={banner.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute bottom-3 left-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Visit Link
                        </a>
                      )}
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1 gap-3 bg-white">
                      <div className="flex items-center justify-between mt-auto text-[11px] text-gray-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Created {formatDistanceToNow(new Date(banner.createdAt))} ago
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[9px] font-black ${
                          isExpired 
                            ? 'bg-red-55/60 text-red-650' 
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
              <label className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl h-44 cursor-pointer hover:bg-gray-100 transition overflow-hidden relative">
                {previewUrl || bannerData.imageUrl ? (
                  <img src={previewUrl || bannerData.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <UploadCloud className="w-8 h-8 text-blue-900" />
                    <span className="font-bold text-xs text-gray-500">Upload 16:9 Banner Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
              </label>
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

            <div className="w-full flex justify-center mt-6">
              <button
                onClick={submitBanner}
                disabled={uploading || isUploading || (!selectedFile && !bannerData.imageUrl)}
                className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
              >
                {uploading || isUploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                  </span>
                ) : (
                  'Publish Banner'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
