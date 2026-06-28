'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

interface PWAInstallContextType {
  isInstallable: boolean
  isInstalled: boolean
  isIOS: boolean
  isMobile: boolean
  triggerInstall: () => Promise<boolean>
  dismissInstall: () => void
  showInstallPopup: boolean
  wasDismissed: boolean
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  isInstallable: true,
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

function checkWasDismissed(): boolean {
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
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstallPopup, setShowInstallPopup] = useState(false)

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
    const handler = () => { setIsInstalled(true); setShowInstallPopup(false) }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    setShowInstallPopup(true)
    return true
  }, [])

  const dismissInstall = useCallback(() => {
    setShowInstallPopup(false)
  }, [])

  const isInstallable = !isInstalled

  return (
    <PWAInstallContext.Provider value={{
      isInstallable, isInstalled, isIOS, isMobile,
      triggerInstall, dismissInstall, showInstallPopup, wasDismissed: false,
    }}>
      {children}
    </PWAInstallContext.Provider>
  )
}
