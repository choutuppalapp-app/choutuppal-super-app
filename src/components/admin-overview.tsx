'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Store, Building, Image as ImageIcon, ShieldAlert, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { getAdminStats } from '@/app/actions/admin-actions'

export default function AdminOverview() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [counts, setCounts] = useState({
    users: 0,
    listings: 0,
    realEstate: 0,
    banners: 0,
  })
  const [loading, setLoading] = useState(true)

  const isAuthorized = user?.role === 'admin' || user?.role === 'super_admin'

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !isAuthorized) {
      setLoading(false)
      return
    }

    async function fetchCounts() {
      try {
        const stats = await getAdminStats()
        setCounts({
          users: stats.users || 0,
          listings: stats.listings || 0,
          realEstate: stats.realEstate || 0,
          banners: stats.banners || 0,
        })
      } catch (error) {
        console.error('Error fetching admin counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [isLoading, isAuthenticated, isAuthorized])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-center max-w-md mb-6">
          You do not have the required permissions to access the Admin Panel. 
          Please contact a system administrator if you believe this is an error.
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back, {user?.fullName || 'Admin'}. Here's what's happening.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{counts.users.toLocaleString()}</h3>
            </div>
          </div>

          {/* Listings Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Listings</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{counts.listings.toLocaleString()}</h3>
            </div>
          </div>

          {/* Real Estate Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Properties</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{counts.realEstate.toLocaleString()}</h3>
            </div>
          </div>

          {/* Banners Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Banners</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{counts.banners.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
