'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, Compass, Newspaper, User, Phone, MessageCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'

const NAV_ITEMS: Array<{
  view: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
}> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'explore', label: 'Explore', icon: Compass },
  { view: 'news', label: 'News', icon: Newspaper },
  { view: 'dashboard', label: 'You', icon: User, requiresAuth: true },
]

/**
 * MobileBottomNav — Conditionally renders:
 *   - Normal 4-tab navigation on home/explore/news/dashboard views
 *   - Sticky CTA bar on listing detail view (WhatsApp/Instagram-style)
 */
export function MobileBottomNav() {
  const {
    currentView,
    navigateTo,
    selectedListingSlug,
    setShowLeadForm,
    setLeadFormListingId,
  } = useAppStore()
  const { isAuthenticated, setShowLoginModal } = useAuth()

  const isDetailPage = currentView === 'listing' && !!selectedListingSlug

  const handleNavClick = (view: ViewType, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    navigateTo(view)
  }

  return (
    <AnimatePresence mode="wait">
      {isDetailPage ? (
        <motion.div
          key="sticky-cta"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <StickyCTA />
        </motion.div>
      ) : (
        <motion.div
          key="bottom-nav"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border-t border-gray-100"
        >
          <div className="flex items-center justify-around h-14">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.view
              const Icon = item.icon

              return (
                <motion.button
                  key={item.view}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleNavClick(item.view, item.requiresAuth)}
                  className="flex flex-col items-center justify-center py-1 px-4 min-h-[44px] min-w-[56px] relative"
                >
                  {/* Gold dot indicator — exactly above the active icon */}
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavDot"
                      className="absolute top-0.5 w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
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
          <div className="bg-white" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * StickyCTA — Shown instead of BottomNav on listing detail pages.
 */
function StickyCTA() {
  const { selectedListingSlug, setShowLeadForm, setLeadFormListingId } = useAppStore()

  const handleConnect = () => {
    if (selectedListingSlug) {
      setLeadFormListingId(selectedListingSlug)
      setShowLeadForm(true)
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    'Hi, I found your business on Choutuppal Super App. I want to know more.'
  )}`

  return (
    <div className="bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex gap-3 p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConnect}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white font-semibold text-sm min-h-[48px] active:opacity-90 shadow-sm"
        >
          <Phone className="size-4" />
          Connect via App
        </motion.button>
        <motion.a
          whileTap={{ scale: 0.97 }}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm min-h-[48px] active:opacity-90 shadow-sm"
        >
          <MessageCircle className="size-4" />
          WhatsApp Chat
        </motion.a>
      </div>
      {/* iOS safe area padding with env() */}
      <div className="bg-white" style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }} />
    </div>
  )
}
