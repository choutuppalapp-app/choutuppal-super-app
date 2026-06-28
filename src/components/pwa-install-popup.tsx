'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWAInstall } from './pwa-install-provider'

export function PWAInstallPopup() {
  const { showInstallPopup, isInstallable, triggerInstall, dismissInstall, isIOS } = usePWAInstall()

  if (!showInstallPopup) return null

  return (
    <AnimatePresence>
      {showInstallPopup && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[9999]"
        >
          <div className="bg-blue-600 text-white shadow-2xl overflow-hidden px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">Install App for Best Experience</h3>
                <p className="text-xs text-blue-100 truncate">
                  Fast access, offline mode & notifications
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {isIOS ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-[10px] font-bold">
                  Tap Share <span className="text-xl">⎋</span> and Add to Home Screen
                </div>
              ) : (
                <div className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-[10px] font-bold">
                  <span>Tap browser menu (⋮)</span>
                  <span>Select 'Add to Home screen'</span>
                </div>
              )}
              <button
                onClick={dismissInstall}
                className="p-1.5 rounded-full hover:bg-blue-700 text-blue-200 hover:text-white transition-colors"
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
