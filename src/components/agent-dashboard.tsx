'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Eye, Phone, Plus, Pencil, Trash2, Edit2,
  X, Image as ImageIcon, MapPin, Loader2, FileText, UploadCloud, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Image from 'next/image'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/rich-text-editor').then(mod => mod.RichTextEditor), { ssr: false })
import Papa from 'papaparse'

interface UserListing {
  id: string
  slug: string
  name: string
  category: string
  description: string | null
  phoneNumber: string | null
  address: string | null
  coverImage: string | null
  viewsCount: number
  status: string
  createdAt: string
  cityId: string
  city?: { id: string; name: string }
}

const CATEGORIES = [
  'Real Estate', 'Restaurants & Cafes', 'Hospitals & Clinics', 'Medical Shops',
  'Schools & Colleges', 'Supermarkets & Groceries', 'Hotels & Lodges',
  'Function Halls', 'Automobiles & Showrooms', 'Clothing & Boutiques',
  'Electronics & Mobiles', 'Salons & Spas', 'Gyms & Fitness',
  'Banks & ATMs', 'Sweet Shops & Bakeries', 'Hardware & Sanitaries',
  'Jewellery', 'Footwear', 'Home Decor & Furniture', 'Services (Plumber/Electrician)',
  'Others'
]

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AgentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'add_listing' | 'bulk_upload' | 'my_assignments'>('add_listing')

  // --- SWR Hooks ---
  const { data: listingsData, mutate: mutateListings, isLoading } = useSWR(
    user?.id ? `/api/listings?userId=${user.id}&limit=100` : null,
    fetcher
  )

  const { data: citiesData } = useSWR('/api/cities', fetcher)
  const cities = citiesData?.cities || []
  const choutuppalCityId = cities.find((c: any) => c.slug === 'choutuppal')?.id || ''

  const [dynamicCategories, setDynamicCategories] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/admin/categories?active=true')
      .then(r => r.json())
      .then(data => setDynamicCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // --- Single Listing Form State ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '', category: '', description: '',
    phoneNumber: '', whatsappNumber: '', cityId: '',
    address: '', coverImage: '', logoUrl: '', galleryUrls: [] as string[],
    price: '', bedroomCount: '', area: '',
    instagramUsername: '', facebookUrl: '', youtubeUrl: ''
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Bulk Upload State ---
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isUploadingBulk, setIsUploadingBulk] = useState(false)

  // --- Functions: Single Listing ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'logoUrl' | 'gallery') => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    try {
      const { default: imageCompression } = await import('browser-image-compression')
      const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 })
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      
      const { data, error } = await supabase.storage.from('listing-images').upload(`covers/${fileName}`, compressedFile)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(`covers/${fileName}`)
      
      if (field === 'gallery') {
        setFormData(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, publicUrl] }))
      } else {
        setFormData(prev => ({ ...prev, [field]: publicUrl }))
      }
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to upload image')
    }
  }

  const submitListing = async () => {
    const finalCityId = formData.cityId || choutuppalCityId
    if (!formData.name || !formData.category || !finalCityId) {
      toast.error('Please fill required fields (Name, Category, City)')
      return
    }
    
    setIsSubmitting(true)
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      
      const payload = {
        ...formData,
        cityId: finalCityId,
        userId: user?.id,
        slug,
        isApproved: true,
        status: 'APPROVED',
      }
      
      const url = editingListingId ? `/api/listings/${editingListingId}` : '/api/listings'
      const method = editingListingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(editingListingId ? 'Listing updated!' : 'Listing created!')
        mutateListings()
        setEditingListingId(null)
        setFormData({
          name: '', category: '', description: '',
          phoneNumber: '', whatsappNumber: '', cityId: choutuppalCityId,
          address: '', coverImage: '', logoUrl: '', galleryUrls: [] as string[],
          price: '', bedroomCount: '', area: '',
          instagramUsername: '', facebookUrl: '', youtubeUrl: ''
        })
        setActiveTab('my_assignments')
      } else {
        toast.error('Failed to save listing')
      }
    } catch (e) {
      toast.error('Error saving listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted')
        mutateListings()
      } else {
        toast.error('Failed to delete')
      }
    } catch (e) {
      toast.error('Error deleting listing')
    }
  }

  const openEdit = (l: any) => {
    setEditingListingId(l.id)
    setFormData({
      name: l.name, category: l.category, description: l.description || '',
      phoneNumber: l.phoneNumber || '', whatsappNumber: l.whatsappNumber || '', cityId: l.cityId,
      address: l.address || '', coverImage: l.coverImage || '', logoUrl: l.logoUrl || '', galleryUrls: l.gallery ? JSON.parse(l.gallery) as string[] : [] as string[],
      price: l.price || '', bedroomCount: l.bedroomCount || '', area: l.area || '',
      instagramUsername: l.instagramUsername || '', facebookUrl: l.facebookUrl || '', youtubeUrl: l.youtubeUrl || ''
    })
    setActiveTab('add_listing')
  }

  // --- Functions: Bulk Upload ---
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFile(file)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data)
      },
      error: (error: any) => {
        toast.error('Error parsing CSV: ' + error.message)
      }
    })
  }

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,category,phoneNumber,whatsappNumber,address,description,price,area,bedroomCount\nSample Business,Restaurants & Cafes,9876543210,,Main Road Choutuppal,A great place to eat,,,,"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "listing_bulk_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const submitBulkUpload = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to upload')
      return
    }
    
    setIsUploadingBulk(true)
    try {
      const res = await fetch('/api/listings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          cityId: choutuppalCityId,
          listings: parsedData
        })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Successfully added ${data.count} listings!`)
        setParsedData([])
        setCsvFile(null)
        mutateListings()
        setActiveTab('my_assignments')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Bulk upload failed')
      }
    } catch (error) {
      toast.error('An error occurred during bulk upload')
    } finally {
      setIsUploadingBulk(false)
    }
  }

  // --- Render Helpers ---
  const renderNavButtons = () => (
    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200/60 overflow-x-auto snap-x scrollbar-hide mb-8">
      {[
        { id: 'add_listing', icon: Plus, label: editingListingId ? 'Edit Listing' : 'Add Listing' },
        { id: 'bulk_upload', icon: UploadCloud, label: 'Bulk Upload' },
        { id: 'my_assignments', icon: Store, label: 'My Assignments' },
      ].map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); if (tab.id !== 'add_listing') setEditingListingId(null) }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all snap-start whitespace-nowrap
              ${isActive ? 'bg-[#4169E1] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <p className="text-gray-500">Please sign in to access your agent dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#4169E1]/10 text-[#4169E1] rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-500">Manage business onboardings and bulk uploads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {renderNavButtons()}

        <AnimatePresence mode="wait">
          {activeTab === 'add_listing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-6 md:p-8">
                 <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                   <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                   {editingListingId ? 'Edit Listing' : 'Add New Listing'}
                 </h2>
                 
                 <div className="space-y-6">
                    {/* Image Upload Zones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo / Logo (షాప్ లోగో)</label>
                        <div className="h-48 border-2 border-dashed border-[#4169E1]/30 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center text-gray-500 overflow-hidden relative transition-all duration-200">
                                                        <>
                                <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                                <button onClick={() => setFormData(p => ({...p, logoUrl: ''}))} className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white z-10 shadow"><Trash2 className="size-4" /></button>
                              </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
                              <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                <UploadCloud className="size-6 text-[#4169E1]" />
                              </div>
                              <span className="text-sm font-medium text-gray-600">Upload Logo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                            </label>
                          )}
                        </div>
                      </div>
                      {/* Cover Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Banner Image</label>
                        <div className="h-48 border-2 border-dashed border-[#4169E1]/30 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center text-gray-500 overflow-hidden relative transition-all duration-200">
                                                        <>
                                <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                                <button onClick={() => setFormData(p => ({...p, coverImage: ''}))} className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white z-10 shadow"><Trash2 className="size-4" /></button>
                              </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
                              <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                <UploadCloud className="size-6 text-[#4169E1]" />
                              </div>
                              <span className="text-sm font-medium text-gray-600">Upload Cover Photo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Gallery Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gallery Images (up to 5 photos)</label>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {formData.galleryUrls.map((url, i) => (
                          <div key={i} className="min-w-[120px] h-[120px] relative border rounded-xl overflow-hidden shadow-sm">
                            <Image src={url} alt={`Gallery ${i}`} fill className="object-cover" />
                            <button onClick={() => setFormData(p => ({...p, galleryUrls: p.galleryUrls.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white z-10"><Trash2 className="size-3" /></button>
                          </div>
                        ))}
                        {formData.galleryUrls.length < 5 && (
                          <label className="min-w-[120px] h-[120px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">
                            <Plus className="size-6 mb-1" />
                            <span className="text-xs">Add Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} />
                          </label>
                        )}
                      </div>
                    </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                       <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sri Sai Tiffin Center" className="h-11 bg-gray-50 border-gray-200" />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                       <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                         <SelectTrigger className="h-11 bg-gray-50 border-gray-200"><SelectValue placeholder="Select Category" /></SelectTrigger>
                         <SelectContent>
                          {(dynamicCategories.length > 0 ? dynamicCategories.map(c => c.name) : CATEGORIES).map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                       </Select>
                     </div>
                   </div>

                   {/* Real Estate Dynamic Fields */}
                   {formData.category === 'Real Estate' && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#D4AF37]/5 p-5 rounded-xl border border-[#D4AF37]/20">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                          <Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 5000000" className="bg-white border-gray-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                          <Input type="number" value={formData.bedroomCount} onChange={e => setFormData({...formData, bedroomCount: e.target.value})} placeholder="e.g. 3" className="bg-white border-gray-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Area</label>
                          <Input value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} placeholder="e.g. 150 sq yards" className="bg-white border-gray-200" />
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                       <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="10-digit number" className="h-11 bg-gray-50 border-gray-200" />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                       <Input value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} placeholder="10-digit number" className="h-11 bg-gray-50 border-gray-200" />
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                     <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full physical address" className="h-11 bg-gray-50 border-gray-200" />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram Username</label>
                       <Input value={formData.instagramUsername} onChange={e => setFormData({...formData, instagramUsername: e.target.value})} placeholder="username" className="h-11 bg-gray-50 border-gray-200" />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook URL</label>
                       <Input value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} placeholder="facebook.com/..." className="h-11 bg-gray-50 border-gray-200" />
                     </div>
                     <div>
                       <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
                       <Input value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} placeholder="youtube.com/..." className="h-11 bg-gray-50 border-gray-200" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                     <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[200px] shadow-sm">
                        <RichTextEditor
                          content={formData.description}
                          onChange={(html) => setFormData({...formData, description: html})}
                          placeholder="Describe the business..."
                        />
                     </div>
                   </div>

                   <Button 
                     onClick={submitListing} 
                     disabled={isSubmitting}
                     className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#B8962E] hover:to-[#967A26] text-white py-6 rounded-xl text-lg shadow-lg font-bold border-none"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin size-5" /> : (editingListingId ? 'Update Listing' : 'Create Listing')}
                   </Button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'bulk_upload' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <div className="p-5 bg-blue-50 rounded-full mb-5">
                  <FileText className="size-12 text-[#4169E1]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Bulk CSV Upload</h2>
                <p className="text-gray-500 mb-8 max-w-md leading-relaxed">Upload a CSV file to instantly add multiple businesses at once. Download the template below to ensure correct formatting.</p>
                
                <div className="flex gap-4 w-full max-w-sm">
                  <Button variant="outline" onClick={downloadTemplate} className="flex-1 flex gap-2 h-12 rounded-xl font-semibold border-gray-300 text-gray-700">
                    <Download className="size-4" /> Template
                  </Button>
                  <label className="flex-1">
                    <div className="flex items-center justify-center gap-2 bg-[#4169E1] hover:bg-[#3151b0] text-white px-4 py-2 rounded-xl cursor-pointer transition-colors shadow-md text-sm font-bold h-12">
                      <UploadCloud className="size-4" /> {csvFile ? 'Change File' : 'Upload CSV'}
                    </div>
                    <input type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                  </label>
                </div>
              </div>

              {parsedData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                      Preview ({parsedData.length} records)
                    </h3>
                    <Button onClick={submitBulkUpload} disabled={isUploadingBulk} className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md px-6">
                      {isUploadingBulk ? <Loader2 className="animate-spin size-4 mr-2" /> : <UploadCloud className="size-4 mr-2" />}
                      Upload All
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Name</th>
                          <th className="px-5 py-4 font-semibold">Category</th>
                          <th className="px-5 py-4 font-semibold">Phone</th>
                          <th className="px-5 py-4 font-semibold">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsedData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-semibold text-gray-900">{row.name || '-'}</td>
                            <td className="px-5 py-3 text-gray-600">
                              <Badge variant="outline" className="bg-white">{row.category || '-'}</Badge>
                            </td>
                            <td className="px-5 py-3 text-gray-600 font-mono text-xs">{row.phoneNumber || '-'}</td>
                            <td className="px-5 py-3 text-gray-500 truncate max-w-[200px]">{row.address || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <div className="px-5 py-4 text-center text-sm font-medium text-gray-500 bg-gray-50 border-t border-gray-200">
                        ... and {parsedData.length - 10} more records ready to upload
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'my_assignments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                 <div className="w-1 h-6 bg-[#4169E1] rounded-full"></div>
                 My Assignments
              </h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />)}
                </div>
              ) : listingsData?.listings?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listingsData.listings.map((listing: UserListing) => (
                    <div key={listing.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white hover:shadow-md transition-shadow">
                      <div className="h-36 bg-gray-100 relative group">
                        {listing.coverImage ? (
                          <Image src={listing.coverImage} alt={listing.name} fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50"><ImageIcon className="size-8" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button onClick={() => openEdit(listing)} className="p-2 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-white text-gray-700 shadow-sm transition-transform hover:scale-105"><Edit2 className="size-4" /></button>
                          <button onClick={() => deleteListing(listing.id)} className="p-2 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-red-50 text-red-600 shadow-sm transition-transform hover:scale-105"><Trash2 className="size-4" /></button>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 truncate mb-1">{listing.name}</h3>
                        <p className="text-xs font-semibold text-[#4169E1] mb-3">{listing.category}</p>
                        
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1"><Eye className="size-3" /> {listing.viewsCount}</div>
                          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">{listing.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <Store className="size-8 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-600">No assignments found.</p>
                  <p className="text-sm mt-1">Start adding listings to see them here.</p>
                  <Button onClick={() => setActiveTab('add_listing')} className="mt-4 bg-[#D4AF37] hover:bg-[#B8962E] text-white rounded-xl shadow-md">Add First Listing</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
