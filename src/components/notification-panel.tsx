'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'

export function NotificationPanel() {
  const { notifications, clearNotifications } = useAppStore()
  const count = notifications.length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5 text-gray-600" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/30">
          <h3 className="font-semibold text-sm text-gray-800">Notifications</h3>
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearNotifications}
              className="text-xs text-[#4169E1] hover:text-[#3155C1] font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/40 transition-colors"
            >
              <Check className="size-3" />
              Mark all read
            </motion.button>
          </div>
        </div>
        <ScrollArea className="max-h-72">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="size-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-4 py-3 hover:bg-white/40 transition-colors border-b border-white/20 last:border-0 cursor-pointer"
                >
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
