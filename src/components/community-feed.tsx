'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  MessageCircle,
  Crown,
  Heart,
  Share2,
  Camera,
  ShieldCheck,
  Pin,
  Send,
  Loader2,
  X,
  ImagePlus,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

// ─── Types ─────────────────────────────────────────────────────
interface Profile {
  id: string
  bio: string
  avatarUrl: string | null
  coverImageUrl: string | null
  isPublicFigure: boolean
  publicFigureCategory: string | null
  isVerified: boolean
  followersCount: number
  followingCount: number
}

interface Author {
  id: string
  fullName: string
  avatarUrl: string | null
  role: string
  profile: Profile | null
}

interface Post {
  id: string
  authorId: string
  content: string
  mediaUrls: string | null
  likesCount: number
  commentsCount: number
  isPinned: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  author: Author
  _count: {
    comments: number
    likes: number
  }
}

interface CommentData {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  user: Author
}

interface LeaderProfile {
  id: string
  userId: string
  bio: string
  avatarUrl: string | null
  coverImageUrl: string | null
  isPublicFigure: boolean
  publicFigureCategory: string | null
  isVerified: boolean
  followersCount: number
  followingCount: number
  user: {
    id: string
    fullName: string
    avatarUrl: string | null
    role: string
  }
}

// ─── Helpers ───────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`

  return `${Math.floor(days / 365)}y`
}

function parseMediaUrls(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter((u: unknown) => typeof u === 'string')
    return []
  } catch {
    return []
  }
}

function getCategoryLabel(cat: string | null): string {
  switch (cat) {
    case 'POLITICIAN': return 'Politician'
    case 'INFLUENCER': return 'Influencer'
    case 'CELEBRITY': return 'Celebrity'
    case 'GOVT_OFFICIAL': return 'Govt Official'
    default: return 'Leader'
  }
}

function getCategoryColor(cat: string | null): string {
  switch (cat) {
    case 'POLITICIAN': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'INFLUENCER': return 'bg-pink-100 text-pink-700 border-pink-200'
    case 'CELEBRITY': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'GOVT_OFFICIAL': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

// ─── Avatar Component ──────────────────────────────────────────
function UserAvatar({
  author,
  size = 'md',
  onClick,
}: {
  author: Author
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
}) {
  const isPublicFigure = author.profile?.isPublicFigure
  const isVerified = author.profile?.isVerified
  const sizeMap = { sm: 32, md: 40, lg: 48, xl: 72 }
  const px = sizeMap[size]

  return (
    <div className="relative shrink-0" onClick={onClick}>
      <div
        className={`rounded-full overflow-hidden ${
          isPublicFigure
            ? 'ring-2 ring-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.3)]'
            : isVerified
            ? 'ring-2 ring-[#4169E1]'
            : 'ring-1 ring-gray-200'
        }`}
        style={{ width: px, height: px }}
      >
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.fullName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{
              background: isPublicFigure
                ? 'linear-gradient(135deg, #D4AF37, #4169E1)'
                : 'linear-gradient(135deg, #4169E1, #6B8DD6)',
              fontSize: px * 0.4,
            }}
          >
            {author.fullName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {isVerified && (
        <ShieldCheck
          className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full text-[#D4AF37]"
          style={{ width: px * 0.32, height: px * 0.32 }}
        />
      )}
    </div>
  )
}

// ─── Image Grid ────────────────────────────────────────────────
function MediaGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null

  if (urls.length === 1) {
    return (
      <div className="px-4 pb-3">
        <div className="rounded-xl overflow-hidden max-h-80">
          <img
            src={urls[0]}
            alt="Post media"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    )
  }

  if (urls.length === 2) {
    return (
      <div className="px-4 pb-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
        {urls.map((url, i) => (
          <div key={i} className="aspect-square overflow-hidden">
            <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
        ))}
      </div>
    )
  }

  // 3+ images: 2 col grid, first image spans full height if 3
  return (
    <div className="px-4 pb-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
      {urls.slice(0, 4).map((url, i) => (
        <div
          key={i}
          className={`relative overflow-hidden ${
            urls.length === 3 && i === 0 ? 'row-span-2' : ''
          } ${i >= 3 ? 'hidden sm:block' : ''}`}
        >
          <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          {i === 3 && urls.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
              +{urls.length - 4}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Post Card ─────────────────────────────────────────────────
function PostCard({
  post,
  currentUserId,
  onLike,
  onCommentClick,
  onProfileClick,
  expandedComments,
  commentsData,
  commentsLoading,
  commentText,
  onCommentTextChange,
  onSubmitComment,
  onShare,
}: {
  post: Post
  currentUserId: string | null
  onLike: (postId: string, currentlyLiked: boolean) => void
  onCommentClick: (postId: string) => void
  onProfileClick: (userId: string, isLeader?: boolean) => void
  expandedComments: boolean
  commentsData: CommentData[]
  commentsLoading: boolean
  commentText: string
  onCommentTextChange: (text: string) => void
  onSubmitComment: () => void
  onShare: (postId: string) => void
}) {
  const [localLiked, setLocalLiked] = useState(false)
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount || post._count?.likes || 0)
  const [likeAnimating, setLikeAnimating] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const isPublicFigure = post.author.profile?.isPublicFigure
  const isVerified = post.author.profile?.isVerified
  const mediaUrls = parseMediaUrls(post.mediaUrls)
  const commentInputRef = useRef<HTMLInputElement>(null)

  // Fetch like status on mount
  useEffect(() => {
    if (!currentUserId) return
    fetch(`/api/social/likes?postId=${post.id}&userId=${currentUserId}`)
      .then((res) => res.ok ? res.json() : { liked: false })
      .then((data) => setLocalLiked(data.liked === true))
      .catch(() => {})
  }, [post.id, currentUserId])

  const handleLike = () => {
    if (!currentUserId) return
    // Optimistic update
    setLocalLiked(!localLiked)
    setLocalLikesCount((c) => localLiked ? c - 1 : c + 1)
    setLikeAnimating(true)
    setTimeout(() => setLikeAnimating(false), 400)
    onLike(post.id, localLiked)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUserId) return
    setSubmittingComment(true)
    await onSubmitComment()
    setSubmittingComment(false)
  }

  const handleCommentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitComment()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl overflow-hidden"
    >
      {/* Pinned indicator */}
      {post.isPinned && (
        <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 px-4 py-1.5 flex items-center gap-1.5">
          <Pin className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-xs font-medium text-[#D4AF37]">Pinned</span>
        </div>
      )}

      {/* Author row */}
      <div className="p-4 flex items-center gap-3">
        <UserAvatar author={post.author} onClick={() => onProfileClick(post.author.id, post.author.profile?.publicFigureCategory === 'POLITICIAN' || post.author.profile?.publicFigureCategory === 'GOVT_OFFICIAL')} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onProfileClick(post.author.id, post.author.profile?.publicFigureCategory === 'POLITICIAN' || post.author.profile?.publicFigureCategory === 'GOVT_OFFICIAL')}
              className="text-sm font-semibold text-gray-900 hover:underline truncate"
            >
              {post.author.fullName}
            </button>
            {isPublicFigure && (
              <Crown className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            )}
            {isVerified && !isPublicFigure && (
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            )}
            {isPublicFigure && post.author.profile?.publicFigureCategory && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${getCategoryColor(
                  post.author.profile.publicFigureCategory
                )}`}
              >
                {getCategoryLabel(post.author.profile.publicFigureCategory)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Media */}
      <MediaGrid urls={mediaUrls} />

      {/* Action Bar */}
      <div className="px-4 py-2.5 border-t border-white/20 flex items-center gap-1">
        <button
          onClick={handleLike}
          disabled={!currentUserId}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
            localLiked
              ? 'text-red-500 bg-red-50/50'
              : 'text-gray-500 hover:text-red-500 hover:bg-red-50/30'
          } ${likeAnimating ? 'scale-110' : 'scale-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Heart
            className={`w-[18px] h-[18px] transition-transform ${likeAnimating ? 'scale-125' : ''} ${
              localLiked ? 'fill-red-500' : ''
            }`}
          />
          <span className="font-medium">{localLikesCount > 0 ? localLikesCount : ''}</span>
        </button>

        <button
          onClick={() => onCommentClick(post.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-[#4169E1] hover:bg-blue-50/30 transition-all text-sm"
        >
          <MessageCircle className="w-[18px] h-[18px]" />
          <span className="font-medium">{post.commentsCount || post._count?.comments || 0}</span>
        </button>

        <button
          onClick={() => onShare(post.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all text-sm ml-auto"
        >
          <Share2 className="w-4 h-4" />
          <span className="font-medium text-xs">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {expandedComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/20 bg-white/20">
              {/* Comments list */}
              <div className="max-h-64 overflow-y-auto">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                  </div>
                ) : commentsData.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-400">
                    No comments yet. Be the first!
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {commentsData.map((comment) => (
                      <div key={comment.id} className="px-4 py-3 flex gap-2.5">
                        <UserAvatar author={comment.user} size="sm" onClick={() => onProfileClick(comment.user.id, comment.user.profile?.publicFigureCategory === 'POLITICIAN' || comment.user.profile?.publicFigureCategory === 'GOVT_OFFICIAL')} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onProfileClick(comment.user.id, comment.user.profile?.publicFigureCategory === 'POLITICIAN' || comment.user.profile?.publicFigureCategory === 'GOVT_OFFICIAL')}
                              className="text-xs font-semibold text-gray-900 hover:underline"
                            >
                              {comment.user.fullName}
                            </button>
                            {comment.user.profile?.isVerified && (
                              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                            )}
                          </div>
                          <p className="text-xs text-gray-700 mt-0.5 leading-relaxed break-words">
                            {comment.content}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(comment.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comment input */}
              {currentUserId && (
                <div className="px-4 py-3 border-t border-white/20 flex items-center gap-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentText}
                    onChange={(e) => onCommentTextChange(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                    placeholder="Write a comment..."
                    className="flex-1 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 placeholder:text-gray-400 text-gray-800"
                    disabled={submittingComment}
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submittingComment}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all shrink-0"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Leader Card ───────────────────────────────────────────────
function LeaderCard({
  leader,
  currentUserId,
  onProfileClick,
}: {
  leader: LeaderProfile
  currentUserId: string | null
  onProfileClick: (userId: string, isLeader?: boolean) => void
}) {
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const isVerified = leader.isVerified
  const category = leader.publicFigureCategory

  // Check follow status on mount
  useEffect(() => {
    if (!currentUserId || currentUserId === leader.userId) return
    fetch(`/api/social/follows?followerId=${currentUserId}&followingId=${leader.userId}`)
      .then((res) => res.ok ? res.json() : { following: false })
      .then((data) => setFollowing(data.following === true))
      .catch(() => {})
  }, [leader.userId, currentUserId])

  const handleFollow = async () => {
    if (!currentUserId || currentUserId === leader.userId) return
    setFollowLoading(true)
    try {
      const res = await fetch('/api/social/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUserId, followingId: leader.userId }),
      })
      if (res.ok) {
        const data = await res.json()
        setFollowing(data.following)
      }
    } catch {
      // Revert on error
      setFollowing((prev) => !prev)
    }
    setFollowLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className="relative" onClick={() => onProfileClick(leader.userId, true)}>
          <div
            className="rounded-full overflow-hidden ring-2 ring-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.25)] cursor-pointer"
            style={{ width: 56, height: 56 }}
          >
            {leader.avatarUrl || leader.user.avatarUrl ? (
              <img
                src={leader.avatarUrl || leader.user.avatarUrl || ''}
                alt={leader.user.fullName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #4169E1)',
                  fontSize: 22,
                }}
              >
                {leader.user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isVerified && (
            <ShieldCheck className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-[#D4AF37] bg-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => onProfileClick(leader.userId, true)}
            className="text-sm font-semibold text-gray-900 hover:underline truncate block"
          >
            {leader.user.fullName}
          </button>
          {category && (
            <span
              className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium mt-0.5 ${getCategoryColor(
                category
              )}`}
            >
              {getCategoryLabel(category)}
            </span>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {leader.followersCount.toLocaleString()} followers
          </p>
        </div>

        {currentUserId && currentUserId !== leader.userId && (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              following
                ? 'bg-white/50 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-red-50/50 hover:text-red-500 hover:border-red-200'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] border-transparent text-white shadow-sm hover:shadow-md'
            }`}
          >
            {followLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : following ? (
              'Following'
            ) : (
              'Follow'
            )}
          </button>
        )}
      </div>

      {leader.bio && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{leader.bio}</p>
      )}
    </motion.div>
  )
}

// ─── Main Community Feed ───────────────────────────────────────
export default function CommunityFeed() {
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const communityTab = useAppStore((s) => s.communityTab)
  const setCommunityTab = useAppStore((s) => s.setCommunityTab)
  const navigateTo = useAppStore((s) => s.navigateTo)
  const setSelectedProfileUserId = useAppStore((s) => s.setSelectedProfileUserId)
  const setProfileType = useAppStore((s) => s.setProfileType)
  const { user, isAuthenticated } = useAuth()

  // Feed state
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsPage, setPostsPage] = useState(1)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Comments state (per post)
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null)
  const [commentsData, setCommentsData] = useState<CommentData[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentText, setCommentText] = useState('')

  // Leaders state
  const [leaders, setLeaders] = useState<LeaderProfile[]>([])
  const [leadersLoading, setLeadersLoading] = useState(true)

  // Share toast
  const [shareToast, setShareToast] = useState<string | null>(null)

  // Fetch posts
  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      const res = await fetch(`/api/social/posts?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const newPosts = data.posts || []
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts))
      setHasMorePosts(newPosts.length >= 20)
    } catch {
      // Silent fail — show empty state
    } finally {
      setPostsLoading(false)
    }
  }, [])

  // Fetch leaders
  const fetchLeaders = useCallback(async () => {
    try {
      const res = await fetch('/api/social/profiles?publicFigures=true')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeaders(data.profiles || [])
    } catch {
      // Silent fail
    } finally {
      setLeadersLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    if (communityTab === 'feed') {
      fetchPosts(1)
    } else {
      fetchLeaders()
    }
  }, [communityTab, fetchPosts, fetchLeaders])

  // Create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return
    setPosting(true)
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          content: newPostContent.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPosts((prev) => [data.post, ...prev])
        setNewPostContent('')
      }
    } catch {
      // Silent fail
    }
    setPosting(false)
  }

  // Like toggle
  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return
    try {
      const res = await fetch('/api/social/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id }),
      })
      if (res.ok) {
        const data = await res.json()
        // Update posts state to keep likesCount in sync
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likesCount: data.liked
                    ? p.likesCount + 1
                    : Math.max(0, p.likesCount - 1),
                }
              : p
          )
        )
      }
    } catch {
      // Revert is handled by PostCard local state
    }
  }

  // Load comments for a post
  const handleCommentClick = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null)
      setCommentsData([])
      setCommentText('')
      return
    }

    setExpandedCommentsPostId(postId)
    setCommentsLoading(true)
    setCommentsData([])
    setCommentText('')

    try {
      const res = await fetch(`/api/social/posts/${postId}`)
      if (res.ok) {
        const data = await res.json()
        setCommentsData(data.post?.comments || [])
      }
    } catch {
      // Silent fail
    }
    setCommentsLoading(false)
  }

  // Submit comment
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user || !expandedCommentsPostId) return

    try {
      const res = await fetch('/api/social/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: expandedCommentsPostId,
          userId: user.id,
          content: commentText.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setCommentsData((prev) => [...prev, data.comment])
        setCommentText('')
        // Update comments count in posts
        setPosts((prev) =>
          prev.map((p) =>
            p.id === expandedCommentsPostId
              ? { ...p, commentsCount: p.commentsCount + 1 }
              : p
          )
        )
      }
    } catch {
      // Silent fail
    }
  }

  // Share
  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Choutuppal Community',
        text: 'Check out this post on Choutuppal Community!',
        url: `${window.location.origin}/?post=${postId}`,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/?post=${postId}`).catch(() => {})
      setShareToast(postId)
      setTimeout(() => setShareToast(null), 2500)
    }
  }

  // Remove media URL (removed)
  const handleRemoveMedia = (index: number) => {
    // Removed
  }

  // Profile navigation
  const handleProfileClick = (userId: string, isLeader: boolean = false) => {
    setSelectedProfileUserId(userId)
    setProfileType(isLeader ? 'leader' : 'individual')
    navigateTo(isLeader ? 'leader-profile' : 'individual-profile')
  }

  // Load more posts
  const handleLoadMore = () => {
    const nextPage = postsPage + 1
    setPostsPage(nextPage)
    fetchPosts(nextPage, true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* ── Community Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Community</h1>
            <p className="text-[10px] text-gray-400 -mt-0.5">Choutuppal Social Feed</p>
          </div>
        </div>

        <div className="flex gap-1.5 bg-white/30 backdrop-blur-md p-1 rounded-xl border border-white/30">
          <button
            onClick={() => setCommunityTab('feed')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              communityTab === 'feed'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white shadow-md'
                : 'text-gray-600 hover:bg-white/40'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Feed
          </button>
          <button
            onClick={() => setCommunityTab('leaders')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              communityTab === 'leaders'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white shadow-md'
                : 'text-gray-600 hover:bg-white/40'
            }`}
          >
            <Crown className="w-4 h-4" />
            Leaders
          </button>
        </div>
      </div>

      {/* ── Feed Tab ── */}
      {communityTab === 'feed' && (
        <div className="space-y-4">
          {/* Post Composer */}
          {isAuthenticated && user && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <UserAvatar author={{
                  id: user.id,
                  fullName: user.fullName,
                  avatarUrl: user.avatarUrl || null,
                  role: user.role,
                  profile: null,
                }} />
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="మీ వార్తను పంచుకోండి... / Share with your community..."
                    className="w-full resize-none bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 min-h-[80px]"
                    rows={3}
                  />

                  {/* Action row */}
                  <div className="flex items-center justify-end mt-3">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || posting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {posting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Posting...
                        </span>
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-500">Sign in to share with your community</p>
            </div>
          )}

          {/* Posts Feed */}
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200/60" />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-gray-200/60 rounded" />
                      <div className="h-2 w-12 bg-gray-200/40 rounded mt-1.5" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-gray-200/40 rounded mb-2" />
                  <div className="h-3 w-3/4 bg-gray-200/40 rounded mb-3" />
                  <div className="flex gap-4 pt-2 border-t border-white/20">
                    <div className="h-4 w-12 bg-gray-200/40 rounded" />
                    <div className="h-4 w-12 bg-gray-200/40 rounded" />
                    <div className="h-4 w-12 bg-gray-200/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#4169E1]/20 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No posts yet</h3>
              <p className="text-sm text-gray-500">Be the first to share something with your community!</p>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user?.id || null}
                    onLike={handleLike}
                    onCommentClick={handleCommentClick}
                    onProfileClick={handleProfileClick}
                    expandedComments={expandedCommentsPostId === post.id}
                    commentsData={expandedCommentsPostId === post.id ? commentsData : []}
                    commentsLoading={expandedCommentsPostId === post.id && commentsLoading}
                    commentText={expandedCommentsPostId === post.id ? commentText : ''}
                    onCommentTextChange={setCommentText}
                    onSubmitComment={handleSubmitComment}
                    onShare={handleShare}
                  />
                ))}
              </AnimatePresence>

              {/* Load More */}
              {hasMorePosts && (
                <div className="flex justify-center py-2">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2 rounded-xl bg-white/40 backdrop-blur-xl border border-white/30 text-sm font-medium text-gray-600 hover:bg-white/60 transition-all"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Leaders Tab ── */}
      {communityTab === 'leaders' && (
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-gray-900">Local Leaders</h2>
          </div>

          {leadersLoading ? (
            <div className="space-y-4">
              {/* Horizontal scroll skeleton */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-gray-200/60 ring-2 ring-gray-200/40" />
                    <div className="h-2 w-12 bg-gray-200/60 rounded" />
                  </div>
                ))}
              </div>
              {/* Card skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-200/60" />
                    <div className="flex-1">
                      <div className="h-3 w-28 bg-gray-200/60 rounded" />
                      <div className="h-2 w-16 bg-gray-200/40 rounded mt-2" />
                    </div>
                    <div className="h-8 w-20 bg-gray-200/40 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : leaders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#4169E1]/20 flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No leaders yet</h3>
              <p className="text-sm text-gray-500">Public figures will appear here once verified.</p>
            </motion.div>
          ) : (
            <>
              {/* Horizontal scroll of leader avatars */}
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
                {leaders.map((leader) => (
                  <button
                    key={leader.id}
                    onClick={() => handleProfileClick(leader.userId)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-transform">
                      {leader.avatarUrl || leader.user.avatarUrl ? (
                        <img
                          src={leader.avatarUrl || leader.user.avatarUrl || ''}
                          alt={leader.user.fullName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #D4AF37, #4169E1)',
                            fontSize: 24,
                          }}
                        >
                          {leader.user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 max-w-[64px] truncate">
                      {leader.user.fullName.split(' ')[0]}
                    </span>
                    {leader.publicFigureCategory && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${getCategoryColor(
                          leader.publicFigureCategory
                        )}`}
                      >
                        {getCategoryLabel(leader.publicFigureCategory)}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Full list of leader cards */}
              <div className="space-y-3">
                {leaders.map((leader) => (
                  <LeaderCard
                    key={leader.id}
                    leader={leader}
                    currentUserId={user?.id || null}
                    onProfileClick={handleProfileClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white text-sm px-5 py-2.5 rounded-full shadow-xl"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
