'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, X, Loader2, Check } from 'lucide-react'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { Button } from '@/components/ui/button'

/**
 * PushNotificationPrompt — Bell icon that triggers notification permission request
 *
 * IMPORTANT: This component does NOT request permission on page load.
 * It only requests permission when the user clicks the bell icon.
 *
 * Three states:
 * 1. Not subscribed (default) → Show bell with "Enable" badge
 * 2. Permission granted + subscribed → Show green check bell
 * 3. Permission denied → Show disabled bell
 */
export function PushNotificationPrompt() {
  const {
    isSupported,
    permissionStatus,
    isSubscribed,
    isLoading,
    requestPermissionAndSubscribe,
    error,
  } = usePushNotifications()

  const [showBanner, setShowBanner] = useState(false)

  // Don't render if push is not supported
  if (!isSupported) return null

  // Already subscribed — show a subtle green indicator
  if (isSubscribed && permissionStatus === 'granted') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative active:scale-90 transition-transform"
          title="Push notifications enabled"
        >
          <Bell className="size-5 text-green-600" />
          <Check className="size-3 text-green-600 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
        </Button>
      </div>
    )
  }

  // Permission was denied — show disabled state
  if (permissionStatus === 'denied') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-400 cursor-not-allowed"
          title="Notifications blocked. Enable in browser settings."
          disabled
        >
          <BellOff className="size-5" />
        </Button>
      </div>
    )
  }

  // Default state — show bell with prompt
  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative active:scale-90 transition-transform"
          onClick={() => setShowBanner(true)}
          title="Enable push notifications"
        >
          <Bell className="size-5 text-gray-600" />
          {/* Pulsing dot indicator */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D4AF37] rounded-full animate-pulse" />
        </Button>
      </div>

      {/* Notification Permission Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-3 right-3 sm:left-auto sm:right-4 sm:w-80 z-[100] bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl p-4"
          >
            {/* Close button */}
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                <Bell className="size-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800">
                  Stay Updated!
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Enable notifications to get latest updates, offers, and local news from Choutuppal.
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-500 mt-2 px-1">{error}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={async () => {
                  const success = await requestPermissionAndSubscribe()
                  if (success) {
                    setShowBanner(false)
                  }
                }}
                disabled={isLoading}
                size="sm"
                className="flex-1 text-white font-semibold text-xs min-h-[36px]"
                style={{
                  background: 'linear-gradient(to right, #4169E1, #D4AF37)',
                }}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Allow Notifications'
                )}
              </Button>
              <Button
                onClick={() => setShowBanner(false)}
                variant="outline"
                size="sm"
                className="text-xs min-h-[36px]"
              >
                Not Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
