'use client'

import { useState } from 'react'
import AdminOverview from './admin-overview'
import AdminSettings from './admin-settings'
import AdminListings from './admin-listings'
import AdminBanners from './admin-banners'
import AdminStories from './admin-stories'
import AdminNews from './admin-news'
import AdminBlogs from './admin-blogs'
import AdminAnnouncements from './admin-announcements'
import AdminUsers from './admin-users'
import { LayoutDashboard, Settings, Store, Image as ImageIcon, PlaySquare, Newspaper, FileText, Megaphone, Users } from 'lucide-react'

type TabType = 'overview' | 'branding' | 'listings' | 'banners' | 'stories' | 'news' | 'blogs' | 'announcements' | 'users'

export default function AdminContainer() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'listings', label: 'Listings', icon: Store },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'stories', label: 'Stories', icon: PlaySquare },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'branding', label: 'App Branding', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-hidden">
        <div className="h-full overflow-y-auto">
          {activeTab === 'overview' && <AdminOverview onNavigate={(tab) => setActiveTab(tab as TabType)} />}
          
          {(activeTab !== 'overview') && (
            <div className="p-6 md:p-8">
              {activeTab === 'branding' && <AdminSettings />}
              {activeTab === 'users' && <AdminUsers />}
              {activeTab === 'listings' && <AdminListings />}
              {activeTab === 'banners' && <AdminBanners />}
              { activeTab === 'stories' && <AdminStories /> }
              { activeTab === 'news' && <AdminNews /> }
              { activeTab === 'blogs' && <AdminBlogs /> }
              { activeTab === 'announcements' && <AdminAnnouncements /> }
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
