'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download } from 'lucide-react'
import { usePWA } from '@/contexts/pwa-context'

export function PWAInstallBanner() {
  const { canInstall, triggerInstall } = usePWA()
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (!canInstall) return

    const isDismissed = localStorage.getItem('pwaDismissed')
    if (isDismissed === 'true') return

    // Show after 3 seconds
    const timer = setTimeout(() => {
      setShowBanner(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [canInstall])

  const handleInstallClick = async () => {
    const success = await triggerInstall()
    if (success) {
      setShowBanner(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwaDismissed', 'true')
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pt-2 pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100 pointer-events-auto mx-auto max-w-sm flex items-center justify-between p-3 gap-3 relative">
            
            {/* Minimal App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
              <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover" />
            </div>

            {/* Text Context */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">Install Choutuppal App</h3>
              <p className="text-[11px] text-gray-500 leading-tight">
                For the best experience
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
