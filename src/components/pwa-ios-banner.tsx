'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Share } from 'lucide-react'
import { usePWAInstall } from './pwa-install-provider'
import { useState } from 'react'

const IOS_DISMISS_KEY = 'pwa-ios-dismissed'

export function PWAIOSBanner() {
  const { isIOS, isInstalled } = usePWAInstall()
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const dismissedAt = localStorage.getItem(IOS_DISMISS_KEY)
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10)
        if (elapsed < 7 * 24 * 60 * 60 * 1000) return false // 7 days
        localStorage.removeItem(IOS_DISMISS_KEY)
      }
    } catch { /* ignore */ }
    return true
  })

  if (!isIOS || isInstalled || !show) return null

  const handleDismiss = () => {
    setShow(false)
    try { localStorage.setItem(IOS_DISMISS_KEY, Date.now().toString()) } catch { /* ignore */ }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 1.5 }}
          className="fixed bottom-0 left-0 right-0 z-[80] p-4 safe-area-bottom"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-lg mx-auto">
            <div className="h-1" style={{ background: 'linear-gradient(to right, #4169E1, #D4AF37)' }} />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4169E1, #D4AF37)' }}
                  >
                    <Share className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Add to Home Screen</h3>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: '#4169E1' }}>1</span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tap the <strong>Share icon</strong>{' '}
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100">
                      <Share className="w-3 h-3 text-[#4169E1]" />
                    </span>{' '}
                    at the bottom of Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: '#D4AF37' }}>2</span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #4169E1, #D4AF37)' }}>3</span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tap <strong>&ldquo;Add&rdquo;</strong> — the app icon will appear on your home screen!
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full mt-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
