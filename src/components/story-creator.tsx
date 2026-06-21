'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────
interface StoryCreatorProps {
  isOpen: boolean
  onClose: () => void
  cityId: string
  userId: string
  onStoryCreated: () => void
}

// ─── Component ────────────────────────────────────────────────────
export default function StoryCreator({
  isOpen,
  onClose,
  cityId,
  userId,
  onStoryCreated,
}: StoryCreatorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE')
  const [caption, setCaption] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [posting, setPosting] = useState(false)

  // When the creator opens, immediately trigger the file picker
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fileInputRef.current?.click()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setMediaPreview(null)
      setMediaFile(null)
      setMediaType('IMAGE')
      setCaption('')
      setCtaLink('')
      setPosting(false)
    }
  }, [isOpen])

  // Handle file picked
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      onClose()
      return
    }

    const isVideo = file.type.startsWith('video/')
    if (isVideo) {
      toast.error('Video uploads are coming soon. Please select an image.')
      onClose()
      return
    }

    const url = URL.createObjectURL(file)
    setMediaFile(file)
    setMediaType('IMAGE')
    setMediaPreview(url)

    e.target.value = ''
  }, [onClose])

  // Post the story
  const handlePost = useCallback(async () => {
    if (!mediaFile || posting) return
    if (!userId) {
      toast.error('Please login to post a story')
      window.location.href = '/login'
      return
    }

    setPosting(true)
    try {
      let finalFile = mediaFile

      // Compress if it's an image
      if (mediaFile.type.startsWith('image/')) {
        try {
          const imageCompression = (await import('browser-image-compression')).default
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            initialQuality: 0.8
          }
          finalFile = await imageCompression(mediaFile, options)
        } catch (compressErr) {
          console.warn('Image compression failed, using original file', compressErr)
        }
      }

      // Generate a unique file path in storage
      const fileExt = mediaFile.name.split('.').pop() || 'jpg'
      const fileName = `story-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload to Supabase Storage
      const { supabase } = await import('@/lib/supabase')
      
      let uploadResult = await supabase.storage
        .from('stories')
        .upload(filePath, finalFile, { cacheControl: '3600', upsert: true })

      let bucketName = 'stories'

      // Fallback 1: story-media bucket
      if (uploadResult.error) {
        console.warn("Upload to 'stories' bucket failed, attempting 'story-media'...", uploadResult.error.message)
        uploadResult = await supabase.storage
          .from('story-media')
          .upload(filePath, finalFile, { cacheControl: '3600', upsert: true })
        bucketName = 'story-media'
      }

      // Fallback 2: listing-images bucket
      if (uploadResult.error) {
        console.warn("Upload to 'story-media' bucket failed, attempting 'listing-images'...", uploadResult.error.message)
        const fallbackPath = `stories/${filePath}`
        uploadResult = await supabase.storage
          .from('listing-images')
          .upload(fallbackPath, finalFile, { cacheControl: '3600', upsert: true })
        bucketName = 'listing-images'
      }

      if (uploadResult.error) {
        throw new Error(`Upload failed for all target buckets: ${uploadResult.error.message}`)
      }

      // Retrieve the public URL
      const finalPath = bucketName === 'listing-images' ? `stories/${filePath}` : filePath
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(finalPath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded story media')
      }

      const mediaUrl = urlData.publicUrl

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cityId,
          text: caption.trim() || null,
          ctaLink: ctaLink.trim() || null,
          mediaType,
          mediaUrl,
          musicId: null,
          musicName: null,
          isPremium: false,
        }),
      })

      if (res.ok) {
        toast.success('Story posted!')
        onStoryCreated()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to post story')
        setPosting(false)
      }
    } catch (err: any) {
      console.error('Story post error:', err)
      toast.error(err.message || 'Something went wrong')
      setPosting(false)
    }
  }, [mediaFile, posting, caption, ctaLink, userId, cityId, mediaType, onStoryCreated, onClose])

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {isOpen && mediaPreview && (
          <motion.div
            key="story-creator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] bg-black flex flex-col"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 pt-4 pb-10 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
              <button
                className="pointer-events-auto p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={onClose}
                aria-label="Cancel"
              >
                <X className="w-7 h-7 text-white" />
              </button>
            </div>

            {/* Media Preview */}
            <div className="absolute inset-0">
              {mediaType === 'VIDEO' ? (
                <video
                  src={mediaPreview}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Bottom Input Area */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-3">
              {/* Optional CTA Link input */}
              <div className="w-full max-w-lg mx-auto">
                <input
                  type="url"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="Add Call-to-Action Link (Optional URL)..."
                  className="w-full bg-black/40 backdrop-blur-md border border-white/20 text-white placeholder:text-white/40 rounded-xl py-2 px-4 outline-none text-xs font-semibold focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full max-w-lg mx-auto">
                {/* Caption Input */}
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  maxLength={200}
                  className="flex-1 bg-black/40 backdrop-blur-md border border-white/25 text-white placeholder:text-white/60 rounded-full py-3 px-5 outline-none text-xs font-semibold focus:border-white/60 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handlePost()
                    }
                  }}
                />

                {/* Send Button */}
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className="flex-shrink-0 w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20c25e] active:bg-[#1dae55] transition-colors flex items-center justify-center shadow-lg shadow-black/40 disabled:opacity-70"
                  aria-label="Post story"
                >
                  {posting ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white translate-x-0.5 -translate-y-0.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
