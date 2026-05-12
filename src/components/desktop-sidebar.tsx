'use client'

import { motion } from 'framer-motion'
import {
  Home,
  Compass,
  Newspaper,
  LayoutDashboard,
  Shield,
  Settings,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { ViewType } from '@/lib/store'
import { CoinBadge } from './coin-badge'

const NAV_ITEMS: Array<{
  view: ViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}> = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'explore', label: 'Explore', icon: Compass },
  { view: 'news', label: 'News', icon: Newspaper },
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
]

export function DesktopSidebar() {
  const { currentView, navigateTo, currentUser } = useAppStore()

  const isAdmin = currentUser?.role === 'admin'

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[72px] xl:w-[240px] bg-white/40 backdrop-blur-2xl border-r border-white/30 shadow-2xl z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20">
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer"
          onClick={() => navigateTo('home')}
        >
          <span className="text-white font-bold text-xl leading-none">C</span>
        </motion.div>
        <span className="text-lg font-bold bg-gradient-to-r from-[#4169E1] to-[#D4AF37] bg-clip-text text-transparent hidden xl:block">
          Choutuppal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null

          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <motion.button
              key={item.view}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium relative ${
                isActive
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`size-5 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : ''}`} />
              <span className="hidden xl:inline">{item.label}</span>
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/20">
        <div className="hidden xl:block mb-3">
          <CoinBadge />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:bg-white/40 hover:text-gray-700 transition-all text-sm"
        >
          <Settings className="size-5 flex-shrink-0" />
          <span className="hidden xl:inline">Settings</span>
        </motion.button>
      </div>
    </aside>
  )
}
