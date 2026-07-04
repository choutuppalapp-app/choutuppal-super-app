'use client'

import { useState } from 'react'
import AdminOverview from './admin-overview'
import AdminBranding from './admin-branding'
import AdminListings from './admin-listings'
import AdminBanners from './admin-banners'
import AdminStories from './admin-stories'
import AdminNews from './admin-news'
import AdminBlogs from './admin-blogs'
import AdminAnnouncements from './admin-announcements'
import AdminUsers from './admin-users'
import AdminModeration from './admin-moderation'
import AdminYoutubeSync from './admin-youtube-sync'
import AdminPush from './admin-push'
import AdminRealEstate from './admin-real-estate'
import { LayoutDashboard, Settings, Store, Image as ImageIcon, PlaySquare, Newspaper, FileText, Megaphone, Users, LogOut, ShieldAlert, Loader2, ShieldCheck, Youtube, BellRing, Building2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

type TabType = 'overview' | 'branding' | 'listings' | 'realestate' | 'banners' | 'stories' | 'news' | 'blogs' | 'announcements' | 'users' | 'moderation' | 'youtube' | 'push'

export default function AdminContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { user, isAuthenticated, isLoading, setShowLoginModal, logout } = useAuth()
  const router = useRouter()
  
  const isAuthorized = user?.role === 'admin' || user?.role === 'super_admin'

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Business', icon: Store },
    { id: 'realestate', label: 'Real Estate', icon: Building2 },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'stories', label: 'Stories', icon: PlaySquare },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'youtube', label: 'YouTube Sync', icon: Youtube },
    { id: 'push', label: 'Push Notifications', icon: BellRing },
    { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
    { id: 'branding', label: 'App Branding', icon: Settings },
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
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0 flex flex-col md:h-screen sticky top-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="flex md:flex-col gap-2 px-4 pb-4 md:pb-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 mt-auto hidden md:block border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 pb-20">
        <div className="w-full">
          {activeTab === 'overview' && <AdminOverview onNavigate={(tab) => setActiveTab(tab as TabType)} />}
          
          {(activeTab !== 'overview') && (
            <div className="p-6 md:p-8">
              {activeTab === 'branding' && <AdminBranding />}
              {activeTab === 'users' && <AdminUsers />}
              {activeTab === 'listings' && <AdminListings />}
              {activeTab === 'realestate' && <AdminRealEstate />}
              {activeTab === 'banners' && <AdminBanners />}
              {activeTab === 'stories' && <AdminStories />}
              {activeTab === 'news' && <AdminNews />}
              {activeTab === 'blogs' && <AdminBlogs />}
              { activeTab === 'announcements' && <AdminAnnouncements /> }
              { activeTab === 'youtube' && <AdminYoutubeSync /> }
              { activeTab === 'push' && <AdminPush /> }
              { activeTab === 'moderation' && <AdminModeration /> }
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
