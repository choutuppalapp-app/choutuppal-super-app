'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from './pwa-install-provider'

export function PWAAutoInstallPopup() {
  const { deferredPrompt, isInstalled, clearPrompt } = usePWAInstall()
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (isInstalled) return
    if (!deferredPrompt) return

    const isDismissed = localStorage.getItem('pwaPromptDismissed')
    if (isDismissed === 'true') return

    // Show after 5 seconds if deferredPrompt is captured
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [deferredPrompt, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPopup(false)
        clearPrompt()
      }
    } catch (err) {
      console.error('Failed to trigger prompt', err)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true')
    setShowPopup(false)
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-6 pt-4 pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border border-gray-100 pointer-events-auto mx-auto max-w-sm flex flex-col">
            {/* Header / Banner */}
            <div className="h-16 bg-gradient-to-r from-[#4169E1] to-[#D4AF37] relative flex items-center px-4">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-black/10 text-white/90 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 pb-6 pt-2 text-center -mt-8 relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-md p-1 mb-3">
                <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                  <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Install Choutuppal App</h3>
              <p className="text-sm text-gray-500 mt-1 mb-5">
                Install our app for faster access, offline mode, and the best experience.
              </p>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-xl text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
