'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { 
  Building2, 
  Briefcase, 
  Newspaper, 
  Store, 
  UserPlus, 
  Loader2, 
  Plus, 
  Trash2,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

const TABS = [
  { id: 'listings', label: 'షాపూలు (Shops)', icon: Store },
  { id: 'realestate', label: 'రియల్ ఎస్టేట్ (Properties)', icon: Building2 },
  { id: 'jobs', label: 'ఉద్యోగాలు (Jobs)', icon: Briefcase },
  { id: 'news', label: 'వార్తలు (News)', icon: Newspaper },
  { id: 'users', label: 'యూజర్స్ (Users)', icon: UserPlus },
]

export default function AgentDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('listings')

  const isAgentOrAdmin = 
    user?.role === 'agent' || 
    user?.role === 'admin' || 
    user?.role === 'super_admin' || 
    user?.role === 'city_admin' || 
    (user?.email && user.email.toLowerCase() === 'mailmosin@gmail.com')

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAgentOrAdmin)) {
      toast.error('ఈ పేజీ కేవలం ఏజెంట్లు లేదా అడ్మిన్లకు మాత్రమే.')
      router.push('/')
    }
  }, [isAuthenticated, isLoading, user, isAgentOrAdmin, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user || !isAgentOrAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
        <Lock className="w-12 h-12 text-red-500 mb-2" />
        <h1 className="text-lg font-black">యాక్సెస్ లేదు</h1>
        <p className="text-xs text-gray-500 mt-1">ఏజెంట్ లాగిన్ మాత్రమే అనుమతించబడును.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-extrabold text-base text-gray-900">ఏజెంట్ డ్యాష్‌బోర్డ్ (Agent Portal)</h1>
          <p className="text-[10px] text-gray-400">Fresh registrations, listings, and posts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            Agent: {user.fullName}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-yellow-500 text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-600 border-gray-150 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === 'listings' && <AgentListingsPanel currentUserId={user.id} />}
          {activeTab === 'realestate' && <AgentRealEstatePanel currentUserId={user.id} />}
          {activeTab === 'jobs' && <AgentJobsPanel currentUserId={user.id} />}
          {activeTab === 'news' && <AgentNewsPanel currentUserId={user.id} />}
          {activeTab === 'users' && <AgentUsersPanel />}
        </div>
      </main>
    </div>
  )
}

function AgentListingsPanel({ currentUserId }: { currentUserId: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Medicals')
  const [phone, setPhone] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data: list, mutate } = useSWR('/api/listings', (url) => fetch(url).then(res => res.json()))

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'listings')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        setImageUrl(d.url)
        toast.success('ఫోటో అప్‌లోడ్ విజయవంతమైంది!')
      }
    } catch {
      toast.error('అప్‌లోడ్ విఫలమైంది.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, phone, logoUrl: imageUrl }),
      })
      if (res.ok) {
        toast.success('షాప్ విజయవంతంగా జోడించబడింది!')
        setName('')
        setDescription('')
        setPhone('')
        setImageUrl('')
        mutate()
      }
    } catch {
      toast.error('సృష్టించడం విఫలమైంది.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, userId: string) => {
    if (userId !== currentUserId) {
      toast.error('ఇతరుల షాపులను డిలీట్ చేసే హక్కు మీకు లేదు.')
      return
    }
    if (!confirm('డిలీట్ చేయాలనుకుంటున్నారా?')) return
    try {
      const res = await fetch(`/api/listings?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('డిలీట్ చేయబడింది.')
        mutate()
      }
    } catch {
      toast.error('డిలీట్ చేయడం విఫలమైంది.')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-600" />
          కొత్త షాపును జోడించండి (Add Shop Listing)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">షాప్ పేరు (Shop Name) *</label>
            <input required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">ఫోన్ నంబర్ (Phone) *</label>
            <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">విభాగం (Category) *</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50">
              <option value="Tiffin">Tiffin</option>
              <option value="Medicals">Medicals</option>
              <option value="Salons">Salons</option>
              <option value="Plumbers">Plumbers</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">షాప్ ఫోటో (Logo/Photo)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="w-full text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">వివరణ (Description) *</label>
          <textarea required rows={2} value={description} onChange={e=>setDescription(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <button type="submit" disabled={submitting || uploading} className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 rounded-xl text-xs">
          {submitting ? 'జోడించబడుతోంది...' : 'షాప్ ని సృష్టించండి'}
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">షాపుల జాబితా (Listings)</h3>
        <div className="space-y-3">
          {list && Array.isArray(list) && list.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-3 text-xs">
              <div>
                <p className="font-extrabold text-gray-900">{item.name}</p>
                <p className="text-[10px] text-gray-400">{item.category} • {item.phone}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id, item.userId)}
                className={`p-2 rounded-lg border transition ${
                  item.userId === currentUserId 
                    ? 'border-red-200 text-red-600 hover:bg-red-50' 
                    : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={item.userId === currentUserId ? 'Delete' : 'Cannot delete others\' data'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentRealEstatePanel({ currentUserId }: { currentUserId: string }) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [address, setAddress] = useState('')
  const [bedroomCount, setBedroomCount] = useState(2)
  const [area, setArea] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data: list, mutate } = useSWR('/api/realestate', (url) => fetch(url).then(res => res.json()))

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'listings')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        setImageUrl(d.url)
        toast.success('ఫోటో అప్‌లోడ్ విజయవంతమైంది!')
      }
    } catch {
      toast.error('అప్‌లోడ్ విఫలమైంది.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const citiesRes = await fetch('/api/cities')
      const cities = await citiesRes.json()
      const cityId = cities[0]?.id || ''

      const res = await fetch('/api/realestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price,
          address,
          bedroomCount: Number(bedroomCount),
          area,
          ownerPhone,
          images: imageUrl ? JSON.stringify([imageUrl]) : null,
          cityId,
        }),
      })
      if (res.ok) {
        toast.success('ఆస్తి విజయవంతంగా జోడించబడింది!')
        setTitle('')
        setPrice('')
        setAddress('')
        setArea('')
        setOwnerPhone('')
        setImageUrl('')
        mutate()
      }
    } catch {
      toast.error('సృష్టించడం విఫలమైంది.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, userId: string) => {
    if (userId !== currentUserId) {
      toast.error('ఇతరుల ప్రకటనలను డిలీట్ చేసే హక్కు మీకు లేదు.')
      return
    }
    if (!confirm('డిలీట్ చేయాలనుకుంటున్నారా?')) return
    try {
      const res = await fetch(`/api/realestate?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('డిలీట్ చేయబడింది.')
        mutate()
      }
    } catch {
      toast.error('డిలీట్ చేయడం విఫలమైంది.')
    }
  }

  const realestateListings = list && Array.isArray(list) ? list : (list?.listings || [])

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-600" />
          కొత్త ఆస్తిని జోడించండి (Add Property)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">ఆస్తి పేరు (Title) *</label>
            <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">ధర (Price) *</label>
            <input required type="text" placeholder="ఉదా: ₹45 లక్షలు" value={price} onChange={e=>setPrice(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">యజమాని నంబర్ (Owner Phone) *</label>
            <input required type="tel" value={ownerPhone} onChange={e=>setOwnerPhone(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">బెడ్‌రూమ్స్ (BHK)</label>
            <input type="number" value={bedroomCount} onChange={e=>setBedroomCount(Number(e.target.value))} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">స్థలం కొలతలు (Area) *</label>
            <input required type="text" placeholder="ఉదా: 1200 Sq Ft" value={area} onChange={e=>setArea(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">ఆస్తి ఫోటో (Property Image)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="w-full text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">చిరునామా (Address) *</label>
          <input required type="text" value={address} onChange={e=>setAddress(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <button type="submit" disabled={submitting || uploading} className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 rounded-xl text-xs">
          {submitting ? 'జోడించబడుతోంది...' : 'ఆస్తి ప్రకటన సృష్టించండి'}
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">రియల్ ఎస్టేట్ జాబితా (Real Estate List)</h3>
        <div className="space-y-3">
          {realestateListings.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-3 text-xs">
              <div>
                <p className="font-extrabold text-gray-900">{item.title}</p>
                <p className="text-[10px] text-gray-400">{item.price} • {item.area} • {item.ownerPhone}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id, item.userId)}
                className={`p-2 rounded-lg border transition ${
                  item.userId === currentUserId 
                    ? 'border-red-200 text-red-600 hover:bg-red-50' 
                    : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={item.userId === currentUserId ? 'Delete' : 'Cannot delete others\' data'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentJobsPanel({ currentUserId }: { currentUserId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data: list, mutate } = useSWR('/api/classifieds?category=JOB', (url) => fetch(url).then(res => res.json()))

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'content')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        setImageUrl(d.url)
        toast.success('ఫోటో అప్‌లోడ్ విజయవంతమైంది!')
      }
    } catch {
      toast.error('అప్‌లోడ్ విఫలమైంది.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category: 'JOB', contactNumber, imageUrl: imageUrl || null }),
      })
      if (res.ok) {
        toast.success('జాబ్ విజయవంతంగా జోడించబడింది!')
        setTitle('')
        setDescription('')
        setContactNumber('')
        setImageUrl('')
        mutate()
      }
    } catch {
      toast.error('సృష్టించడం విఫలమైంది.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, userId: string) => {
    if (userId !== currentUserId) {
      toast.error('ఇతరుల ప్రకటనలను డిలీట్ చేసే హక్కు మీకు లేదు.')
      return
    }
    if (!confirm('డిలీట్ చేయాలనుకుంటున్నారా?')) return
    try {
      const res = await fetch(`/api/classifieds?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('డిలీట్ చేయబడింది.')
        mutate()
      }
    } catch {
      toast.error('డిలీట్ చేయడం విఫలమైంది.')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-600" />
          కొత్త జాబ్ ని సృష్టించండి (Create Job Post)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">జాబ్ శీర్షిక (Job Title) *</label>
            <input required type="text" placeholder="ఉదా: ప్లంబర్ కావాలి" value={title} onChange={e=>setTitle(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">మొబైల్ నంబర్ (Phone) *</label>
            <input required type="tel" value={contactNumber} onChange={e=>setContactNumber(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-gray-700">జాబ్ ఫోటో (Optional Image)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="w-full text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">జాబ్ వివరణ (Description) *</label>
          <textarea required rows={2} value={description} onChange={e=>setDescription(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <button type="submit" disabled={submitting || uploading} className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 rounded-xl text-xs">
          {submitting ? 'సృష్టించబడుతోంది...' : 'జాబ్ పోస్ట్ సృష్టించండి'}
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">జాబ్స్ జాబితా (Jobs List)</h3>
        <div className="space-y-3">
          {list && Array.isArray(list) && list.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-3 text-xs">
              <div>
                <p className="font-extrabold text-gray-900">{item.title}</p>
                <p className="text-[10px] text-gray-400">{item.contactNumber} • {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id, item.userId)}
                className={`p-2 rounded-lg border transition ${
                  item.userId === currentUserId 
                    ? 'border-red-200 text-red-600 hover:bg-red-50' 
                    : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={item.userId === currentUserId ? 'Delete' : 'Cannot delete others\' data'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentNewsPanel({ currentUserId }: { currentUserId: string }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { data: list, mutate } = useSWR('/api/news', (url) => fetch(url).then(res => res.json()))

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'content')
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const d = await res.json()
        setImageUrl(d.url)
        toast.success('ఫోటో అప్‌లోడ్ విజయవంతమైంది!')
      }
    } catch {
      toast.error('అప్‌లోడ్ విఫలమైంది.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug: slug.trim(), content, imageUrl }),
      })
      if (res.ok) {
        toast.success('వార్త విజయవంతంగా జోడించబడింది!')
        setTitle('')
        setSlug('')
        setContent('')
        setImageUrl('')
        mutate()
      }
    } catch {
      toast.error('సృష్టించడం విఫలమైంది.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, userId: string) => {
    if (userId !== currentUserId) {
      toast.error('ఇతరుల వార్తలను డిలీట్ చేసే హక్కు మీకు లేదు.')
      return
    }
    if (!confirm('డిలీట్ చేయాలనుకుంటున్నారా?')) return
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('డిలీట్ చేయబడింది.')
        mutate()
      }
    } catch {
      toast.error('డిలీట్ చేయడం విఫలమైంది.')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-blue-600" />
          కొత్త వార్తను జోడించండి (Create News/Blog)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">వార్త శీర్షిక (Title) *</label>
            <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">స్లగ్ (Slug) *</label>
            <input required type="text" placeholder="ఉదా: news-slug-here" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-gray-700">కవర్ ఫోటో (Cover Photo URL)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="w-full text-xs" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">వార్త సమాచారం (Content HTML) *</label>
          <textarea required rows={4} value={content} onChange={e=>setContent(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <button type="submit" disabled={submitting || uploading} className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 rounded-xl text-xs">
          {submitting ? 'సృష్టించబడుతోంది...' : 'వార్తను సృష్టించండి'}
        </button>
      </form>

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">వార్తల జాబితా (News List)</h3>
        <div className="space-y-3">
          {list && Array.isArray(list) && list.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between border-b pb-3 text-xs">
              <div>
                <p className="font-extrabold text-gray-900">{item.title}</p>
                <p className="text-[10px] text-gray-400">{item.slug} • {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => handleDelete(item.id, item.userId)}
                className={`p-2 rounded-lg border transition ${
                  item.userId === currentUserId 
                    ? 'border-red-200 text-red-600 hover:bg-red-50' 
                    : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={item.userId === currentUserId ? 'Delete' : 'Cannot delete others\' data'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentUsersPanel() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, email, password }),
      })
      if (res.ok) {
        toast.success('యూజర్ విజయవంతంగా రిజిస్టర్ చేయబడ్డారు! 🎉')
        setFullName('')
        setPhone('')
        setEmail('')
        setPassword('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'రిజిస్టర్ చేయడం విఫలమైంది.')
      }
    } catch {
      toast.error('సాంకేతిక లోపం.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
        <Plus className="w-4 h-4 text-blue-600" />
        కొత్త యూజర్‌ను నమోదు చేయండి (Register New User)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">పూర్తి పేరు (Full Name) *</label>
          <input required type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">మొబైల్ నంబర్ (Phone) *</label>
          <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">ఈమెయిల్ (Email) *</label>
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">పాస్‌వర్డ్ (Password) *</label>
          <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full text-xs border rounded-xl px-4 py-2.5 outline-none bg-gray-50/50" />
        </div>
      </div>
      <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 rounded-xl text-xs">
        {submitting ? 'రిజిస్టర్ చేయబడుతోంది...' : 'యూజర్ ని సృష్టించండి'}
      </button>
    </form>
  )
}
