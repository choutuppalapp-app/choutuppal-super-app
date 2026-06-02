'use client'

import { useState } from 'react'
import { Home, LayoutList, PlusCircle, Building2, UserCircle, Store, Landmark } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { useAppConfig } from '@/hooks/use-app-config'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ListingActionBar } from '@/components/listing-action-bar'

/**
 * Navigation items — 4 side items (the FAB '+' is rendered separately):
 * Home, Listings, [FAB], Real Estate, Profile/You
 *
 * NAVIGATION BEHAVIOUR:
 * - Home      → navigateTo('home')
 * - Listings  → navigateTo('explore') with clear search
 * - Real Estate → navigateTo('explore') with searchQuery='Real Estate'
 * - You       → navigateTo('dashboard') (requires auth)
 */
const NAV_ITEMS: Array<{
  view: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
  searchQuery?: string
}> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'explore', label: 'Listings', icon: LayoutList, searchQuery: '' },
  { view: 'explore', label: 'Real Estate', icon: Building2, searchQuery: 'Real Estate' },
  { view: 'dashboard', label: 'You', icon: UserCircle, requiresAuth: true },
]

/**
 * MobileBottomNav — Redesigned bottom navigation bar.
 *
 * Features:
 * - 4 side tabs + 1 floating center '+' FAB button
 * - FAB opens a bottom sheet with "Add Listing" / "Add Real Estate"
 * - Active tab: Royal Blue icon + bold label + highlight line
 * - Real Estate tab navigates to explore view filtered by "Real Estate"
 * - ZERO Framer Motion — pure Tailwind transitions, no hydration errors
 *
 * SPEC: fixed bottom-0, bg-white, safe-area-inset, flex justify-around
 */
export function MobileBottomNav() {
  const currentView = useAppStore((s) => s.currentView)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const selectedListingSlug = useAppStore((s) => s.selectedListingSlug)
  const showBottomNav = useAppStore((s) => s.showBottomNav)
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const { config } = useAppConfig()

  const [postSheetOpen, setPostSheetOpen] = useState(false)

  const isDetailPage = currentView === 'listing' && !!selectedListingSlug

  // Don't show bottom nav on shorts or when explicitly hidden
  if (!showBottomNav && !isDetailPage) return null

  const handleNavClick = (view: ViewType, requiresAuth?: boolean, query?: string) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    // Set search query before navigating so the explore view filters correctly
    if (query !== undefined) {
      setSearchQuery(query)
    }
    navigateTo(view)
  }

  const handlePostAction = (type: 'listing' | 'real-estate') => {
    setPostSheetOpen(false)
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    // Navigate to admin panel where listing/RE creation lives
    navigateTo('admin')
  }

  // ─── Determine which tab is active ────────────────────────────────
  // Real Estate is active when on explore view AND searchQuery is 'Real Estate'
  // Listings is active when on explore view AND searchQuery is NOT 'Real Estate'
  const isRealEstateActive = currentView === 'explore' && searchQuery === 'Real Estate'
  const isListingsActive = currentView === 'explore' && searchQuery !== 'Real Estate'

  // ─── Detail page: ListingActionBar instead of nav ────────────────────
  if (isDetailPage) {
    return <ListingActionBar />
  }

  // ─── Normal nav with FAB ───────────────────────────────────────────
  return (
    <>
      {/* Nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="relative flex justify-around items-end h-16 px-2">
          {/* Home tab — always visible */}
          <NavItem
            icon={Home}
            label="Home"
            isActive={currentView === 'home'}
            onClick={() => handleNavClick('home')}
          />

          {/* Listings tab — hidden when enableListings is OFF */}
          {config.enableListings && (
            <NavItem
              icon={LayoutList}
              label="Listings"
              isActive={isListingsActive}
              onClick={() => handleNavClick('explore', false, '')}
            />
          )}

          {/* Center FAB — '+' Button — hidden when both listings and RE are off */}
          {(config.enableListings || config.enableRealEstate) && (
            <button
              onClick={() => setPostSheetOpen(true)}
              className="relative flex flex-col items-center -mt-7 group"
              aria-label="Create new post"
            >
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-[#4169E1] to-[#D4AF37] shadow-lg shadow-blue-500/30 active:scale-90 transition-transform duration-200">
                <PlusCircle className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] mt-1 font-medium text-gray-400 group-active:text-[#4169E1] transition-colors">
                Post
              </span>
            </button>
          )}

          {/* Real Estate tab — hidden when enableRealEstate is OFF */}
          {config.enableRealEstate && (
            <NavItem
              icon={Building2}
              label="Real Estate"
              isActive={isRealEstateActive}
              onClick={() => handleNavClick('explore', false, 'Real Estate')}
            />
          )}

          {/* Profile/You tab — always visible */}
          <NavItem
            icon={UserCircle}
            label="You"
            isActive={currentView === 'dashboard' || currentView === 'profile'}
            onClick={() => handleNavClick('dashboard', true)}
          />
        </div>
      </div>

      {/* Post bottom sheet */}
      <Sheet open={postSheetOpen} onOpenChange={setPostSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg">What do you want to post?</SheetTitle>
            <SheetDescription>Choose a category to get started</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 p-4 pt-2 pb-8">
            {config.enableListings && (
              <button
                onClick={() => handlePostAction('listing')}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/80 active:scale-[0.98] transition-transform duration-150 hover:bg-gray-100/80"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#4169E1] to-[#3155C1] shadow-sm">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Add Listing</p>
                  <p className="text-sm text-gray-500">List your business, shop, or service</p>
                </div>
              </button>
            )}
            {config.enableRealEstate && (
              <button
                onClick={() => handlePostAction('real-estate')}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/80 active:scale-[0.98] transition-transform duration-150 hover:bg-gray-100/80"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] shadow-sm">
                  <Landmark className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Add Real Estate</p>
                  <p className="text-sm text-gray-500">Post a property for sale or rent</p>
                </div>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────────── */

/** Single nav tab item — no Framer Motion, pure Tailwind */
function NavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] active:scale-90 transition-all duration-200"
    >
      <Icon
        className={`w-6 h-6 transition-colors duration-200 ${
          isActive ? 'text-[#4169E1]' : 'text-gray-400'
        }`}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      <span
        className={`text-[10px] mt-0.5 transition-all duration-200 ${
          isActive ? 'text-[#4169E1] font-bold' : 'text-gray-400 font-medium'
        }`}
      >
        {label}
      </span>
      {/* Active highlight line */}
      <div
        className={`absolute -bottom-0 h-[2.5px] rounded-full bg-[#4169E1] transition-all duration-300 ${
          isActive ? 'w-5 scale-y-100' : 'w-0 scale-y-0'
        }`}
      />
    </button>
  )
}
