'use client'

import { useState } from 'react'
import { BellRing, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !body.trim()) {
      toast.error('Title and Body are required!')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || '/',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`నోటిఫికేషన్ విజయవంతంగా పంపబడింది! (${data.sentCount} యూజర్లకు చేరింది)`)
        setTitle('')
        setBody('')
        setUrl('')
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'నోటిఫికేషన్ పంపడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BellRing className="w-6 h-6 text-blue-600" />
          పుష్ నోటిఫికేషన్లు పంపండి (Send Notifications)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          సబ్‌స్క్రైబ్ చేసుకున్న యూజర్లందరికీ ఒకేసారి బ్రాడ్‌కాస్ట్ నోటిఫికేషన్‌లను ఇక్కడ నుండి పంపవచ్చు.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-xs font-bold text-gray-700">శీర్షిక (Title) *</label>
          <input
            id="title"
            type="text"
            required
            placeholder="ఉదా: నేటి తాజా వార్తలు..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="body" className="text-xs font-bold text-gray-700">సмаచారం (Body Message) *</label>
          <textarea
            id="body"
            required
            rows={4}
            placeholder="నోటిఫికేషన్ సందేశాన్ని ఇక్కడ టైప్ చేయండి..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="url" className="text-xs font-bold text-gray-700">లింక్ / మార్గం (Target URL)</label>
          <input
            id="url"
            type="text"
            placeholder="ఉదా: /explore లేదా /news"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-75"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              పంపుతోంది...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              నోటిఫికేషన్ పంపండి
            </>
          )}
        </button>
      </form>
    </div>
  )
}
