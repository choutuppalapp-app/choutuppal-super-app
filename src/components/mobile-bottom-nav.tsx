'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, UserCircle, Phone, MessageCircle, Zap, GraduationCap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'

/**
 * Bottom navigation items — 5 tabs:
 * Home, Shorts, Learn, Search, You
 */
const NAV_ITEMS: Array<{
  view: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
  isSpecial?: boolean // For the Shorts center button
}> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'shorts', label: 'Shorts', icon: Zap, isSpecial: true },
  { view: 'learn', label: 'Learn', icon: GraduationCap },
  { view: 'explore', label: 'Search', icon: Search },
  { view: 'dashboard', label: 'You', icon: UserCircle, requiresAuth: true },
]

/**
 * MobileBottomNav — position:fixed bottom navigation bar.
 *
 * On normal views: Shows 5-tab bottom nav with gold dot indicator
 * On listing detail view: Shows StickyCTA with Connect + WhatsApp buttons
 * On shorts view: Hidden (full-screen)
 *
 * SPEC: fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t
 *       flex justify-around items-center md:hidden
 *       Icons: w-6 h-6, Active: gold dot above
 *       Touch targets: min-h-[48px] min-w-[48px]
 *       Safe area: pb-[env(safe-area-inset-bottom)]
 */
export function MobileBottomNav() {
  // CRITICAL: Use individual selectors, NOT useAppStore()
  const currentView = useAppStore((s) => s.currentView)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const selectedListingSlug = useAppStore((s) => s.selectedListingSlug)
  const setShowLeadForm = useAppStore((s) => s.setShowLeadForm)
  const setLeadFormListingId = useAppStore((s) => s.setLeadFormListingId)
  const showBottomNav = useAppStore((s) => s.showBottomNav)
  const { isAuthenticated, setShowLoginModal } = useAuth()

  const isDetailPage = currentView === 'listing' && !!selectedListingSlug

  // Don't show bottom nav on shorts or when explicitly hidden
  if (!showBottomNav && !isDetailPage) return null

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
          initial={false}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
        >
          <StickyCTA
            selectedListingSlug={selectedListingSlug}
            setShowLeadForm={setShowLeadForm}
            setLeadFormListingId={setLeadFormListingId}
          />
        </motion.div>
      ) : (
        <motion.div
          key="bottom-nav"
          initial={false}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-200 flex justify-around items-center md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.view
            const Icon = item.icon

            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view, item.requiresAuth)}
                className="relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px]"
              >
                {/* Gold dot indicator above active icon */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavDot"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {item.isSpecial ? (
                  // Special styling for Shorts button
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8962E]' 
                      : 'bg-gray-100'
                  }`}>
                    <Icon
                      className={`w-4.5 h-4.5 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                ) : (
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                )}
                <span
                  className={`text-[10px] mt-0.5 font-medium transition-colors ${
                    isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * StickyCTA — Shown instead of BottomNav on listing detail pages.
 * Two action buttons: "Connect via App" and "WhatsApp Chat"
 */
function StickyCTA({
  selectedListingSlug,
  setShowLeadForm,
  setLeadFormListingId,
}: {
  selectedListingSlug: string | null
  setShowLeadForm: (show: boolean) => void
  setLeadFormListingId: (id: string) => void
}) {
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
    <div className="flex gap-3 p-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleConnect}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#3155C1] text-white font-semibold text-sm min-h-[48px] active:opacity-90 shadow-sm"
      >
        <Phone className="w-5 h-5" />
        Connect via App
      </motion.button>
      <motion.a
        whileTap={{ scale: 0.97 }}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm min-h-[48px] active:opacity-90 shadow-sm"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp Chat
      </motion.a>
    </div>
  )
}
