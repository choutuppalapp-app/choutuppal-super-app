'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWAInstall } from './pwa-install-provider'

export function PWAInstallPopup() {
  const { showInstallPopup, isInstallable, triggerInstall, dismissInstall } = usePWAInstall()

  if (!showInstallPopup || !isInstallable) return null

  return (
    <AnimatePresence>
      {showInstallPopup && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[80] p-4 safe-area-bottom"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-lg mx-auto">
            {/* Gradient accent bar */}
            <div className="h-1" style={{ background: 'linear-gradient(to right, #4169E1, #D4AF37)' }} />
            <div className="p-4 flex items-start gap-4">
              {/* App icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ background: 'linear-gradient(135deg, #4169E1, #D4AF37)' }}
              >
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900">Install Choutuppal App</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Add to your home screen for quick access and a better experience — works offline too!
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={triggerInstall}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-sm active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(to right, #4169E1, #D4AF37)' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Install
                  </button>
                  <button
                    onClick={dismissInstall}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={dismissInstall}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
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
