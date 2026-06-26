'use client'

import { useState } from 'react'
import AdminOverview from './admin-overview'
import AdminSettings from './admin-settings'
import { LayoutDashboard, Settings } from 'lucide-react'

export default function AdminContainer() {
  const [activeTab, setActiveTab] = useState<'overview' | 'branding'>('overview')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="flex md:flex-col gap-2 px-4 pb-4 md:pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'bg-blue-50 text-blue-700 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition whitespace-nowrap ${
              activeTab === 'branding' 
                ? 'bg-blue-50 text-blue-700 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            App Branding
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-hidden">
        <div className="h-full overflow-y-auto">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'branding' && (
            <div className="p-6 md:p-8">
              <AdminSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
