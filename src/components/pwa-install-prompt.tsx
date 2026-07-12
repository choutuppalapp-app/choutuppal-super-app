'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone } from 'lucide-react'

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    if (isStandalone) return

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('pwaBannerDismissed') === 'true'
    if (dismissed) return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowBanner(false)
      }
    } catch (err) {
      console.error('PWA prompt failed:', err)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem('pwaBannerDismissed', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 z-[9999] max-w-md mx-auto bg-white rounded-2xl border border-gray-150 p-4 shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-800 leading-normal">
            చౌటుప్పల్ సూపర్ యాప్ను ఇన్స్టాల్ చేసుకోండి. వేగవంతమైన అనుభవం కోసం హోమ్ స్క్రీన్కి యాడ్ చేసుకోండి!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:opacity-95 active:scale-95 transition-all shadow-sm whitespace-nowrap"
        >
          ఇన్స్టాల్ చేయండి
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
export default PwaInstallPrompt
