'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Loader2, Check, BellOff } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Button } from '@/components/ui/button'

/**
 * PushNotificationBanner — Subtle banner on home page prompting users to enable notifications
 *
 * Only shows when:
 * - Browser supports push notifications
 * - User hasn't subscribed yet
 * - Permission hasn't been denied
 *
 * Dismissible — once dismissed, stays hidden for the session (stored in sessionStorage)
 */
export function PushNotificationBanner() {
  const {
    isSupported,
    permissionStatus,
    isSubscribed,
    isLoading,
    requestPermissionAndSubscribe,
    error,
  } = usePushNotifications()

  const [dismissed, setDismissed] = useState(false)

  // Don't render if push is not supported, already subscribed, or denied
  if (!isSupported || isSubscribed || permissionStatus === 'denied') return null

  // Check if user already dismissed this session
  if (typeof window !== 'undefined') {
    try {
      if (sessionStorage.getItem('push-banner-dismissed') === 'true') return null
    } catch {
      // sessionStorage not available
    }
  }

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem('push-banner-dismissed', 'true')
    } catch {
      // ignore
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="mx-4 my-2 rounded-xl bg-gradient-to-r from-[#4169E1]/10 via-[#D4AF37]/5 to-[#4169E1]/10 border border-[#4169E1]/20 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
              <Bell className="size-4 text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                Enable Notifications
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                Get latest updates, offers & local news
              </p>
            </div>

            {/* Action */}
            <Button
              onClick={async () => {
                const success = await requestPermissionAndSubscribe()
                if (success) handleDismiss()
              }}
              disabled={isLoading}
              size="sm"
              className="text-white text-xs font-semibold px-3 h-8 flex-shrink-0"
              style={{
                background: 'linear-gradient(to right, #4169E1, #D4AF37)',
              }}
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                'Allow'
              )}
            </Button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-4 pb-2">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
