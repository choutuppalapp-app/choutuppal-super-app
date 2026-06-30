'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Music, Pause, Trash2, Eye, Heart, ChevronUp, Send, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StoryItem {
  id: string
  title: string
  mediaType: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  musicId: string | null
  musicName: string | null
  isPremium: boolean
  viewsCount: number
  views?: number
  likes?: number
  comments?: any
  replies?: any
  viewers?: any
  ctaLink?: string | null
  text?: string | null
  createdAt: string
  expiresAt: string
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
    subscriptionTier: string
  }
  music: {
    id: string
    name: string
    audioUrl: string
    artist: string
  } | null
}

interface StoryViewerProps {
  stories: StoryItem[]
  initialStoryIndex: number
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Group stories by user id, preserving the order of first appearance. */
function groupByUser(stories: StoryItem[]): Map<string, StoryItem[]> {
  const map = new Map<string, StoryItem[]>()
  for (const s of stories) {
    const arr = map.get(s.user.id)
    if (arr) arr.push(s)
    else map.set(s.user.id, [s])
  }
  return map
}

/** Determine the flat index of the first story belonging to a given user group. */
function flatIndexOf(stories: StoryItem[], userId: string): number {
  return stories.findIndex((s) => s.user.id === userId)
}

const IMAGE_DURATION = 5000 // 5 seconds for images
const HOLD_THRESHOLD_MS = 150 // ms before we consider it a "hold" (pause)
const DRAG_THRESHOLD_PX = 10 // px before we consider it a drag vs tap

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
  /* ---- derived state ---- */
  const userGroups = useMemo(() => groupByUser(stories), [stories])
  const userIds = useMemo(() => [...userGroups.keys()], [userGroups])

  // Which flat story is currently shown
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(initialStoryIndex, Math.max(stories.length - 1, 0))
  )

  const { user: currentUser } = useAuth()
  const setShowBottomNav = useAppStore((s) => s.setShowBottomNav)

  useEffect(() => {
    setShowBottomNav(false)
    return () => setShowBottomNav(true)
  }, [setShowBottomNav])

  const [localLikes, setLocalLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [localReplies, setLocalReplies] = useState<any[]>([])
  const [localViewers, setLocalViewers] = useState<any[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'views' | 'replies'>('views')

  const currentStory = stories[currentIndex] ?? null

  useEffect(() => {
    if (!currentStory) return
    setLocalLikes((currentStory as any).likes || 0)
    setIsLiked(false)
    
    let repliesArr: any[] = []
    const rawReplies = (currentStory as any).replies
    if (Array.isArray(rawReplies)) {
      repliesArr = rawReplies
    } else if (typeof rawReplies === 'string') {
      try {
        repliesArr = JSON.parse(rawReplies)
      } catch {
        repliesArr = []
      }
    }
    setLocalReplies(repliesArr)

    let viewersArr: any[] = []
    const rawViewers = (currentStory as any).viewers
    if (Array.isArray(rawViewers)) {
      viewersArr = rawViewers
    } else if (typeof rawViewers === 'string') {
      try {
        viewersArr = JSON.parse(rawViewers)
      } catch {
        viewersArr = []
      }
    }
    setLocalViewers(viewersArr)
  }, [currentStory])

  const handleReplySubmit = async () => {
    if (!currentStory) return
    if (!currentUser) {
      toast.error('Please login to interact')
      return
    }
    if (!commentInput.trim()) return

    const text = commentInput.trim()
    setCommentInput('')
    
    const newReply = {
      userId: currentUser.id,
      fullName: currentUser.fullName || 'Anonymous',
      avatarUrl: currentUser.avatarUrl || null,
      text,
      timestamp: new Date().toISOString()
    }
    setLocalReplies(prev => [...prev, newReply])
    toast.success('Reply sent!')

    try {
      const res = await fetch(`/api/stories/${currentStory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          userId: currentUser.id,
          fullName: currentUser.fullName,
          avatarUrl: currentUser.avatarUrl || null,
          text
        })
      })
      if (!res.ok) {
        toast.error('Failed to send reply')
      } else {
        const data = await res.json()
        if (data && data.replies) {
          setLocalReplies(Array.isArray(data.replies) ? data.replies : [])
        }
      }
    } catch (e) {
      console.error('Reply failed:', e)
    }
  }

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentStory) return
    if (!currentUser) {
      toast.error('Please login to interact')
      return
    }
    if (isLiked) return
    
    setIsLiked(true)
    setLocalLikes(prev => prev + 1)
    toast.success('Story liked!')

    try {
      // 1. Register a like
      await fetch(`/api/stories/${currentStory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          userId: currentUser.id
        })
      })

      // 2. Predefined reply '❤️'
      const newReply = {
        userId: currentUser.id,
        fullName: currentUser.fullName || 'Anonymous',
        avatarUrl: currentUser.avatarUrl || null,
        text: '❤️',
        timestamp: new Date().toISOString()
      }
      setLocalReplies(prev => [...prev, newReply])

      await fetch(`/api/stories/${currentStory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          userId: currentUser.id,
          fullName: currentUser.fullName,
          avatarUrl: currentUser.avatarUrl || null,
          text: '❤️'
        })
      })
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  const currentUserStories = currentStory ? userGroups.get(currentStory.user.id) ?? [] : []
  const indexInUserGroup = currentStory
    ? currentUserStories.findIndex((s) => s.id === currentStory.id)
    : 0

  /* ---- progress bar ---- */
  const [progress, setProgress] = useState(0) // 0-100
  const [paused, setPaused] = useState(false)
  const progressStartRef = useRef<number>(0)
  const progressElapsedRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const prevStoryIdRef = useRef<string>('')

  /* ---- audio ---- */
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioMuted, setAudioMuted] = useState(true) // muted by default

  /* ---- video ---- */
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoDuration, setVideoDuration] = useState<number>(0)

  /* ---- view tracking ---- */
  const viewedSet = useRef<Set<string>>(new Set())

  /* ---- gesture state ---- */
  const pointerState = useRef<{
    startX: number
    startY: number
    startTime: number
    isDragging: boolean
    isHolding: boolean
    holdTimer: ReturnType<typeof setTimeout> | null
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
    isHolding: false,
    holdTimer: null,
  })
  const [dismissY, setDismissY] = useState(0)
  const [isDismissing, setIsDismissing] = useState(false)

  /* ---- keep onClose in a ref for stable access in callbacks ---- */
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const handleDeleteStory = async () => {
    if (!currentStory) return
    if (!confirm('Are you sure you want to delete this story?')) return
    try {
      const res = await fetch(`/api/stories/${currentStory.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Story deleted')
        onCloseRef.current()
      } else {
        toast.error('Failed to delete story')
      }
    } catch {
      toast.error('Failed to delete story')
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Duration for current story                                       */
  /* ---------------------------------------------------------------- */
  const storyDuration = useMemo(() => {
    if (!currentStory) return IMAGE_DURATION
    if (currentStory.mediaType === 'VIDEO' && videoDuration > 0) {
      return videoDuration * 1000
    }
    return IMAGE_DURATION
  }, [currentStory, videoDuration])

  /* ---------------------------------------------------------------- */
  /*  Navigate helpers                                                 */
  /* ---------------------------------------------------------------- */
  const goTo = useCallback(
    (flatIndex: number) => {
      if (flatIndex < 0) {
        const prevUserIdIdx = userIds.indexOf(currentStory?.user.id ?? '') - 1
        if (prevUserIdIdx < 0) {
          onCloseRef.current()
          return
        }
        const prevUserStories = userGroups.get(userIds[prevUserIdIdx]) ?? []
        setCurrentIndex(flatIndexOf(stories, userIds[prevUserIdIdx]) + prevUserStories.length - 1)
      } else if (flatIndex >= stories.length) {
        onCloseRef.current()
        return
      } else {
        setCurrentIndex(flatIndex)
      }
    },
    [stories, userIds, userGroups, currentStory]
  )

  const goNext = useCallback(() => goTo(currentIndex + 1), [goTo, currentIndex])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [goTo, currentIndex])

  /* ---------------------------------------------------------------- */
  /*  Track views                                                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!currentStory) return
    if (viewedSet.current.has(currentStory.id)) return
    viewedSet.current.add(currentStory.id)

    if (currentUser) {
      fetch(`/api/stories/${currentStory.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'view',
          userId: currentUser.id,
          fullName: currentUser.fullName,
          avatarUrl: currentUser.avatarUrl || null
        }),
      }).catch(() => {
        // silent fail
      })
    }
  }, [currentStory, currentUser])

  /* ---------------------------------------------------------------- */
  /*  Progress bar timer                                               */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!currentStory) return

    // Reset progress when the story changes
    const storyChanged = prevStoryIdRef.current !== currentStory.id
    if (storyChanged) {
      prevStoryIdRef.current = currentStory.id
      // Resetting progress when story changes is intentional —
      // this is a state sync with the external animation system
       
      setProgress(0)
      progressElapsedRef.current = 0
      progressStartRef.current = 0
    }

    if (paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const duration =
      currentStory.mediaType === 'VIDEO' && videoDuration > 0
        ? videoDuration * 1000
        : IMAGE_DURATION

    if (progressStartRef.current === 0) {
      progressStartRef.current = performance.now() - progressElapsedRef.current
    }

    const tick = (now: number) => {
      const elapsed = now - progressStartRef.current
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)
      progressElapsedRef.current = elapsed

      if (pct >= 100) {
        setCurrentIndex((prev) => {
          const next = prev + 1
          if (next >= stories.length) {
            setTimeout(() => onCloseRef.current(), 0)
          }
          return next
        })
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [currentIndex, paused, currentStory, stories.length, videoDuration])

  /* ---------------------------------------------------------------- */
  /*  Audio management                                                 */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!currentStory?.music) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      return
    }

    const audio = audioRef.current ?? new Audio()
    audioRef.current = audio
    audio.src = currentStory.music.audioUrl
    audio.loop = true
    audio.volume = audioMuted ? 0 : 1

    if (!paused) {
      audio.play().catch(() => {})
    }
  }, [currentStory, audioMuted, paused])

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return
    if (paused) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => {})
    }
  }, [paused])

  // Sync mute
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = audioMuted ? 0 : 1
  }, [audioMuted])

  /* ---------------------------------------------------------------- */
  /*  Video management                                                 */
  /* ---------------------------------------------------------------- */
  // Reset video duration when story changes (not in the video effect to avoid set-state-in-effect)
  // Reset video duration when switching away from a VIDEO story.
  // This keeps storyDuration accurate for IMAGE stories.
  useEffect(() => {
    if (currentStory?.mediaType !== 'VIDEO') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVideoDuration(0)
    }
  }, [currentStory])

  useEffect(() => {
    const video = videoRef.current
    if (!video || currentStory?.mediaType !== 'VIDEO') return

    // If there's music, mute the video audio; otherwise unmute
    video.muted = !!currentStory.music
    video.currentTime = 0
    if (!paused) {
      video.play().catch(() => {})
    }

    const handleLoaded = () => {
      setVideoDuration(video.duration)
    }
    const handleEnded = () => {
      goNext()
    }

    video.addEventListener('loadedmetadata', handleLoaded)
    video.addEventListener('ended', handleEnded)
    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded)
      video.removeEventListener('ended', handleEnded)
    }
  }, [currentStory, paused, goNext])

  // Sync video play/pause
  useEffect(() => {
    const video = videoRef.current
    if (!video || currentStory?.mediaType !== 'VIDEO') return
    if (paused) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [paused, currentStory])

  /* ---------------------------------------------------------------- */
  /*  Cleanup on unmount                                               */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [])

  /* ---------------------------------------------------------------- */
  /*  Custom gesture handling                                          */
  /* ---------------------------------------------------------------- */
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('button, a, [role="button"], input')) return

    const state = pointerState.current
    state.startX = e.clientX
    state.startY = e.clientY
    state.startTime = Date.now()
    state.isDragging = false
    state.isHolding = false

    state.holdTimer = setTimeout(() => {
      if (!state.isDragging) {
        state.isHolding = true
        setPaused(true)
      }
    }, HOLD_THRESHOLD_MS)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    const state = pointerState.current
    const dx = e.clientX - state.startX
    const dy = e.clientY - state.startY

    if (!state.isDragging && Math.abs(dy) > DRAG_THRESHOLD_PX && Math.abs(dy) > Math.abs(dx)) {
      state.isDragging = true
      if (state.holdTimer) {
        clearTimeout(state.holdTimer)
        state.holdTimer = null
      }
      if (state.isHolding) {
        state.isHolding = false
        setPaused(false)
      }
    }

    if (state.isDragging && dy > 0) {
      setDismissY(dy)
    }
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const state = pointerState.current

      if (state.holdTimer) {
        clearTimeout(state.holdTimer)
        state.holdTimer = null
      }

      if (state.isHolding) {
        state.isHolding = false
        setPaused(false)
        return
      }

      if (state.isDragging) {
        const dy = e.clientY - state.startY
        if (dy > 120) {
          setIsDismissing(true)
          onCloseRef.current()
        } else {
          setDismissY(0)
        }
        return
      }

      // Tap — navigate based on x position
      const containerWidth = window.innerWidth
      const x = e.clientX
      if (x < containerWidth / 2) {
        goPrev()
      } else {
        goNext()
      }
    },
    [goNext, goPrev]
  )

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    const state = pointerState.current
    if (state.holdTimer) {
      clearTimeout(state.holdTimer)
      state.holdTimer = null
    }
    if (state.isHolding) {
      state.isHolding = false
      setPaused(false)
    }
    setDismissY(0)
  }, [])

  /* ---------------------------------------------------------------- */
  /*  Edge cases                                                       */
  /* ---------------------------------------------------------------- */
  if (!stories.length || !currentStory) return null

  /* ---------------------------------------------------------------- */
  /*  Time ago                                                         */
  /* ---------------------------------------------------------------- */
  const timeAgo = formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })

  /* ---------------------------------------------------------------- */
  /*  Avatar fallback                                                  */
  /* ---------------------------------------------------------------- */
  const avatarInitial = currentStory.user.fullName?.charAt(0)?.toUpperCase() || '?'
  const avatarSrc =
    currentStory.user.avatarUrl ||
    `data:image/svg+xml,${encodeURIComponent(
      `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="32" fill="#374151"/><text x="32" y="38" text-anchor="middle" fill="#D4AF37" font-size="22">${avatarInitial}</text></svg>`
    )}`

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <AnimatePresence>
      <motion.div
        key="story-viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: dismissY }}
        exit={{
          opacity: 0,
          y: isDismissing ? dismissY : 300,
          scale: isDismissing ? 0.9 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-[99999] w-screen h-[100dvh] bg-black overflow-hidden flex flex-col touch-none pointer-events-auto"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* ---- Media Layer ---- */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!currentStory?.mediaUrl ? (
            <div className="flex flex-col items-center justify-center text-white/50 p-6 text-center">
              <span className="text-4xl mb-2">📷</span>
              <p className="text-sm font-medium">Story media is unavailable</p>
            </div>
          ) : currentStory.mediaType === 'IMAGE' ? (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.title || 'Story'}
              className="w-full h-full object-contain"
              draggable={false}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800'
              }}
            />
          ) : (
            <video
              key={currentStory.id}
              ref={videoRef}
              src={currentStory.mediaUrl}
              className="w-full h-full object-contain"
              playsInline
              muted={!!currentStory.music}
              style={{ backgroundColor: '#000' }}
            />
          )}
        </div>

        {/* ---- Desktop Navigation Arrows ---- */}
        <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 pointer-events-none z-[60]">
          <button 
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="pointer-events-auto p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="pointer-events-auto p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* ---- Header Gradient ---- */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            {/* ---- Progress Bars ---- */}
            <div className="flex gap-[2px] px-3 pt-2 pb-1">
              {currentUserStories.map((s, i) => {
                const isCompleted = i < indexInUserGroup
                const isCurrent = i === indexInUserGroup
                return (
                  <div
                    key={s.id}
                    className="h-[3px] flex-1 rounded-full overflow-hidden bg-white/30"
                  >
                    {(isCurrent || isCompleted) && (
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: isCompleted ? '100%' : `${progress}%`,
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* ---- Header Info ---- */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar */}
                <img
                  src={avatarSrc}
                  alt={currentStory.user.fullName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white/30"
                />
                {/* Name + time */}
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate leading-tight">
                    {currentStory.user.fullName}
                  </p>
                  <p className="text-white/60 text-[11px] leading-tight">{timeAgo}</p>
                </div>
                {/* Premium badge */}
                {currentStory.isPremium && (
                  <span className="text-[10px] bg-gradient-to-r from-[#D4AF37] to-[#FDB931] text-black font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                    ★
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentUser?.id === currentStory.user.id && (
                  <div className="flex items-center gap-2 mr-1">
                    <div className="flex items-center gap-1 text-white/90 bg-black/40 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Eye className="w-3 h-3" />
                      <span>{currentStory.viewsCount}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPaused(true)
                        handleDeleteStory()
                        setPaused(false)
                      }}
                      className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors flex-shrink-0"
                      aria-label="Delete story"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseRef.current()
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Close story viewer"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Story Text/Caption ---- */}
        {currentStory.text && (
          <div className="absolute bottom-32 left-0 right-0 z-[15] px-6 py-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
            <p className="text-white text-sm font-semibold text-center select-none drop-shadow-md break-words max-w-lg mx-auto leading-relaxed">
              {currentStory.text}
            </p>
          </div>
        )}

        {/* ---- Call to Action Link ---- */}
        {currentStory.ctaLink && (
          <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center pointer-events-auto">
            <a
              href={currentStory.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#4169E1] hover:bg-[#3156c4] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <span>Visit Link</span>
              <span className="text-[10px]">🔗</span>
            </a>
          </div>
        )}

        {/* ---- Bottom Gradient & Interactions ---- */}
        <div className="absolute bottom-0 left-0 w-full p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 to-transparent z-50 pointer-events-none flex flex-col gap-3">
          
          <div className="pointer-events-auto flex items-end justify-between gap-3">
            {/* Music Pill */}
            <div className="min-w-0 flex-1">
              {currentStory.music && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 max-w-full border border-white/10"
                >
                  <motion.span
                    animate={
                      !paused ? { rotate: [0, 15, -15, 0] } : { rotate: 0 }
                    }
                    transition={
                      !paused
                        ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                        : {}
                    }
                    className="flex-shrink-0"
                  >
                    <Music className="w-3.5 h-3.5 text-white" />
                  </motion.span>
                  <span className="text-white text-xs truncate font-medium">
                    {currentStory.music.name}
                    {currentStory.music.artist && (
                      <span className="text-white/60">
                        {' '}
                        · {currentStory.music.artist}
                      </span>
                    )}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Mute/Unmute */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAudioMuted((m) => !m)
              }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors flex-shrink-0"
              aria-label={audioMuted ? 'Unmute' : 'Mute'}
            >
              {audioMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
 
          {/* Owner Details Swipe Up Indicator */}
          {currentUser?.id === currentStory.user.id ? (
            <div className="pointer-events-auto flex justify-center mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPaused(true)
                  setShowCommentsDrawer(true)
                }}
                className="flex flex-col items-center gap-0.5 text-white/70 hover:text-white transition-colors group cursor-pointer"
              >
                <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">
                  👁️ {localViewers.length} Views · 💬 {localReplies.length} Replies
                </span>
              </button>
            </div>
          ) : (
            /* Viewer Reply Input */
            <div 
              className="pointer-events-auto flex items-center gap-3 w-full max-w-lg mx-auto relative z-[99999]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex-1 relative flex items-center">
                <input 
                  type="text" 
                  placeholder={`Reply to ${currentStory.user.fullName.split(' ')[0]}...`}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-black/40 hover:bg-black/55 focus:bg-black/70 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 rounded-full py-3 pl-5 pr-12 outline-none transition-all text-xs font-semibold"
                  onFocus={() => setPaused(true)}
                  onBlur={() => {
                    if (!showCommentsDrawer) setPaused(false)
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleReplySubmit()
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReplySubmit()
                  }}
                  disabled={!commentInput.trim()}
                  className="absolute right-3 p-1.5 rounded-full bg-[#4169E1] text-white hover:bg-opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleLikeClick}
                className={`p-3 rounded-full backdrop-blur-md border transition-all ${
                  isLiked 
                    ? 'bg-red-500/20 border-red-500/50 text-red-500 scale-110' 
                    : 'bg-black/40 hover:bg-black/55 border-white/20 text-white hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* ---- Paused Indicator ---- */}
        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-full p-4">
                <Pause className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Comments/Views Slide-up Drawer ---- */}
        <AnimatePresence>
          {showCommentsDrawer && currentUser?.id === currentStory.user.id && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10 p-5 pb-safe-bottom max-h-[60vh] flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Tabs */}
              <div className="flex flex-col border-b border-white/10 pb-3 mb-4 flex-none gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-extrabold text-base">Story Details</h3>
                  <button
                    onClick={() => {
                      setShowCommentsDrawer(false)
                      setPaused(false)
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setDrawerTab('views')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      drawerTab === 'views'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    👁️ Views ({localViewers.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab('replies')}
                    className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
                      drawerTab === 'replies'
                        ? 'bg-white text-gray-900 shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    💬 Replies ({localReplies.length})
                  </button>
                </div>
              </div>

              {/* Scrollable list */}
              {drawerTab === 'views' ? (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
                  {localViewers.length === 0 ? (
                    <div className="text-center py-10 text-white/40 text-sm">
                      No views yet. Share your story link to get views!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {localViewers.map((v, i) => {
                        const timeStr = v.timestamp ? formatDistanceToNow(new Date(v.timestamp), { addSuffix: true }) : 'just now'
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4169E1] to-[#D4AF37] text-white font-black flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                                {v.avatarUrl ? (
                                  <img src={v.avatarUrl} alt={v.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  v.fullName?.charAt(0).toUpperCase() || 'U'
                                )}
                              </div>
                              <span className="text-white text-xs font-bold truncate max-w-[150px]">{v.fullName}</span>
                            </div>
                            <span className="text-white/40 text-[10px]">{timeStr}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
                  {localReplies.length === 0 ? (
                    <div className="text-center py-10 text-white/40 text-sm">
                      No replies received yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {localReplies.map((r, i) => {
                        const timeStr = r.timestamp ? formatDistanceToNow(new Date(r.timestamp), { addSuffix: true }) : 'just now'
                        return (
                          <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4169E1] to-[#D4AF37] text-white font-bold flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                              {r.avatarUrl ? (
                                <img src={r.avatarUrl} alt={r.fullName} className="w-full h-full object-cover" />
                              ) : (
                                r.fullName?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-white text-xs font-bold truncate">{r.fullName}</span>
                                <span className="text-white/40 text-[10px] flex-shrink-0">{timeStr}</span>
                              </div>
                              <p className="text-white/90 text-xs mt-1 leading-relaxed break-words">{r.text}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
