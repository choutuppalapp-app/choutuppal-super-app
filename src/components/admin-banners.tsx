'use client'

import { useState, useEffect } from 'react'
import { getAdminBanners, deleteAdminBanner, createAdminBanner } from '@/app/actions/admin-actions'
import { Loader2, Trash2, Upload, Plus, X, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { useAuth } from '@/lib/auth-context'

export default function AdminBanners() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [shopName, setShopName] = useState('')
  const [offerText, setOfferText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState('24') // hours

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await getAdminBanners()
      setBanners(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      await deleteAdminBanner(id)
      fetchData()
    } catch (e) {
      alert('Error deleting banner')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      
      const { error } = await supabase.storage.from('banners').upload(fileName, compressedFile)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName)
      setImageUrl(publicUrl)
    } catch (error) {
      console.error(error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl) return alert('Please upload an image')
    
    setUploading(true)
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + parseInt(duration))

      await createAdminBanner({
        title,
        shopName,
        offerText,
        imageUrl,
        userId: user?.id || 'admin',
        cityId: 'default-city-id',
        status: 'APPROVED',
        isActive: true,
        isFree: true,
        pricePerDay: 0,
        expiresAt
      })
      setIsCreating(false)
      fetchData()
      // Reset
      setTitle(''); setShopName(''); setOfferText(''); setImageUrl(''); setDuration('24')
    } catch (error) {
      console.error(error)
      alert('Failed to create banner')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Banner Management</h2>
          <p className="text-sm text-blue-700 mt-1 font-medium">బ్యానర్ ఖరీదు: ₹99/- రోజుకు <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs ml-2 uppercase animate-pulse">(ప్రస్తుతం ఉచితం - FREE)</span></p>
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isCreating ? 'Cancel' : 'New Banner'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Shop/Business Name</label><input required value={shopName} onChange={e => setShopName(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Offer Text</label><input value={offerText} onChange={e => setOfferText(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Auto Expiry)</label>
                <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image (16:9 Aspect Ratio)</label>
              <label className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative group">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload 16:9 image</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <button disabled={uploading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload & Publish Banner'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b: any) => {
            const isExpired = b.expiresAt && new Date(b.expiresAt) < new Date()
            return (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="aspect-video bg-gray-100 relative">
                  <img src={b.imageUrl} className="w-full h-full object-cover" />
                  {isExpired && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase">Expired</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900">{b.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">{b.shopName}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-500 gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {b.expiresAt ? (
                        <span>Expires: {new Date(b.expiresAt).toLocaleDateString()}</span>
                      ) : (
                        <span>No Expiry</span>
                      )}
                    </div>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
