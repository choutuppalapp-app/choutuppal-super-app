'use client'

import { motion } from 'framer-motion'
import { Home, Compass, Newspaper, User } from 'lucide-react'
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

export function BottomNav() {
  const { currentView, navigateTo } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/40 backdrop-blur-2xl border-t border-white/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view
          const Icon = item.icon

          return (
            <motion.button
              key={item.view}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateTo(item.view)}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors relative min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`size-5 transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-gray-400'
                }`}
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
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  )
}
