'use client'

import { useState, useEffect } from 'react'
import { getAdminNews, deleteAdminNews, createAdminNews } from '@/app/actions/admin-actions'
import { Loader2, Trash2, Megaphone, Newspaper, Plus, X, Upload } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function AdminNews() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  // News Form State
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [source, setSource] = useState('')

  // Ticker State
  const [ticker, setTicker] = useState('')
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [savingTicker, setSavingTicker] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 border rounded-xl bg-white'
      }
    }
  })

  useEffect(() => {
    fetchData()
    fetchSettings()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await getAdminNews()
      setNews(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSettings() {
    try {
      const { data, error } = await supabase.from('SiteSetting').select('id, announcementTicker').limit(1).maybeSingle()
      if (data) {
        setSettingsId(data.id)
        setTicker(data.announcementTicker || '')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateTicker = async () => {
    if (!settingsId) return
    setSavingTicker(true)
    try {
      const { error } = await supabase.from('SiteSetting').update({ announcementTicker: ticker }).eq('id', settingsId)
      if (error) throw error
      toast({ title: 'Success', description: 'Ticker updated successfully' })
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update ticker', variant: 'destructive' })
    } finally {
      setSavingTicker(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    try {
      await deleteAdminNews(id)
      fetchData()
    } catch (e) {
      alert('Error deleting news')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      
      const { error } = await supabase.storage.from('news').upload(fileName, compressedFile)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('news').getPublicUrl(fileName)
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
    setUploading(true)
    try {
      await createAdminNews({
        title,
        content: editor?.getHTML() || '',
        imageUrl,
        source,
        cityId: 'default-city-id',
        authorId: user?.id || null,
        isPublished: true
      })
      setIsCreating(false)
      fetchData()
      setTitle(''); setImageUrl(''); setSource(''); editor?.commands.setContent('')
    } catch (error) {
      console.error(error)
      alert('Failed to publish news')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Ticker Management */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-900 mb-1">Global Announcement Ticker</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={ticker} 
                onChange={e => setTicker(e.target.value)} 
                placeholder="e.g. Breaking: Mega Job Mela this Sunday at SV Degree College!" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleUpdateTicker} 
                disabled={savingTicker}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {savingTicker ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* News Management */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Newspaper className="w-5 h-5 text-gray-700"/> Local News Articles</h2>
          <button onClick={() => setIsCreating(!isCreating)} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800">
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isCreating ? 'Cancel' : 'Publish News'}
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Headline / Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Source (e.g. Eenadu, Namasthe Telangana)</label><input value={source} onChange={e => setSource(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <label className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative">
                  {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-6 h-6 text-gray-400 mx-auto mb-1"/><span className="text-xs text-gray-500">Upload Image</span></div>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article Content (Rich Text)</label>
              {/* Tiptap Menu Bar (Basic) */}
              <div className="flex gap-2 mb-2 p-2 bg-gray-50 rounded-lg border">
                <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>Bold</button>
                <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>Italic</button>
                <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>H2</button>
                <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-sm rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}>List</button>
              </div>
              <EditorContent editor={editor} />
            </div>

            <button disabled={uploading} className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-black disabled:opacity-50 flex justify-center items-center gap-2">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Article'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n: any) => (
              <div key={n.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {n.imageUrl && <div className="aspect-video bg-gray-100"><img src={n.imageUrl} className="w-full h-full object-cover" /></div>}
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-bold text-gray-900 line-clamp-2">{n.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 mb-4 flex-grow">{new Date(n.createdAt).toLocaleDateString()} • {n.source}</p>
                  <button onClick={() => handleDelete(n.id)} className="w-full flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition">
                    <Trash2 className="w-4 h-4" /> Delete Article
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
