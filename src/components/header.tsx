'use client'

import { useState } from 'react'
import {
  MapPin, Home, Compass, Newspaper, Users,
  LayoutDashboard, Shield, LogOut, User,
  Bell, Menu, X, FileText, Loader2, Download,
  Crown,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { NotificationPanel } from './notification-panel'
import { useAuth } from '@/lib/auth-context'
import { usePWAInstall } from './pwa-install-provider'
import { useAppConfig } from '@/hooks/use-app-config'

const NAV_LINKS: Array<{
  view: ViewType
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>
  adminOnly?: boolean
  superAdminOnly?: boolean
  requiresAuth?: boolean
}> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'explore', label: 'Explore', icon: Compass },
  { view: 'news', label: 'News', icon: Newspaper },
  { view: 'community', label: 'Community', icon: Users },
  { view: 'blog', label: 'Blog', icon: FileText },
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
  { view: 'admin', label: 'Admin Panel', icon: Shield, adminOnly: true, requiresAuth: true },
]

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  // CRITICAL: Use individual selectors, NOT useAppStore() — prevents re-render
  // on every unrelated store change (spin wheel, search, notifications, etc.)
  const currentView = useAppStore((s) => s.currentView)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const currentCity = useAppStore((s) => s.currentCity)
  const locationLoading = useAppStore((s) => s.locationLoading)
  const themePrimary = useAppStore((s) => s.themePrimary)
  const themeSecondary = useAppStore((s) => s.themeSecondary)
  const { isAuthenticated, setShowLoginModal, logout, user } = useAuth()
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWAInstall()
  const { config } = useAppConfig()
  const showInstallMenuItem = (isInstallable || isIOS) && !isInstalled

  const brandName = currentCity.brandName || 'Choutuppal'
  const logoUrl = currentCity.logoUrl || null
  const primary = themePrimary || '#D4AF37'
  const secondary = themeSecondary || '#4169E1'

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'city_admin'
  const isSuperAdmin = user?.role === 'super_admin'

  const handleNavClick = (view: ViewType, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true)
      setIsDrawerOpen(false)
      return
    }
    navigateTo(view)
    setIsDrawerOpen(false)
  }

  const renderLogo = (size: 'sm' | 'md' = 'md') => {
    const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

    if (logoUrl) {
      return (
        <div className={`${dim} rounded-full overflow-hidden shadow-sm flex-shrink-0`}>
          <img src={logoUrl} alt={brandName} className="w-full h-full object-cover" />
        </div>
      )
    }

    return (
      <div
        className={`${dim} rounded-full flex items-center justify-center shadow-sm flex-shrink-0`}
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        <span className="text-white font-bold leading-none" style={{ fontSize: size === 'sm' ? '12px' : '14px' }}>
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  const renderBrandText = (size: 'sm' | 'md' = 'md') => {
    const textClass = size === 'sm' ? 'text-base' : 'text-lg'
    return (
      <span
        className={`${textClass} font-bold bg-clip-text text-transparent`}
        style={{ backgroundImage: `linear-gradient(to right, ${secondary}, ${primary})` }}
      >
        {brandName}
      </span>
    )
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm ${className || ''}`}
    >
      {/* ═══ DESKTOP HEADER ═══ */}
      <div className="hidden md:flex items-center justify-between h-14 px-6 max-w-7xl mx-auto">
        {/* Left: Logo + City */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {renderLogo('md')}
            {renderBrandText('md')}
          </button>
        </div>

        {/* Center: Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            if (item.view === 'dashboard' && isAdmin) return null
            // Feature toggle filtering for desktop nav
            if (item.view === 'blog' && !config.enableBlog) return null
            if (item.view === 'news' && !config.enableBlog) return null
            if (item.view === 'explore' && !config.enableListings && !config.enableRealEstate) return null
            const isActive = currentView === item.view
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view, item.requiresAuth)}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? '' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
                style={isActive ? { color: primary } : undefined}
              >
                {item.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ backgroundColor: primary }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Notifications + Auth */}
        <div className="flex items-center gap-2">
          <NotificationPanel />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('dashboard', true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${secondary}, ${primary})` }}
                title={user?.fullName || 'Dashboard'}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </button>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
            >
              <User className="size-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* ═══ MOBILE HEADER ═══ */}
      <div className="flex md:hidden items-center justify-between h-12 px-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-1.5">
            {renderLogo('sm')}
            {renderBrandText('sm')}
          </button>
        </div>

        <div className="flex items-center gap-0">
          <div className="min-w-[44px] min-h-[44px] flex items-center justify-center relative">
            <NotificationPanel />
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* ═══ HAMBURGER DRAWER ═══ */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 md:hidden transition-opacity duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] w-72 bg-white shadow-2xl md:hidden flex flex-col"
          >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {renderLogo('md')}
                  {renderBrandText('md')}
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* User section */}
              <div className="px-4 py-3 border-b border-gray-100">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${secondary}, ${primary})` }}
                    >
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-gray-500">{isAdmin ? 'Admin Account' : 'Member'}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setIsDrawerOpen(false) }}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowLoginModal(true); setIsDrawerOpen(false) }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow-sm active:opacity-90"
                    style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
                  >
                    <User className="size-4" />
                    Sign In
                  </button>
                )}
              </div>

              {/* Navigation links */}
              <nav className="flex-1 py-2 overflow-y-auto">
                {NAV_LINKS.map((item) => {
                  if (item.adminOnly && !isAdmin) return null
                  if (item.view === 'dashboard' && isAdmin) return null
                  // Feature toggle filtering for drawer nav
                  if (item.view === 'blog' && !config.enableBlog) return null
                  if (item.view === 'news' && !config.enableBlog) return null
                  if (item.view === 'explore' && !config.enableListings && !config.enableRealEstate) return null
                  const isActive = currentView === item.view
                  const Icon = item.icon

                  return (
                    <button
                      key={item.view}
                      onClick={() => handleNavClick(item.view, item.requiresAuth)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                        isActive ? '' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                      style={isActive ? {
                        backgroundColor: `${primary}10`,
                        color: primary,
                        borderRight: `3px solid ${primary}`,
                      } : undefined}
                    >
                      <Icon className="w-5 h-5" style={isActive ? { color: primary } : undefined} />
                      <span className="text-sm font-medium" style={isActive ? { color: primary } : undefined}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                      )}
                    </button>
                  )
                })}

                {/* ─── Install App menu item ─── */}
                {showInstallMenuItem && (
                  <>
                    <div className="mx-5 my-2 border-t border-gray-100" />
                    <button
                      onClick={async () => {
                        if (isIOS) {
                          // On iOS, the iOS banner handles instructions — just close drawer
                          setIsDrawerOpen(false)
                        } else {
                          await triggerInstall()
                          setIsDrawerOpen(false)
                        }
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${secondary}, ${primary})` }}
                      >
                        <Download className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">
                        {isIOS ? 'Add to Home Screen' : 'Install App'}
                      </span>
                      {!isIOS && (
                        <span
                          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}
                        >
                          NEW
                        </span>
                      )}
                    </button>
                  </>
                )}
              </nav>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center">{brandName} 2.0 • Made with ❤️ in Telangana</p>
              </div>
          </div>
        </>
      )}
    </header>
  )
}
