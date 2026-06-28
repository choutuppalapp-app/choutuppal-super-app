'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstallable: boolean
  isInstalled: boolean
  isIOS: boolean
  isMobile: boolean
  clearPrompt: () => void
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  deferredPrompt: null,
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  isMobile: false,
  clearPrompt: () => {},
})

export function usePWAInstall() {
  return useContext(PWAInstallContext)
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(checkIsStandalone())
  }, [])

  const isIOS = detectIOS()
  const isMobile = detectMobile()

  // Listen for display-mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(display-mode: standalone)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setIsInstalled(true) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Listen for appinstalled
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = () => { setIsInstalled(true); setDeferredPrompt(null) }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  // Capture beforeinstallprompt globally
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const clearPrompt = useCallback(() => {
    setDeferredPrompt(null)
  }, [])

  const isInstallable = !!deferredPrompt && !isInstalled

  return (
    <PWAInstallContext.Provider value={{
      deferredPrompt, isInstallable, isInstalled, isIOS, isMobile, clearPrompt
    }}>
      {children}
    </PWAInstallContext.Provider>
  )
}
