'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null
  canInstall: boolean
  isIOS: boolean
  isMobile: boolean
  triggerInstall: () => Promise<boolean>
}

const PWAContext = createContext<PWAContextType>({
  deferredPrompt: null,
  canInstall: false,
  isIOS: false,
  isMobile: false,
  triggerInstall: async () => false,
})

export function usePWA() {
  return useContext(PWAContext)
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as any).standalone)
    setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent))

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registered', reg))
        .catch((err) => console.error('Service Worker registration failed', err))
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setCanInstall(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setCanInstall(false)
        setDeferredPrompt(null)
      }
      return true
    } catch (err) {
      console.error('Install failed', err)
      return false
    }
  }, [deferredPrompt])

  return (
    <PWAContext.Provider value={{ deferredPrompt, canInstall, isIOS, isMobile, triggerInstall }}>
      {children}
    </PWAContext.Provider>
  )
}
