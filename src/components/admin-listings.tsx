'use client'

import { useState, useEffect, useRef } from 'react'
import { getAdminListings, deleteAdminListing, createAdminListing } from '@/app/actions/admin-actions'
import { Loader2, Trash2, Upload, Plus, Image as ImageIcon, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import Papa from 'papaparse'
import { useAuth } from '@/lib/auth-context'

export default function AdminListings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ listings: any[], realEstate: any[] }>({ listings: [], realEstate: [] })
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form State
  const [category, setCategory] = useState('Business')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [bhk, setBhk] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  // Images State
  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await getAdminListings()
      setData(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, type: 'business' | 'real_estate') => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      await deleteAdminListing(id, type)
      fetchData()
    } catch (e) {
      alert('Error deleting listing')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover' | 'gallery') => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true }
      
      const newUrls: string[] = []
      for (const file of files) {
        if (type === 'gallery' && galleryUrls.length + newUrls.length >= 5) break
        
        const compressedFile = await imageCompression(file, options)
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        
        const { error } = await supabase.storage.from('listings').upload(fileName, compressedFile)
        if (error) throw error

        const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(fileName)
        newUrls.push(publicUrl)
      }

      if (type === 'logo') setLogoUrl(newUrls[0])
      if (type === 'cover') setCoverUrl(newUrls[0])
      if (type === 'gallery') setGalleryUrls(prev => [...prev, ...newUrls].slice(0, 5))
      
    } catch (error) {
      console.error(error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      const cityId = 'default-city-id' // Ideally from context or settings

      if (category === 'Real Estate') {
        await createAdminListing({
          userId: user?.id || 'admin',
          cityId,
          title: name,
          price,
          bedroomCount: parseInt(bhk) || 0,
          area,
          address,
          ownerPhone: phone,
          images: JSON.stringify(galleryUrls),
          isApproved: true,
          status: 'APPROVED'
        }, 'real_estate')
      } else {
        await createAdminListing({
          userId: user?.id || 'admin',
          cityId,
          name,
          category,
          description,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
          contactPhone: phone,
          address,
          logoUrl,
          coverImage: coverUrl,
          gallery: JSON.stringify(galleryUrls),
          isApproved: true,
          status: 'APPROVED'
        }, 'business')
      }
      setIsCreating(false)
      fetchData()
      // Reset
      setName(''); setDescription(''); setPrice(''); setBhk(''); setArea(''); setAddress(''); setPhone(''); setLogoUrl(''); setCoverUrl(''); setGalleryUrls([])
    } catch (error) {
      console.error(error)
      alert('Failed to create listing')
    } finally {
      setUploading(false)
    }
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setUploading(true)
        try {
          const rows = results.data as any[]
          for (const row of rows) {
            const isRealEstate = row.category === 'Real Estate'
            await createAdminListing({
              userId: user?.id || 'admin',
              cityId: 'default-city-id',
              status: 'APPROVED',
              isApproved: true,
              ...(isRealEstate ? {
                title: row.name,
                price: row.price || '0',
                ownerPhone: row.phone || '',
                bedroomCount: parseInt(row.bhk) || 0,
                area: row.area || '',
                address: row.address || ''
              } : {
                name: row.name,
                category: row.category || 'Business',
                slug: (row.name || 'b').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
                contactPhone: row.phone || '',
                address: row.address || ''
              })
            }, isRealEstate ? 'real_estate' : 'business')
          }
          alert('Bulk upload complete!')
          fetchData()
        } catch (error) {
          console.error(error)
          alert('Error during bulk upload')
        } finally {
          setUploading(false)
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Listings Management</h2>
        <div className="flex gap-4">
          <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" /> Bulk CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          </label>
          <button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isCreating ? 'Cancel' : 'New Listing'}
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option>Business</option>
                <option>Real Estate</option>
                <option>Services</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{category === 'Real Estate' ? 'Title' : 'Name'}</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>
            
            {category === 'Real Estate' && (
              <>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price</label><input required value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">BHK</label><input value={bhk} onChange={e => setBhk(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label><input value={area} onChange={e => setArea(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              </>
            )}

            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
            
            {category !== 'Real Estate' && (
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {category !== 'Real Estate' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Profile/Logo</label>
                  <label className="w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
                    {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo')} />
                  </label>
                </div>
              )}
              {category !== 'Real Estate' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cover Image</label>
                  <label className="w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
                    {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'cover')} />
                  </label>
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Gallery (Max 5)</label>
                <div className="flex gap-2">
                  {galleryUrls.map((url, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg relative overflow-hidden group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {galleryUrls.length < 5 && (
                    <label className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                      <Plus className="w-4 h-4 text-gray-400" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'gallery')} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button disabled={uploading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Listing (Auto-Approved)'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {data.listings.map((l: any) => (
            <div key={l.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900">{l.name}</h4>
                <p className="text-sm text-gray-500">{l.category} • {l.contactPhone}</p>
              </div>
              <button onClick={() => handleDelete(l.id, 'business')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {data.realEstate.map((l: any) => (
            <div key={l.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900">{l.title} <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">Real Estate</span></h4>
                <p className="text-sm text-gray-500">₹{l.price} • {l.ownerPhone}</p>
              </div>
              <button onClick={() => handleDelete(l.id, 'real_estate')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
