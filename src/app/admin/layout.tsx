'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Image as ImageIcon, PlaySquare, Store, BellRing, LogOut, ShieldAlert, Loader2, Settings, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, setShowLoginModal, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isAuthorized = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'city_admin' || (user?.email && user.email.toLowerCase() === 'mailmosin@gmail.com')

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Banner Ads', href: '/admin/banners', icon: ImageIcon },
    { label: 'User Stories', href: '/admin/stories', icon: PlaySquare },
    { label: 'Listings Moderation', href: '/admin/listings', icon: Store },
    { label: 'Job Listings', href: '/admin/jobs', icon: Briefcase },
    { label: 'Role Management', href: '/admin/roles', icon: ShieldAlert },
    { label: 'Send Notifications', href: '/admin/notifications', icon: BellRing },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100">
          <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Login Required</h1>
          <p className="text-sm text-gray-500 mb-6">Please sign in to access the administrator panel.</p>
          <button 
            onClick={() => setShowLoginModal(true)}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-yellow-500 text-white rounded-xl hover:opacity-95 transition font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-center max-w-md mb-6">
          You do not have the required permissions to access the Admin Panel. 
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-yellow-500 text-white rounded-xl hover:opacity-95 transition font-bold"
        >
          Return to Home
        </button>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0 flex flex-col md:h-screen sticky top-0 z-40">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="flex md:flex-col gap-1.5 px-4 pb-4 md:pb-0 overflow-x-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition whitespace-nowrap text-sm font-medium ${
                  active 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 mt-auto hidden md:block border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-semibold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 w-full min-w-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
export { AdminLayout }
