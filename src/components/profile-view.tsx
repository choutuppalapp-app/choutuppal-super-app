'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Calendar, Heart, MessageCircle, Users, Settings,
  ShieldCheck, Crown, Plus, Camera, Send, Loader2, X, Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

// ─── Types ─────────────────────────────────────────────────
interface ProfileData {
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
    createdAt: string
  }
}

interface PostData {
  id: string
  authorId: string
  content: string
  mediaUrls: string | null
  likesCount: number
  commentsCount: number
  isPinned: boolean
  createdAt: string
  author: {
    id: string
    fullName: string
    avatarUrl: string | null
    profile: { isPublicFigure: boolean; isVerified: boolean; publicFigureCategory: string | null } | null
  }
  _liked?: boolean
}

// ─── Helpers ────────────────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K'
  return n.toString()
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

const CATEGORY_LABELS: Record<string, string> = {
  POLITICIAN: 'నాయకుడు',
  INFLUENCER: 'Influencer',
  GOVT_OFFICIAL: 'ప్రభుత్వోద్యోగి',
  CELEBRITY: 'Celebrity',
}

// ─── Component ──────────────────────────────────────────────
export function ProfileView() {
  const { selectedProfileUserId, navigateTo, currentUser } = useAppStore()
  const { isAuthenticated, user } = useAuth()

  const isOwnProfile = !selectedProfileUserId || (currentUser && selectedProfileUserId === currentUser.id)
  const profileUserId = isOwnProfile ? currentUser?.id : selectedProfileUserId

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Edit profile dialog
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [editCoverUrl, setEditCoverUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Verification dialog
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verifyCategory, setVerifyCategory] = useState('')
  const [verifyReason, setVerifyReason] = useState('')
  const [verifyIdProof, setVerifyIdProof] = useState('')
  const [submittingVerify, setSubmittingVerify] = useState(false)

  // Create post dialog
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [creatingPost, setCreatingPost] = useState(false)

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!profileUserId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/social/profiles?userId=${profileUserId}`)
      if (res.ok) {
        const data = await res.json()
        const profileData = data.profile || data
        setProfile(profileData)
        setEditBio(profileData.bio || '')
        setEditAvatarUrl(profileData.avatarUrl || '')
        setEditCoverUrl(profileData.coverImageUrl || '')
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [profileUserId])

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!profileUserId) return
    try {
      const res = await fetch(`/api/social/posts?userId=${profileUserId}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch {
      // Non-critical
    }
  }, [profileUserId])

  // Check follow status
  const checkFollowStatus = useCallback(async () => {
    if (!currentUser?.id || !profileUserId || isOwnProfile) return
    try {
      const res = await fetch(`/api/social/follows?followerId=${currentUser.id}&followingId=${profileUserId}`)
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.following === true)
      }
    } catch {
      // Non-critical
    }
  }, [currentUser?.id, profileUserId, isOwnProfile])

  useEffect(() => {
    fetchProfile()
    fetchPosts()
    checkFollowStatus()
  }, [fetchProfile, fetchPosts, checkFollowStatus])

  // ─── Handlers ────────────────────────────────────────────
  const handleFollowToggle = async () => {
    if (!currentUser?.id || !profileUserId) return
    setFollowLoading(true)
    try {
      const res = await fetch('/api/social/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: profileUserId }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.following)
        setProfile(prev => prev ? {
          ...prev,
          followersCount: prev.followersCount + (data.following ? 1 : -1),
        } : prev)
        toast.success(data.following ? 'Following!' : 'Unfollowed')
      }
    } catch {
      toast.error('Failed to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return
    setSavingProfile(true)
    try {
      const res = await fetch('/api/social/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          bio: editBio,
          avatarUrl: editAvatarUrl || undefined,
          coverImageUrl: editCoverUrl || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Profile updated!')
        setShowEditDialog(false)
        fetchProfile()
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSubmitVerification = async () => {
    if (!currentUser?.id || !verifyCategory || !verifyReason) return
    setSubmittingVerify(true)
    try {
      const res = await fetch('/api/social/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          category: verifyCategory,
          reason: verifyReason,
          idProofUrl: verifyIdProof || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Verification request submitted!')
        setShowVerifyDialog(false)
        setVerifyCategory('')
        setVerifyReason('')
        setVerifyIdProof('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit request')
      }
    } catch {
      toast.error('Failed to submit request')
    } finally {
      setSubmittingVerify(false)
    }
  }

  const handleCreatePost = async () => {
    if (!currentUser?.id || !newPostContent.trim()) return
    setCreatingPost(true)
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: currentUser.id, content: newPostContent.trim() }),
      })
      if (res.ok) {
        toast.success('Post created!')
        setShowCreatePost(false)
        setNewPostContent('')
        fetchPosts()
      } else {
        toast.error('Failed to create post')
      }
    } catch {
      toast.error('Failed to create post')
    } finally {
      setCreatingPost(false)
    }
  }

  const handleLikeToggle = async (postId: string, currentlyLiked: boolean, index: number) => {
    if (!currentUser?.id) return
    try {
      const res = await fetch('/api/social/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(prev => prev.map((p, i) =>
          i === index ? { ...p, likesCount: p.likesCount + (data.liked ? 1 : -1), _liked: data.liked } : p
        ))
      }
    } catch {
      // Non-critical
    }
  }

  // ─── Loading State ───────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-gray-200" />
        <div className="px-4 -mt-10">
          <div className="w-20 h-20 rounded-full bg-gray-300" />
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-64 bg-gray-100 rounded" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
        <Button variant="outline" className="mt-3" onClick={() => navigateTo('community')}>Back to Community</Button>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 relative"
    >
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigateTo('community')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="size-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* ─── Profile Card ─────────────────────────────────── */}
      <div className={`bg-white/40 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden ${
        profile.isPublicFigure ? 'border-[#D4AF37]/50' : 'border-white/30'
      }`}>
        {/* Cover */}
        <div className="h-28 md:h-36 relative">
          {profile.coverImageUrl ? (
            <img src={profile.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#D4AF37] via-[#B8962E] to-[#4169E1]" />
          )}
          {/* Public Figure badge on cover */}
          {profile.isPublicFigure && profile.isVerified && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#D4AF37]/90 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
              <Crown className="size-3" />
              {CATEGORY_LABELS[profile.publicFigureCategory || ''] || 'Leader'}
            </div>
          )}
        </div>

        {/* Avatar + Info */}
        <div className="px-4 pb-4">
          <div className="-mt-10 mb-3 flex items-end gap-3">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full overflow-hidden shadow-lg ${
                profile.isPublicFigure ? 'ring-3 ring-[#D4AF37]' : 'ring-2 ring-white'
              }`}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center text-white text-2xl font-bold">
                    {profile.user.fullName.charAt(0)}
                  </div>
                )}
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ShieldCheck className="size-4.5 text-[#D4AF37]" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">{profile.user.fullName}</h2>
            {profile.isVerified && <ShieldCheck className="size-5 text-[#D4AF37] flex-shrink-0" />}
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="size-3.5" />Choutuppal</span>
            <span className="flex items-center gap-1"><Calendar className="size-3.5" />Joined {new Date(profile.user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
            <div className="text-center"><p className="text-lg font-bold text-gray-900">{posts.length}</p><p className="text-[10px] text-gray-400 uppercase tracking-wide">Posts</p></div>
            <div className="text-center"><p className="text-lg font-bold text-gray-900">{formatCount(profile.followersCount)}</p><p className="text-[10px] text-gray-400 uppercase tracking-wide">Followers</p></div>
            <div className="text-center"><p className="text-lg font-bold text-gray-900">{formatCount(profile.followingCount)}</p><p className="text-[10px] text-gray-400 uppercase tracking-wide">Following</p></div>
            <div className="text-center"><p className="text-lg font-bold text-[#D4AF37]">{formatCount(posts.reduce((s, p) => s + p.likesCount, 0))}</p><p className="text-[10px] text-gray-400 uppercase tracking-wide">Likes</p></div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {isOwnProfile ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit3 className="size-4" /> Edit Profile
                </Button>
                {!profile.isPublicFigure && !profile.isVerified && (
                  <Button
                    className="flex-1 gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
                    onClick={() => setShowVerifyDialog(true)}
                  >
                    <ShieldCheck className="size-4" /> Get Verified
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  className={`flex-1 gap-1.5 ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white'
                  }`}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <MessageCircle className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Posts ────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MessageCircle className="size-4 text-[#4169E1]" />
          {isOwnProfile ? 'My Posts' : 'Posts'}
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl p-8 text-center">
            <MessageCircle className="size-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/40 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl overflow-hidden"
                >
                  {/* Pinned indicator */}
                  {post.isPinned && (
                    <div className="px-4 py-1.5 bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 flex items-center gap-1.5 text-xs text-[#D4AF37] font-medium">
                      <Crown className="size-3" /> Pinned Post
                    </div>
                  )}

                  <div className="p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Media */}
                    {post.mediaUrls && (() => {
                      try {
                        const urls = JSON.parse(post.mediaUrls)
                        if (!Array.isArray(urls) || urls.length === 0) return null
                        return (
                          <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {urls.slice(0, 4).map((url: string, i: number) => (
                              <div key={i} className="relative aspect-square">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                {i === 3 && urls.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                                    +{urls.length - 4}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      } catch { return null }
                    })()}

                    {/* Time + Actions */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                      <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeToggle(post.id, post._liked || false, idx)}
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: post._liked ? '#ef4444' : '#9ca3af' }}
                        >
                          <Heart className={`size-4 ${post._liked ? 'fill-current' : ''}`} />
                          {post.likesCount}
                        </button>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MessageCircle className="size-4" />
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ─── FAB: Create Post (own profile only) ──────────── */}
      {isOwnProfile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreatePost(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-auto md:left-1/2 md:ml-80 w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white shadow-2xl shadow-[#D4AF37]/30 flex items-center justify-center z-40"
        >
          <Plus className="size-6" />
        </motion.button>
      )}

      {/* ─── Edit Profile Dialog ──────────────────────────── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
              <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell the community about yourself..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Avatar URL</label>
              <Input value={editAvatarUrl} onChange={e => setEditAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cover Image URL</label>
              <Input value={editCoverUrl} onChange={e => setEditCoverUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white">
              {savingProfile ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Verification Request Dialog ─────────────────── */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#D4AF37]" />
              Apply for Public Figure Badge
            </DialogTitle>
            <DialogDescription>
              Get a verified badge to stand out as a community leader, politician, or influencer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <Select value={verifyCategory} onValueChange={setVerifyCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POLITICIAN">Politician / రాజకీయ నాయకుడు</SelectItem>
                  <SelectItem value="INFLUENCER">Influencer</SelectItem>
                  <SelectItem value="GOVT_OFFICIAL">Government Official / ప్రభుత్వోద్యోగి</SelectItem>
                  <SelectItem value="CELEBRITY">Celebrity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Why should you be verified?</label>
              <Textarea value={verifyReason} onChange={e => setVerifyReason(e.target.value)} placeholder="Explain your role in the community..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">ID Proof URL (optional)</label>
              <Input value={verifyIdProof} onChange={e => setVerifyIdProof(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitVerification}
              disabled={submittingVerify || !verifyCategory || !verifyReason}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white"
            >
              {submittingVerify ? <Loader2 className="size-4 animate-spin mr-1" /> : <ShieldCheck className="size-4 mr-1" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Create Post Dialog ───────────────────────────── */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Share something with the Choutuppal community</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center text-white font-bold text-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-semibold text-gray-800">{user?.fullName || 'User'}</span>
            </div>
            <Textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="మీ వార్తను పంచుకోండి... / Share with your community..."
              rows={4}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#4169E1] transition-colors">
                <Camera className="size-4" /> Photo
              </button>
              <Button
                onClick={handleCreatePost}
                disabled={creatingPost || !newPostContent.trim()}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white gap-1.5"
              >
                {creatingPost ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
