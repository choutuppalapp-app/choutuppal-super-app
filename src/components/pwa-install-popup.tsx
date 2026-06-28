'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { usePWAInstall } from './pwa-install-provider'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPopup() {
  const { showInstallPopup: providerShow, dismissInstall } = usePWAInstall()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [localShow, setLocalShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  
  const showPopup = localShow || providerShow
  
  useEffect(() => {
    // Detect iOS
    const ua = navigator.userAgent
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    setIsIOS(isIosDevice)

    // Detect if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true)
    
    if (isStandalone) {
      return
    }

    if (isIosDevice) {
      const timer = setTimeout(() => setLocalShow(true), 1500)
      return () => clearTimeout(timer)
    } else {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setLocalShow(true)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setLocalShow(false)
        dismissInstall()
        setDeferredPrompt(null)
      }
    } catch (err) {
      console.error('Failed to trigger prompt', err)
    }
  }

  const handleClose = () => {
    setLocalShow(false)
    dismissInstall()
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pt-2 sm:px-6 sm:pb-6 pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 p-4 flex items-center justify-between gap-4 pointer-events-auto mx-auto max-w-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">Choutuppal App</h3>
                <p className="text-xs text-gray-500 truncate">
                  Install for quick access
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {isIOS ? (
                <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-medium border border-gray-200">
                  <span>To install: Tap Share <span className="text-lg leading-none">⎋</span></span>
                  <span>Select Add to Home Screen</span>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
