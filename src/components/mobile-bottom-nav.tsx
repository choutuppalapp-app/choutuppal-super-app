'use client'

import { motion } from 'framer-motion'
import { Home, Compass, Newspaper, User, Phone, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'

const NAV_ITEMS: Array<{
  view: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'explore', label: 'Explore', icon: Compass },
  { view: 'news', label: 'News', icon: Newspaper },
  { view: 'dashboard', label: 'You', icon: User },
]

/**
 * MobileBottomNav — Conditionally renders:
 *   - Normal 4-tab navigation on home/explore/news/dashboard views
 *   - Sticky CTA bar on listing detail view (WhatsApp-style)
 *
 * This component sits as a flex-none child at the bottom of the AppShell.
 * It is NOT position:fixed — it's a natural flex child that stays at bottom.
 */
export function MobileBottomNav() {
  const {
    currentView,
    navigateTo,
    selectedListingSlug,
    setShowLeadForm,
    setLeadFormListingId,
  } = useAppStore()

  const isDetailPage = currentView === 'listing' && !!selectedListingSlug

  if (isDetailPage) {
    return <StickyCTA />
  }

  return (
    <div className="bg-white border-t border-gray-100">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <motion.button
              key={item.view}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateTo(item.view)}
              className="flex flex-col items-center justify-center py-1 px-4 min-h-[44px] min-w-[56px] relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavDot"
                  className="absolute top-0.5 w-1 h-1 rounded-full bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`size-[22px] transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                }`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
      {/* iOS safe area padding */}
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-white" />
    </div>
  )
}

/**
 * StickyCTA — Shown instead of BottomNav on listing detail pages.
 * Two prominent buttons: Connect via App + WhatsApp Chat.
 * Sits as a natural flex-none child at the bottom of AppShell.
 */
function StickyCTA() {
  const { selectedListingSlug, setShowLeadForm, setLeadFormListingId, addNotification } = useAppStore()

  const handleConnect = () => {
    if (selectedListingSlug) {
      setLeadFormListingId(selectedListingSlug)
      setShowLeadForm(true)
    }
  }

  // We'll derive the WhatsApp link from the listing data that's available
  // For now, use a generic pre-filled message
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    'Hi, I found your business on Choutuppal Super App. I want to know more.'
  )}`

  return (
    <div className="bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex gap-3 p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConnect}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white font-semibold text-sm min-h-[48px] active:opacity-90"
        >
          <Phone className="size-4" />
          Connect via App
        </motion.button>
        <motion.a
          whileTap={{ scale: 0.97 }}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm min-h-[48px] active:opacity-90"
        >
          <MessageCircle className="size-4" />
          WhatsApp Chat
        </motion.a>
      </div>
      {/* iOS safe area padding */}
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-white" />
    </div>
  )
}
