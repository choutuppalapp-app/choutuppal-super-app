'use client'

import React from 'react'
import ProfileSettings from '@/components/profile-settings'
import { useAuth } from '@/lib/auth-context'
import { Card } from '@/components/ui/card'

export default function UserProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to view your profile settings.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 bg-gradient-to-r from-blue-900 to-yellow-600 bg-clip-text text-transparent">
        My Profile
      </h1>
      <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <ProfileSettings />
      </Card>
    </div>
  )
}
