'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  Search,
  Mic,
  Bell,
  Menu,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { NotificationPanel } from './notification-panel'

const CITIES = [
  { slug: 'choutuppal', name: 'Choutuppal' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'warangal', name: 'Warangal' },
]

export function Header() {
  const {
    selectedCity,
    setCity,
    isSearchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
  } = useAppStore()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-2xl border-b border-white/30 shadow-lg"
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* Logo & City Selector */}
        <div className="flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg leading-none">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#4169E1] to-[#D4AF37] bg-clip-text text-transparent hidden sm:inline">
              Choutuppal
            </span>
          </motion.div>

          <div className="hidden md:flex items-center">
            <Select
              value={selectedCity}
              onValueChange={(val) => {
                const city = CITIES.find((c) => c.slug === val)
                if (city) setCity(city.slug, city.name)
              }}
            >
              <SelectTrigger className="w-[160px] bg-white/30 border-white/40 text-sm">
                <MapPin className="size-4 text-[#D4AF37] mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city.slug} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <motion.div whileTap={{ scale: 0.98 }} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses, news, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-white/50 border border-white/40 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 transition-all"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4169E1] hover:text-[#D4AF37] transition-colors"
              aria-label="Voice search"
            >
              <Mic className="size-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Mobile city selector */}
          <div className="md:hidden">
            <Select
              value={selectedCity}
              onValueChange={(val) => {
                const city = CITIES.find((c) => c.slug === val)
                if (city) setCity(city.slug, city.name)
              }}
            >
              <SelectTrigger className="w-auto bg-transparent border-0 h-8 px-1 text-xs">
                <MapPin className="size-3.5 text-[#D4AF37]" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city.slug} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile search button */}
          <motion.div whileTap={{ scale: 0.9 }} className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="relative"
            >
              <Search className="size-5 text-gray-600" />
            </Button>
          </motion.div>

          {/* Notification Bell */}
          <NotificationPanel />

          {/* Mobile Menu (unused - for future) */}
          <motion.div whileTap={{ scale: 0.9 }} className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="size-5 text-gray-600" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
