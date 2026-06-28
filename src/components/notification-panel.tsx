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
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function NotificationPanel() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const navigateTo = useAppStore((s) => s.navigateTo)
  const [newPosts, setNewPosts] = useState<any[]>([])
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/social/posts?limit=5')
        if (res.ok) {
          const data = await res.json()
          const posts = data.posts || []
          
          // Check for posts in the last 24 hours
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          
          const recent = posts.filter((p: any) => new Date(p.createdAt) > twentyFourHoursAgo && !p.isDeleted)
          
          setNewPosts(recent)
          
          // Check localStorage for last read timestamp
          const lastRead = localStorage.getItem('lastReadCommunityPosts')
          if (recent.length > 0) {
            if (!lastRead || new Date(recent[0].createdAt) > new Date(lastRead)) {
              setHasUnread(true)
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchPosts()
  }, [])

  const handleMarkRead = () => {
    setHasUnread(false)
    if (newPosts.length > 0) {
      localStorage.setItem('lastReadCommunityPosts', newPosts[0].createdAt)
    }
  }

  const handleOpenCommunity = () => {
    handleMarkRead()
    navigateTo('community')
  }

  const count = hasUnread ? newPosts.length : 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="icon" className="relative" onClick={handleMarkRead}>
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
              onClick={handleMarkRead}
              className="text-xs text-[#4169E1] hover:text-[#3155C1] font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/40 transition-colors"
            >
              <Check className="size-3" />
              Mark all read
            </motion.button>
          </div>
        </div>
        <ScrollArea className="max-h-72">
          {newPosts.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="size-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No new updates</p>
            </div>
          ) : (
            <div className="py-1">
              {newPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={handleOpenCommunity}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer"
                >
                  <p className="text-sm text-gray-900 font-medium">New Community Post</p>
                  <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
                    by {post.author?.fullName || 'User'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
