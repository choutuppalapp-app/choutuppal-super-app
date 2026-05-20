'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

interface PWAInstallContextType {
  installPrompt: BeforeInstallPromptEvent | null
  isInstallable: boolean
  isInstalled: boolean
  isIOS: boolean
  isMobile: boolean
  triggerInstall: () => Promise<boolean>
  dismissInstall: () => void
  showInstallPopup: boolean
  wasDismissed: boolean
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  installPrompt: null,
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  isMobile: false,
  triggerInstall: async () => false,
  dismissInstall: () => {},
  showInstallPopup: false,
  wasDismissed: false,
})

export function usePWAInstall() {
  return useContext(PWAInstallContext)
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function checkWasDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10)
      if (elapsed < DISMISS_DURATION) return true
      localStorage.removeItem(DISMISS_KEY)
    }
  } catch { /* ignore */ }
  return false
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - standalone is iOS-specific
    navigator.standalone === true
  )
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // @ts-expect-error - standalone is iOS-specific
    !navigator.standalone
  )
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
}

export function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(checkIsStandalone)
  const [wasDismissed, setWasDismissed] = useState(checkWasDismissed)
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)

  const isIOS = detectIOS()
  const isMobile = detectMobile()

  // Keep ref in sync
  useEffect(() => {
    promptRef.current = installPrompt
  }, [installPrompt])

  // Listen for display-mode changes (when app gets installed at runtime)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(display-mode: standalone)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setIsInstalled(true) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Capture beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Listen for appinstalled
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => { setIsInstalled(true); setInstallPrompt(null) }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    const prompt = promptRef.current
    if (!prompt) return false
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') { setIsInstalled(true); setInstallPrompt(null); return true }
      return false
    } catch { return false }
  }, [])

  const dismissInstall = useCallback(() => {
    setWasDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()) } catch { /* ignore */ }
  }, [])

  const isInstallable = !!installPrompt && !isInstalled
  const showInstallPopup = isInstallable && !wasDismissed && isMobile

  return (
    <PWAInstallContext.Provider value={{
      installPrompt, isInstallable, isInstalled, isIOS, isMobile,
      triggerInstall, dismissInstall, showInstallPopup, wasDismissed,
    }}>
      {children}
    </PWAInstallContext.Provider>
  )
}
