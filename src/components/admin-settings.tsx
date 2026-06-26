'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldAlert, Loader2, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface AppBranding {
  id?: string
  appName: string
  tagline: string
  whatsappNumber: string
  email: string
  logoUrl: string
}

export default function AdminSettings() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [settings, setSettings] = useState<AppBranding>({
    appName: '',
    tagline: '',
    whatsappNumber: '',
    email: '',
    logoUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const isAuthorized = user?.role === 'admin' || user?.role === 'super_admin'

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !isAuthorized) {
      setLoading(false)
      return
    }

    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('AppBranding')
          .select('*')
          .limit(1)
          .maybeSingle()
        
        if (error) throw error

        if (data) {
          setSettings({
            id: data.id,
            appName: data.appName || '',
            tagline: data.tagline || '',
            whatsappNumber: data.whatsappNumber || '',
            email: data.email || '',
            logoUrl: data.logoUrl || ''
          })
        }
      } catch (error) {
        console.error('Error fetching app settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [isLoading, isAuthenticated, isAuthorized])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
  }

  const handleSave = async () => {
    if (!isAuthorized) return
    setSaving(true)
    setSuccess(false)

    try {
      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('AppBranding')
          .update({
            appName: settings.appName,
            tagline: settings.tagline,
            whatsappNumber: settings.whatsappNumber,
            email: settings.email,
            logoUrl: settings.logoUrl,
          })
          .eq('id', settings.id)
        if (error) throw error
      } else {
        // Insert new if it didn't exist
        const { data, error } = await supabase
          .from('AppBranding')
          .insert({
            appName: settings.appName,
            tagline: settings.tagline,
            whatsappNumber: settings.whatsappNumber,
            email: settings.email,
            logoUrl: settings.logoUrl,
          })
          .select()
          .single()
        
        if (error) throw error
        if (data) setSettings(prev => ({ ...prev, id: data.id }))
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border border-red-100">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-center max-w-sm">
          You do not have the required permissions to view or edit branding settings.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">App Branding & Settings</h2>
        <p className="text-gray-500 mt-1">Manage global application identity, contact details, and visuals.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">App Name</label>
            <input
              type="text"
              name="appName"
              value={settings.appName}
              onChange={handleChange}
              placeholder="e.g. Super App"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tagline</label>
            <input
              type="text"
              name="tagline"
              value={settings.tagline}
              onChange={handleChange}
              placeholder="e.g. Your Hyper-Local Hub"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Phone (WhatsApp)</label>
            <input
              type="text"
              name="whatsappNumber"
              value={settings.whatsappNumber}
              onChange={handleChange}
              placeholder="e.g. +91 9999999999"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="e.g. support@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
            <input
              type="url"
              name="logoUrl"
              value={settings.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {settings.logoUrl && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                <img src={settings.logoUrl} alt="Logo Preview" className="h-12 object-contain" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <div>
            {success && (
              <span className="flex items-center text-sm font-medium text-green-600">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Settings saved successfully
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
