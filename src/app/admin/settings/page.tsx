'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Settings, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface SiteSetting {
  id: string
  paymentsEnabled: boolean
  appName: string
}

export default function AdminSettingsPage() {
  const { data: settings, error, mutate } = useSWR<SiteSetting>(
    '/api/admin/settings',
    (url) => fetch(url).then((res) => res.json())
  )

  const [paymentsEnabled, setPaymentsEnabled] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setPaymentsEnabled(settings.paymentsEnabled ?? false)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentsEnabled,
        }),
      })

      if (res.ok) {
        toast.success('సెట్టింగ్స్ విజయవంతంగా సేవ్ చేయబడ్డాయి! ⚙️')
        mutate()
      } else {
        toast.error('సెట్టింగ్స్ సేవ్ చేయడం విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-650 p-4 rounded-xl font-semibold">
        డేటా లోడ్ చేయడంలో విఫలమైంది.
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          అప్లికేషన్ సెట్టింగ్స్ (Admin Settings)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యాప్ చెల్లింపు గేట్‌వే మరియు ఇతర గ్లోబల్ సెట్టింగ్‌లను ఇక్కడ కాన్ఫిగర్ చేయండి.
        </p>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">పేమెంట్ గేట్‌వే ఎనేబుల్ చేయండి (Payment Gateway Toggle)</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-normal">
              ఇది డిసేబుల్ అయితే, యూజర్లు బ్యానర్ అడ్స్ మరియు ప్రీమియం లిస్టింగ్‌లను 100% ఉచితంగా కూపన్లతో లేదా డైరెక్ట్‌గా యాక్టివేట్ చేసుకోవచ్చు.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer mt-1 select-none">
            <input 
              type="checkbox" 
              checked={paymentsEnabled}
              onChange={(e) => setPaymentsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-75"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              సేవ్ చేస్తోంది...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-white" />
              సెట్టింగ్స్ సేవ్ చేయండి
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
export { AdminSettingsPage }
