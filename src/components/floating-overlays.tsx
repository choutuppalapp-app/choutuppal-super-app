'use client'

import { SosButton } from '@/components/sos-button'
import { SpinWheel } from '@/components/spin-wheel'
import { LeadCaptureForm } from '@/components/lead-capture-form'
import { VoiceSearchModal } from '@/components/voice-search-modal'

/**
 * FloatingOverlays — Renders all position:fixed overlay components.
 * These are NOT part of the flex layout — they float above everything.
 * Auth initialization is now handled by AuthProvider in layout.tsx.
 */
export function FloatingOverlays() {
  return (
    <>
      <SosButton />
      <SpinWheel />
      <LeadCaptureForm />
      <VoiceSearchModal />
    </>
  )
}
