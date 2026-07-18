'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  User, 
  Sparkles, 
  ImageIcon, 
  Home, 
  Menu, 
  X,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { href: '/user/profile', label: 'My Profile', icon: User },
    { href: '/user/stories', label: 'My Stories', icon: Sparkles },
    { href: '/user/banners', label: 'My Banners', icon: ImageIcon },
  ]

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-140px)] bg-gray-50">
      {/* Mobile Top Navbar for Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-extrabold text-gray-900 bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent">
          User Dashboard
        </span>
        <div className="w-10"></div>
      </div>

      {/* Mobile Drawer (Sidebar) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white shadow-2xl p-6 animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-8 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="pb-4 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-900 to-yellow-500 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 truncate max-w-[160px]">{user?.fullName || 'User'}</h4>
                      <p className="text-xs text-gray-500">{user?.phone || ''}</p>
                    </div>
                  </div>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-900 to-yellow-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="space-y-2 pb-8">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0 justify-between">
        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-900 to-yellow-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 truncate max-w-[140px]">{user?.fullName || 'User'}</h4>
                <p className="text-xs text-gray-500">{user?.phone || ''}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-900 to-yellow-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-55 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="space-y-1.5 pt-6 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 p-6 md:p-8 max-w-4xl">
        {children}
      </main>
    </div>
  )
}
