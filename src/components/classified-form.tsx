'use client'

import { useState } from 'react'
import { Loader2, Upload, Phone, FileText, Layout } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

interface ClassifiedFormProps {
  onSuccess: () => void
}

export default function ClassifiedForm({ onSuccess }: ClassifiedFormProps) {
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('JOB')
  const [contactNumber, setContactNumber] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ఫోటో సైజ్ 5MB కంటే తక్కువగా ఉండాలి.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'content')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setImageUrl(data.url)
        toast.success('ఫోటో అప్‌లోడ్ చేయబడింది!')
      } else {
        toast.error('ఫోటో అప్‌లోడ్ విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('అప్‌లోడ్ చేయడంలో సాంకేతిక లోపం.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('ప్రకటన వేయడానికి దయచేసి లాగిన్ అవ్వండి.')
      setShowLoginModal(true)
      return
    }

    if (!title.trim() || !description.trim() || !contactNumber.trim()) {
      toast.error('అన్ని తప్పనిసరి వివరాలను నింపండి.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/classifieds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          contactNumber: contactNumber.trim(),
          imageUrl: imageUrl || null,
        }),
      })

      if (res.ok) {
        toast.success('ప్రకటన విజయవంతంగా సృష్టించబడింది! 🎉')
        setTitle('')
        setDescription('')
        setCategory('JOB')
        setContactNumber('')
        setImageUrl('')
        onSuccess()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'ప్రకటన సృష్టించడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b pb-2">
        <Layout className="w-4 h-4 text-blue-600" />
        కొత్త ప్రకటనను సృష్టించండి (Create Classified)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-xs font-bold text-gray-700">విభాగం (Category) *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50 cursor-pointer font-semibold text-gray-700"
          >
            <option value="JOB">పనివాళ్లు కావాలి (JOB)</option>
            <option value="SALE">అమ్మబడును (SALE)</option>
            <option value="RENT">అద్దెకు ఇవ్వబడును (RENT)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact" className="text-xs font-bold text-gray-700">మొబైల్ నంబర్ (Phone) *</label>
          <div className="relative">
            <input
              id="contact"
              type="tel"
              required
              placeholder="ఉదా: 9876543210"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
            />
            <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-xs font-bold text-gray-700">శీర్షిక (Title) *</label>
        <div className="relative">
          <input
            id="title"
            type="text"
            required
            placeholder="ఉదా: ప్లంబర్ కావాలి లేదా ఇల్లు అద్దెకు..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-3 outline-none focus:border-blue-500 transition bg-gray-50/50"
          />
          <FileText className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-xs font-bold text-gray-700">వివరణ (Description) *</label>
        <textarea
          id="description"
          required
          rows={3}
          placeholder="ప్రకటన గురించిన పూర్తి వివరాలను ఇక్కడ రాయండి..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition resize-none bg-gray-50/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-700">ప్రకటన ఫోటో (Optional Photo)</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-blue-500 cursor-pointer bg-gray-50/30 transition text-xs font-semibold text-gray-600 active:scale-95 select-none">
            <Upload className="w-4 h-4 text-gray-400" />
            ఫోటో ఎంచుకోండి
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {uploading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          {imageUrl && (
            <div className="w-14 h-10 rounded-lg border border-gray-200 overflow-hidden shrink-0 relative bg-gray-100">
              <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-70"
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            సృష్టించబడుతోంది...
          </div>
        ) : (
          'ప్రకటన వేయండి'
        )}
      </button>
    </form>
  )
}
export { ClassifiedForm }
