'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { DashboardHeaderSkeleton } from '@/components/skeleton-loaders'
import { ForbiddenPage } from '@/components/auth/forbidden-page'

const AgentDashboard = dynamic(() => import('@/components/agent-dashboard').then(mod => mod.default), { ssr: false })
const DashboardView = dynamic(() => import('@/components/dashboard-view').then(mod => mod.default), { ssr: false })
const AdminView = dynamic(() => import('@/components/admin-view').then(mod => mod.default), { ssr: false })

export function ProtectedDashboard() {
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()
  const autoLoginAttempted = useRef(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (<div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Please sign in to access your dashboard</p>
          <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm">Sign In</button>
        </div>
      </div>
    )
  }

  const role = user?.role?.toLowerCase() || '';
  if (role === 'super_admin' || role === 'city_admin' || role === 'admin') return <ProtectedAdmin><AdminView /></ProtectedAdmin>
  if (role === 'agent') return <AgentDashboard />
  return <DashboardView />
}

export const ProtectedAdmin = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()
  const autoLoginAttempted = useRef(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <DashboardHeaderSkeleton />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (<div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Please sign in as admin to access this page</p>
          <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm">Sign In as Admin</button>
        </div>
      </div>
    )
  }

  const role = user?.role?.toLowerCase() || '';
  const isAdminRole = role === 'super_admin' || role === 'city_admin' || role === 'admin'
  if (!isAdminRole) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="max-w-7xl mx-auto">
          <div className="mx-4 mt-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
            <AlertTriangle className="size-4 shrink-0" />
            Dev Mode: Viewing admin panel as non-admin user.
          </div>
          <>{children}</>
        </div>
      )
    }
    return <ForbiddenPage />
  }

  return <>{children}</>;
}

export function ProtectedSuperAdmin() {
  const { isAuthenticated, user, setShowLoginModal, isLoading } = useAuth()
  const autoLoginAttempted = useRef(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading, setShowLoginModal])

  if (!isMounted) return null;

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
        <div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Please sign in as super-admin to access this page</p>
          <button onClick={() => setShowLoginModal(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white font-semibold shadow-sm">Sign In</button>
        </div>
      </div>
    )
  }

  return <ProtectedAdmin><AdminView /></ProtectedAdmin>
}
