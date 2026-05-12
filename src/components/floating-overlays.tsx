'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { SosButton } from '@/components/sos-button'
import { SpinWheel } from '@/components/spin-wheel'
import { LeadCaptureForm } from '@/components/lead-capture-form'
import { VoiceSearchModal } from '@/components/voice-search-modal'

/**
 * FloatingOverlays — Renders all position:fixed overlay components
 * and handles user initialization.
 * These are NOT part of the flex layout — they float above everything.
 */
export function FloatingOverlays() {
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
    <>
      <SosButton />
      <SpinWheel />
      <LeadCaptureForm />
      <VoiceSearchModal />
    </>
  )
}
