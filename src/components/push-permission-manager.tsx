'use client'

import { useState, useEffect } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushPermissionManager() {
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false)
      return
    }

    // Check existing subscription
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription)
      })
    })
  }, [])

  const subscribeUser = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!publicVapidKey) {
        throw new Error('VAPID public key is missing')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      })

      // Send to backend
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })

      if (!res.ok) throw new Error('Failed to save subscription to server')

      setIsSubscribed(true)
      toast({ title: 'Success', description: 'Successfully subscribed to notifications!' })
    } catch (error: any) {
      console.error('Error subscribing:', error)
      toast({ title: 'Error', description: 'Failed to enable push notifications.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 text-gray-500 rounded-xl text-sm border border-gray-100 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Push notifications are not supported in this browser.
      </div>
    )
  }

  if (isSubscribed) {
    return (
      <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100 flex items-center gap-2">
        <Bell className="w-4 h-4 text-blue-500" />
        You are subscribed to push notifications.
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          Push Notifications
        </h4>
        <p className="text-sm text-gray-500 mt-1">Get instant alerts for news and updates.</p>
      </div>
      <button 
        onClick={subscribeUser}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable'}
      </button>
    </div>
  )
}
