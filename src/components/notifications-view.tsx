'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellOff, CheckCircle2, Megaphone, MessageSquare,
  TrendingUp, Shield, Trash2, CheckCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/glass-card'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NotificationType =
  | 'listing_approved'
  | 'new_lead'
  | 'system'
  | 'promotion'
  | 'comment'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  timeAgo: string
  isRead: boolean
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'listing_approved',
    title: 'Listing Approved!',
    message: 'Your listing "Sri Lakshmi Tiffin Center" has been approved and is now live.',
    timeAgo: '5m ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'new_lead',
    title: 'New Lead Received',
    message: 'Rajesh Kumar is interested in your "Pharmacy Assistant" job listing.',
    timeAgo: '20m ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'comment',
    title: 'New Comment',
    message: 'Venkat commented on your listing: "Great service, highly recommended!"',
    timeAgo: '1h ago',
    isRead: false,
  },
  {
    id: 'n4',
    type: 'promotion',
    title: 'Upgrade to Premium 🌟',
    message: 'Get 3x more views on your listings with our Premium plan. Limited offer — ₹99/mo.',
    timeAgo: '2h ago',
    isRead: false,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Welcome to Choutuppal App!',
    message: 'Explore local businesses, jobs, and real estate in your area. Start by completing your profile.',
    timeAgo: '3h ago',
    isRead: true,
  },
  {
    id: 'n6',
    type: 'new_lead',
    title: 'New Lead Received',
    message: 'Anitha Reddy wants to know more about your 2BHK Flat in Bhongir.',
    timeAgo: '5h ago',
    isRead: true,
  },
  {
    id: 'n7',
    type: 'listing_approved',
    title: 'Listing Approved',
    message: 'Your "Digital Marketing Intern" job listing is now live.',
    timeAgo: '1d ago',
    isRead: true,
  },
  {
    id: 'n8',
    type: 'system',
    title: 'App Update Available',
    message: 'Version 2.5 is available with new features: Saved Items, Notifications, and more!',
    timeAgo: '2d ago',
    isRead: true,
  },
  {
    id: 'n9',
    type: 'promotion',
    title: 'Republic Day Special 🇮🇳',
    message: 'Post your business listing for FREE this week! No coins needed.',
    timeAgo: '3d ago',
    isRead: true,
  },
  {
    id: 'n10',
    type: 'comment',
    title: 'New Review',
    message: 'Suresh gave your listing 5 stars: "Best tiffin center in town!"',
    timeAgo: '4d ago',
    isRead: true,
  },
]

/* ---------- Mapping: type → icon ---------- */
const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  listing_approved: CheckCircle2,
  new_lead: TrendingUp,
  system: Shield,
  promotion: Megaphone,
  comment: MessageSquare,
}

/* ---------- Mapping: type → icon bg color ---------- */
const TYPE_ICON_BG: Record<NotificationType, string> = {
  listing_approved: 'bg-emerald-500/10 text-emerald-600',
  new_lead: 'bg-[#4169E1]/10 text-[#4169E1]',
  system: 'bg-gray-500/10 text-gray-500',
  promotion: 'bg-[#D4AF37]/10 text-[#D4AF37]',
  comment: 'bg-purple-500/10 text-purple-600',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NotificationsView() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const selectedCityName = useAppStore((s) => s.selectedCityName)
  const { isAuthenticated, setShowLoginModal } = useAuth()

  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  /* ---------- Handlers ---------- */
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  /* ---------- Not authenticated prompt ---------- */
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <GlassCard className="text-center py-16">
          <div className="size-16 rounded-full bg-[#4169E1]/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="size-8 text-[#4169E1]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view notifications</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Log in to stay updated with listing approvals, leads, and updates from {selectedCityName}.
          </p>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              className="bg-gradient-to-r from-[#4169E1] to-[#3155c7] text-white"
              onClick={() => setShowLoginModal(true)}
            >
              Login / Sign Up
            </Button>
          </motion.div>
        </GlassCard>
      </div>
    )
  }

  /* ---------- Authenticated view ---------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="size-7 text-[#4169E1]" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-[#4169E1] text-white border-none text-xs">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-500">
            Stay updated on your listings and activity
          </p>
        </div>

        {unreadCount > 0 && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              className="border-[#4169E1]/30 text-[#4169E1] hover:bg-[#4169E1]/5"
              onClick={markAllRead}
            >
              <CheckCheck className="size-4 mr-1.5" />
              Mark all read
            </Button>
          </motion.div>
        )}
      </div>

      {/* ---- Notification List ---- */}
      {notifications.length === 0 ? (
        <GlassCard className="text-center py-16">
          <BellOff className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No notifications</p>
          <p className="text-sm text-gray-400 mt-1">
            You&apos;re all caught up! New notifications will appear here.
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => {
                const Icon = TYPE_ICONS[notif.type]
                const iconBg = TYPE_ICON_BG[notif.type]

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    onClick={() => markAsRead(notif.id)}
                    className="cursor-pointer"
                  >
                    <GlassCard
                      className={`!p-4 hover:shadow-lg transition-shadow relative overflow-hidden ${
                        !notif.isRead ? 'border-l-4 border-l-[#4169E1]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                        >
                          <Icon className="size-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="size-2 rounded-full bg-[#4169E1] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-gray-400">{notif.timeAgo}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* ---- Clear All ---- */}
          {notifications.length > 0 && (
            <div className="text-center pt-2">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={clearAll}
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Clear All Notifications
                </Button>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
