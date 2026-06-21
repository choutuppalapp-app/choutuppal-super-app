'use client'

import { useState } from 'react'
import { Home, Newspaper, BookOpen, Building2, UserCircle, Store, Landmark, PlusCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { useAppConfig } from '@/hooks/use-app-config'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

export function MobileBottomNav() {
  const pathname = usePathname()
  const currentView = useAppStore((s) => s.currentView)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const selectedListingSlug = useAppStore((s) => s.selectedListingSlug)
  const showBottomNav = useAppStore((s) => s.showBottomNav)
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const { config } = useAppConfig()

  const [postSheetOpen, setPostSheetOpen] = useState(false)

  const isDetailPage = currentView === 'listing' || pathname?.startsWith('/listing/')

  if (isDetailPage) return null

  if (!showBottomNav) return null

  const handleNavClick = (view: ViewType, requiresAuth?: boolean, query?: string) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true)
      return
    }
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
    navigateTo('admin')
  }

  const isExploreActive = currentView === 'explore'
  const isUpdatesActive = currentView === 'news' || currentView === 'blog'

  return (
    <>
      {/* Nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="relative flex justify-around items-end h-16 px-2">
          {/* 1. Home */}
          <NavItem
            icon={Home}
            label="Home"
            isActive={currentView === 'home'}
            onClick={() => handleNavClick('home')}
          />

          {/* 2. News & Blog */}
          <NavItem
            icon={Newspaper}
            label="Updates"
            isActive={isUpdatesActive}
            onClick={() => handleNavClick('news')}
          />

          {/* 3. Center FAB */}
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
                Add
              </span>
            </button>
          )}

          {/* 4. Explore (Listings & Real Estate) */}
          <NavItem
            icon={Building2}
            label="Explore"
            isActive={isExploreActive}
            onClick={() => handleNavClick('explore', false, '')}
          />

          {/* 5. You */}
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
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
