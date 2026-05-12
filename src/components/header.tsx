'use client'

import { motion } from 'framer-motion'
import {
  MapPin, Search, Mic, Home, Compass, Newspaper,
  LayoutDashboard, Shield, LogOut, User,
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { NotificationPanel } from './notification-panel'
import { useAuth } from '@/lib/auth-context'

const CITIES = [
  { slug: 'choutuppal', name: 'Choutuppal' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'warangal', name: 'Warangal' },
]

const NAV_LINKS: Array<{ view: ViewType; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean; requiresAuth?: boolean }> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'explore', label: 'Explore', icon: Compass },
  { view: 'news', label: 'News', icon: Newspaper },
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
  { view: 'admin', label: 'Admin', icon: Shield, adminOnly: true, requiresAuth: true },
]

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const {
    selectedCity, setCity, setSearchOpen, currentView, navigateTo, currentUser,
  } = useAppStore()
  const { isAuthenticated, setShowLoginModal, logout, user } = useAuth()

  const isAdmin = user?.role === 'admin'

  const handleNavClick = (view: ViewType, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    navigateTo(view)
  }

  return (
    <header
      className={`w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/60 md:sticky md:top-0 ${className || ''}`}
    >
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between h-14 px-6 max-w-7xl mx-auto">
        {/* Left: Logo + City */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm leading-none">C</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#4169E1] to-[#D4AF37] bg-clip-text text-transparent">
              Choutuppal
            </span>
          </button>

          <div className="h-6 w-px bg-gray-200" />

          <Select value={selectedCity} onValueChange={(val) => {
            const city = CITIES.find((c) => c.slug === val)
            if (city) setCity(city.slug, city.name)
          }}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-transparent border-gray-200 hover:border-[#D4AF37]/40 transition-colors">
              <MapPin className="size-3.5 text-[#D4AF37] mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city.slug} value={city.slug}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Center: Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            const isActive = currentView === item.view
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view, item.requiresAuth)}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#D4AF37]'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="desktopNavIndicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D4AF37] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Search + Notifications + Auth */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Mic className="size-4 text-gray-500" />
          </button>
          <NotificationPanel />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('dashboard', true)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4169E1] to-[#3155C1] flex items-center justify-center text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                title={user?.fullName || 'Dashboard'}
              >
                {user?.fullName?.charAt(0) || 'U'}
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              <User className="size-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden items-center justify-between h-12 px-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateTo('home')} className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs leading-none">C</span>
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-[#4169E1] to-[#D4AF37] bg-clip-text text-transparent">
              Choutuppal
            </span>
          </button>

          <Select value={selectedCity} onValueChange={(val) => {
            const city = CITIES.find((c) => c.slug === val)
            if (city) setCity(city.slug, city.name)
          }}>
            <SelectTrigger className="w-auto bg-transparent border-0 h-7 px-1 text-xs">
              <MapPin className="size-3 text-[#D4AF37] mr-0.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city.slug} value={city.slug}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Search className="size-5 text-gray-600" />
          </button>
          <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
            <NotificationPanel />
          </div>
          {isAuthenticated ? (
            <button
              onClick={() => handleNavClick('dashboard', true)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4169E1] to-[#3155C1] flex items-center justify-center text-white text-xs font-bold shadow-sm"
            >
              {user?.fullName?.charAt(0) || 'U'}
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="ml-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white text-xs font-semibold shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
