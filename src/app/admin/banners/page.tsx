'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { Image as ImageIcon, Trash2, Calendar, MousePointer, ExternalLink, Loader2, Plus, Sparkles, Upload, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BannerAd {
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

interface PortraitBanner {
  id: string
  imageUrl: string
  linkUrl: string | null
  expiresAt: string
  createdAt: string
  uploadedBy: string
}

export default function AdminBannersPage() {
  const [activeTab, setActiveTab] = useState<'portrait' | 'landscape'>('portrait')

  // Fetch landscape banners
  const { data: landscapeBanners, error: landscapeError, mutate: mutateLandscape } = useSWR<BannerAd[]>(
    '/api/banners?all=true',
    (url) => fetch(url).then((res) => res.json())
  )

  // Fetch portrait banners
  const { data: portraitBanners, error: portraitError, mutate: mutatePortrait } = useSWR<PortraitBanner[]>(
    '/api/banners/portrait?all=true',
    (url) => fetch(url).then((res) => res.json())
  )

  // Upload Form State (for 16:9 Royal Banners)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [linkUrl, setLinkUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Explicitly validate landscape (16:9) dimensions before uploading to prevent distortion
    const img = window.document.createElement('img')
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const width = img.width
      const height = img.height
      const ratio = width / height

      // Ideal 16:9 ratio is 1.777. Allow margin (1.5 to 2.0)
      if (ratio > 2.0 || ratio < 1.5) {
        toast.error('దయచేసి 16:9 అడ్డ (Landscape) నిష్పత్తి గల చిత్రాన్ని మాత్రమే అప్‌లోడ్ చేయండి. (ఉదా: 1920x1080)')
        return
      }

      setSelectedFile(file)
      setPreviewUrl(img.src)
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('దయచేసి ఒక ఇమేజ్ ఫైల్‌ను ఎంచుకోండి.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('folder', 'banners')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await uploadRes.json()

      // Save to portrait/landscape banners database table
      const saveRes = await fetch('/api/banners/portrait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: url,
          linkUrl,
          uploadedBy: 'Admin',
        }),
      })

      if (saveRes.ok) {
        toast.success('ప్రీమియం రాయల్ బ్యానర్ విజయవంతంగా అప్‌లోడ్ చేయబడింది!')
        setSelectedFile(null)
        setPreviewUrl('')
        setLinkUrl('')
        mutatePortrait()
      } else {
        toast.error('డేటాబేస్ లో సేవ్ చేయడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('అప్‌లోడ్ సమయంలో లోపం సంభవించింది.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteLandscape = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner ad?')) return

    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('బ్యానర్ విజయవంతంగా తొలగించబడింది.')
        mutateLandscape()
      } else {
        toast.error('తొలగించడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    }
  }

  const handleDeletePortrait = async (id: string) => {
    if (!confirm('Are you sure you want to delete this premium banner?')) return

    try {
      const res = await fetch(`/api/banners/portrait?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('ప్రీమియం బ్యానర్ విజయవంతంగా తొలగించబడింది.')
        mutatePortrait()
      } else {
        toast.error('తొలగించడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-blue-600" />
          బ్యానర్ ప్రకటనల నిర్వహణ (Banner Ads)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యాప్‌లో ప్రదర్శించబడే అన్ని రకాల బ్యానర్ ప్రకటనల మోడరేషన్ మరియు అప్‌లోడ్స్ ఇక్కడ చేయవచ్చు.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('portrait')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'portrait'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          రాయల్ బ్యానర్లు (16:9 Landscape) [Premium]
        </button>
        <button
          onClick={() => setActiveTab('landscape')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'landscape'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          అడ్డ బ్యానర్లు (16:9 Landscape - Legacy)
        </button>
      </div>

      {activeTab === 'portrait' ? (
        // PREMIUM ROYAL 16:9 BANNERS TAB
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-blue-600" />
              రాయల్ బ్యానర్ అప్‌లోడ్
            </h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">ప్రకటన ఇమేజ్ (16:9 Landscape)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 relative min-h-[180px]">
                  {previewUrl ? (
                    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl('')
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-650 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none w-full h-full">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 font-bold">ఇమేజ్ ఎంచుకోండి</span>
                      <span className="text-[10px] text-gray-400 mt-1">16:9 నిష్పత్తి మాత్రమే (ఉదా: 1920x1080)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">టర్గెట్ వెబ్ లింక్ (Target URL - Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 rounded-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 text-xs shadow-md"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    అప్‌లోడ్ అవుతోంది...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    అప్‌లోడ్ చేయండి
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of active premium banners */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-1 bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 text-xs leading-normal">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                రాయల్ ప్రీమియం బ్యానర్లు అప్‌లోడ్ చేసిన సమయం నుండి <strong>ఖచ్చితంగా 24 గంటలు</strong> మాత్రమే యాప్‌లో కనిపిస్తాయి. ఆ తర్వాత స్వయంచాలకంగా అదృశ్యమవుతాయి.
              </span>
            </div>

            {!portraitBanners ? (
              <div className="flex items-center justify-center p-12 bg-white border border-gray-150 rounded-2xl shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : portraitBanners.length === 0 ? (
              <div className="p-12 text-center text-gray-500 bg-white border border-gray-150 rounded-2xl shadow-sm">
                ఎటువంటి రాయల్ బ్యానర్లు అప్‌లోడ్ చేయబడలేదు. Fallback ప్రకటనలు ప్రదర్శించబడుతున్నాయి.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {portraitBanners.map((banner) => {
                  const isExpired = new Date(banner.expiresAt) < new Date()
                  return (
                    <div
                      key={banner.id}
                      className="bg-white border border-gray-150 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 hover:shadow-md transition relative overflow-hidden"
                    >
                      {isExpired && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-red-200 z-10">
                          Expired
                        </div>
                      )}
                      <div className="w-full sm:w-40 aspect-[16/9] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative shrink-0">
                        <img src={banner.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-1">
                        <div className="space-y-1">
                          <span className="inline-block text-[9px] bg-slate-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                            Uploaded by {banner.uploadedBy}
                          </span>
                          {banner.linkUrl ? (
                            <a
                              href={banner.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold break-all"
                            >
                              లింక్ చూడండి
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">లింక్ లేదు</span>
                          )}
                        </div>

                        <div className="space-y-2 mt-4 sm:mt-0">
                          <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>Expiry: {new Date(banner.expiresAt).toLocaleString()}</span>
                          </div>

                          <button
                            onClick={() => handleDeletePortrait(banner.id)}
                            className="w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-1 rounded-xl border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            తొలగించండి
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        // LANDSCAPE LEGACY BANNERS TAB
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          {!landscapeBanners ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : landscapeBanners.length === 0 ? (
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
                  {landscapeBanners.map((banner) => (
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
                          onClick={() => handleDeleteLandscape(banner.id)}
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
      )}
    </div>
  )
}
