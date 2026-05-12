'use client'

import { useEffect, type ReactNode } from 'react'
import { useAppStore } from '@/lib/store'
import { Header } from '@/components/header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { SosButton } from '@/components/sos-button'
import { SpinWheel } from '@/components/spin-wheel'
import { LeadCaptureForm } from '@/components/lead-capture-form'
import { VoiceSearchModal } from '@/components/voice-search-modal'

/**
 * AppShell — The root layout shell for the entire app.
 *
 * Architecture:
 *   ┌──────────────────────────────┐
 *   │  Header (flex-none, sticky)  │  ← Always visible, never scrolls
 *   ├──────────────────────────────┤
 *   │                              │
 *   │  main (flex-1, overflow-y)   │  ← ONLY this area scrolls
 *   │                              │
 *   ├──────────────────────────────┤
 *   │  MobileBottomNav (flex-none) │  ← Nav OR Sticky CTA, never scrolls
 *   └──────────────────────────────┘
 *
 * Uses h-[100dvh] for dynamic viewport height (handles mobile browser chrome).
 */

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUser, setCurrentUser } = useAppStore()

  useEffect(() => {
    if (!currentUser) {
      setCurrentUser({
        id: 'demo-user-1',
        fullName: 'Guest User',
        role: 'user',
        coinsBalance: 50,
        subscriptionTier: 'free',
      })
    }
  }, [currentUser, setCurrentUser])

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 overscroll-none">
      {/* Header — flex-none, pinned to top */}
      <div className="flex-none">
        <Header />
      </div>

      {/* Main scrollable area — flex-1, only region that scrolls */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {children}
      </main>

      {/* Mobile Bottom Nav OR Sticky CTA — flex-none, pinned to bottom */}
      <div className="flex-none md:hidden">
        <MobileBottomNav />
      </div>

      {/* Floating overlays (not part of flex layout) */}
      <SosButton />
      <SpinWheel />
      <LeadCaptureForm />
      <VoiceSearchModal />
    </div>
  )
}
