'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Music,
  Upload,
  Image as ImageIcon,
  Video,
  Send,
  Search,
  Play,
  Pause,
  Check,
  ChevronRight,
  Loader2,
  Disc3,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

// ─── Types ────────────────────────────────────────────────────────
interface StoryCreatorProps {
  isOpen: boolean
  onClose: () => void
  cityId: string
  userId: string
  onStoryCreated: () => void
}

interface MusicTrack {
  id: string
  name: string
  artist: string
  audioUrl: string
  genre: string
  duration: number
  isActive: boolean
}

type Step = 1 | 2 | 3

// ─── Helpers ──────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────
export default function StoryCreator({
  isOpen,
  onClose,
  cityId,
  userId,
  onStoryCreated,
}: StoryCreatorProps) {
  // Step management
  const [step, setStep] = useState<Step>(1)

  // Step 1: Media
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE')
  const [videoDurationError, setVideoDurationError] = useState<string | null>(null)

  // Step 2: Music
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null)
  const [musicDrawerOpen, setMusicDrawerOpen] = useState(false)
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [musicSearch, setMusicSearch] = useState('')
  const [musicLoading, setMusicLoading] = useState(false)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 3: Post
  const [title, setTitle] = useState('')
  const [posting, setPosting] = useState(false)

  // Video ref for duration check
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // ─── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
        previewTimeoutRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current.src = ''
        previewAudioRef.current = null
      }
    }
  }, [])

  // Reset all state when modal closes
  const resetState = useCallback(() => {
    setStep(1)
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType('IMAGE')
    setVideoDurationError(null)
    setSelectedTrack(null)
    setMusicDrawerOpen(false)
    setMusicTracks([])
    setMusicSearch('')
    setPlayingTrackId(null)
    setTitle('')
    setPosting(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current)
      previewTimeoutRef.current = null
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current.src = ''
      previewAudioRef.current = null
    }
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  // ─── Step 1: Dropzone ──────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setVideoDurationError(null)

      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')

      if (!isVideo && !isImage) {
        toast.error('Unsupported file type')
        return
      }

      // For video, validate duration
      if (isVideo) {
        const videoUrl = URL.createObjectURL(file)
        const tempVideo = document.createElement('video')
        tempVideo.preload = 'metadata'
        tempVideo.onloadedmetadata = () => {
          URL.revokeObjectURL(tempVideo.src)
          if (tempVideo.duration > 30) {
            setVideoDurationError(
              `Video is ${Math.round(tempVideo.duration)}s long. Maximum is 30 seconds.`
            )
            return
          }
          setVideoDurationError(null)
          setMediaFile(file)
          setMediaType('VIDEO')
          setMediaPreview(videoUrl)
          setStep(2)
        }
        tempVideo.onerror = () => {
          URL.revokeObjectURL(tempVideo.src)
          toast.error('Could not read video file')
        }
        tempVideo.src = videoUrl
      } else {
        const imageUrl = URL.createObjectURL(file)
        setMediaFile(file)
        setMediaType('IMAGE')
        setMediaPreview(imageUrl)
        setStep(2)
      }
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    maxFiles: 1,
    multiple: false,
  })

  // ─── Step 2: Music Library ─────────────────────────────────────
  const fetchMusicTracks = useCallback(async (search?: string) => {
    setMusicLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const res = await fetch(`/api/music-library?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setMusicTracks(Array.isArray(data) ? data : [])
      }
    } catch {
      toast.error('Failed to load music library')
    } finally {
      setMusicLoading(false)
    }
  }, [])

  // Fetch tracks when drawer opens
  useEffect(() => {
    if (musicDrawerOpen) {
      fetchMusicTracks(musicSearch || undefined)
    }
  }, [musicDrawerOpen, musicSearch, fetchMusicTracks])

  // Debounced search
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleMusicSearch = useCallback(
    (value: string) => {
      setMusicSearch(value)
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = setTimeout(() => {
        fetchMusicTracks(value || undefined)
      }, 300)
    },
    [fetchMusicTracks]
  )

  // Play 10-second preview
  const handlePlayPreview = useCallback(
    (track: MusicTrack) => {
      // Clear any existing preview timeout
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
        previewTimeoutRef.current = null
      }

      // Stop current preview
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = ''
      }

      if (playingTrackId === track.id) {
        setPlayingTrackId(null)
        return
      }

      const audio = new Audio(track.audioUrl)
      audio.currentTime = 0
      audio.play().catch(() => {
        toast.error('Could not play audio preview')
        setPlayingTrackId(null)
      })
      audio.onended = () => {
        setPlayingTrackId(null)
        previewTimeoutRef.current = null
      }

      // Stop after 10 seconds
      previewTimeoutRef.current = setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
        audio.src = ''
        setPlayingTrackId(null)
        previewTimeoutRef.current = null
      }, 10000)

      audioRef.current = audio
      setPlayingTrackId(track.id)
    },
    [playingTrackId]
  )

  const handleSelectTrack = useCallback(
    (track: MusicTrack) => {
      // Stop preview audio and timeout
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
        previewTimeoutRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      setPlayingTrackId(null)

      if (selectedTrack?.id === track.id) {
        setSelectedTrack(null)
      } else {
        setSelectedTrack(track)
      }
      setMusicDrawerOpen(false)
    },
    [selectedTrack]
  )

  // ─── Step 3: Preview Audio ─────────────────────────────────────
  useEffect(() => {
    if (step === 3 && selectedTrack) {
      const audio = new Audio(selectedTrack.audioUrl)
      audio.loop = true
      audio.volume = 0.5
      audio.play().catch(() => {
        // Auto-play might be blocked
      })
      previewAudioRef.current = audio
    }

    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause()
        previewAudioRef.current.currentTime = 0
        previewAudioRef.current = null
      }
    }
  }, [step, selectedTrack])

  // ─── Step 3: Post Story ────────────────────────────────────────
  const handlePost = useCallback(async () => {
    if (!mediaFile || !mediaPreview) return

    setPosting(true)
    try {
      // Convert file to data URL
      const mediaUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(mediaFile)
      })

      const body = {
        userId,
        cityId,
        title: title.trim() || 'Untitled Story',
        mediaType,
        mediaUrl,
        musicId: selectedTrack?.id || null,
        musicName: selectedTrack?.name || null,
        isPremium: false,
      }

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success('Story posted!')
        onStoryCreated()
        handleClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to post story')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setPosting(false)
    }
  }, [mediaFile, mediaPreview, userId, cityId, title, mediaType, selectedTrack, onStoryCreated, handleClose])

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[150] bg-black/95 flex flex-col"
        >
          {/* ─── Header ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 z-10">
            <button
              onClick={handleClose}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
              <span className="text-sm font-medium">Cancel</span>
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-8 bg-[#D4AF37]'
                      : s < step
                        ? 'w-4 bg-[#D4AF37]/60'
                        : 'w-4 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && mediaPreview) setStep(2)
                  else if (step === 2) setStep(3)
                }}
                disabled={
                  (step === 1 && !mediaPreview) ||
                  (step === 2 && !mediaPreview)
                }
                className="flex items-center gap-1 text-[#D4AF37] font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-[#FDB931] transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-16" /> // Spacer for step 3
            )}
          </div>

          {/* ─── Content ────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* ─── STEP 1: Media Upload ──────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg mx-auto px-4"
                >
                  {!mediaPreview ? (
                    <div
                      {...getRootProps()}
                      className={`
                        relative border-2 border-dashed rounded-3xl p-8 sm:p-12
                        flex flex-col items-center justify-center gap-6 cursor-pointer
                        transition-all duration-300 min-h-[60vh]
                        ${
                          isDragActive
                            ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.02]'
                            : 'border-white/20 bg-white/5 hover:border-[#D4AF37]/50 hover:bg-white/5'
                        }
                      `}
                    >
                      <input {...getInputProps()} />

                      <motion.div
                        animate={{
                          scale: isDragActive ? 1.1 : 1,
                          y: isDragActive ? -5 : 0,
                        }}
                        className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"
                      >
                        <Upload className="w-8 h-8 text-[#D4AF37]" />
                      </motion.div>

                      <div className="text-center">
                        <p className="text-white text-lg font-semibold mb-1">
                          {isDragActive
                            ? 'Drop it here!'
                            : 'Add to your story'}
                        </p>
                        <p className="text-white/50 text-sm">
                          Drag & drop a photo or video, or tap to browse
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <ImageIcon className="w-4 h-4" />
                          <span>Photos</span>
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <Video className="w-4 h-4" />
                          <span>Videos (max 30s)</span>
                        </div>
                      </div>

                      {videoDurationError && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm text-center"
                        >
                          {videoDurationError}
                        </motion.p>
                      )}
                    </div>
                  ) : (
                    /* Preview after upload */
                    <div className="relative w-full flex flex-col items-center gap-4">
                      <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                        {mediaType === 'VIDEO' ? (
                          <video
                            ref={videoRef}
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
                      <button
                        onClick={() => {
                          setMediaFile(null)
                          setMediaPreview(null)
                          setMediaType('IMAGE')
                        }}
                        className="text-white/60 text-sm hover:text-white transition-colors underline underline-offset-2"
                      >
                        Choose different media
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ─── STEP 2: Add Music ─────────────────────────── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg mx-auto px-4 flex flex-col items-center"
                >
                  {/* Media Preview */}
                  <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                    {mediaType === 'VIDEO' ? (
                      <video
                        src={mediaPreview ?? undefined}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaPreview ?? ''}
                        alt="Story preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Music button overlay */}
                    <button
                      onClick={() => setMusicDrawerOpen(true)}
                      className="absolute top-4 left-1/2 -translate-x-1/2
                        flex items-center gap-2 px-5 py-2.5 rounded-full
                        bg-black/50 backdrop-blur-md border border-white/20
                        text-white font-medium text-sm
                        hover:bg-black/60 hover:border-[#D4AF37]/50
                        transition-all duration-200 shadow-lg"
                    >
                      <Music className="w-4 h-4 text-[#D4AF37]" />
                      Music
                    </button>

                    {/* Selected music pill */}
                    {selectedTrack && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2
                          flex items-center gap-2 px-4 py-2 rounded-full
                          bg-black/50 backdrop-blur-md border border-[#D4AF37]/40
                          text-white text-sm shadow-lg"
                      >
                        <Disc3 className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="max-w-[180px] truncate">
                          🎵 {selectedTrack.name}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    {selectedTrack ? (
                      <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
                        <Check className="w-4 h-4" />
                        <span>{selectedTrack.name} by {selectedTrack.artist}</span>
                        <button
                          onClick={() => setSelectedTrack(null)}
                          className="text-white/40 hover:text-red-400 text-xs ml-2 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm">
                        Tap the 🎵 Music button to add a track
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3: Preview & Post ────────────────────── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg mx-auto px-4 flex flex-col items-center gap-6"
                >
                  {/* Media Preview with Music */}
                  <div className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                    {mediaType === 'VIDEO' ? (
                      <video
                        src={mediaPreview ?? undefined}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={mediaPreview ?? ''}
                        alt="Story preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Music indicator */}
                    {selectedTrack && (
                      <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2
                          flex items-center gap-2 px-4 py-2 rounded-full
                          bg-black/50 backdrop-blur-md border border-[#D4AF37]/40
                          text-white text-sm shadow-lg"
                      >
                        <Disc3 className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="max-w-[180px] truncate">
                          🎵 {selectedTrack.name}
                        </span>
                      </div>
                    )}

                    {/* Audio playing indicator */}
                    {selectedTrack && (
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-[#D4AF37] rounded-full"
                            animate={{
                              height: [4, 12 + Math.random() * 8, 4],
                            }}
                            transition={{
                              duration: 0.6 + i * 0.1,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title Input */}
                  <div className="w-full max-w-sm">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Add a title to your story..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30
                        focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37]/30
                        rounded-xl h-11 px-4"
                      maxLength={100}
                    />
                    <p className="text-white/30 text-xs mt-1.5 text-right">
                      {title.length}/100
                    </p>
                  </div>

                  {/* Post Button */}
                  <motion.button
                    onClick={handlePost}
                    disabled={posting}
                    whileHover={{ scale: posting ? 1 : 1.03 }}
                    whileTap={{ scale: posting ? 1 : 0.97 }}
                    className="w-full max-w-sm py-3.5 rounded-2xl font-semibold text-black
                      bg-gradient-to-r from-[#D4AF37] via-[#FDB931] to-[#D4AF37]
                      shadow-[0_0_25px_rgba(212,175,55,0.4)]
                      hover:shadow-[0_0_35px_rgba(212,175,55,0.6)]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-shadow duration-300 flex items-center justify-center gap-2"
                  >
                    {posting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Post Story
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ─── Music Drawer ─────────────────────────────────────────── */}
      <Drawer
        open={musicDrawerOpen}
        onOpenChange={setMusicDrawerOpen}
      >
        <DrawerContent className="bg-gray-950 border-white/10 max-h-[85vh]">
          <DrawerHeader className="border-b border-white/10 pb-4">
            <DrawerTitle className="text-white text-lg flex items-center gap-2">
              <Music className="w-5 h-5 text-[#D4AF37]" />
              Choose Music
            </DrawerTitle>
            <DrawerDescription className="text-white/40 text-sm">
              Select a track for your story
            </DrawerDescription>
          </DrawerHeader>

          {/* Search */}
          <div className="px-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={musicSearch}
                onChange={(e) => handleMusicSearch(e.target.value)}
                placeholder="Search tracks..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30
                  focus-visible:border-[#D4AF37] focus-visible:ring-[#D4AF37]/30
                  rounded-xl h-10 pl-10"
              />
            </div>
          </div>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] px-4 py-3 space-y-2 custom-scrollbar">
            {musicLoading && musicTracks.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              </div>
            ) : musicTracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No tracks found</p>
              </div>
            ) : (
              musicTracks.map((track) => {
                const isSelected = selectedTrack?.id === track.id
                const isPlaying = playingTrackId === track.id

                return (
                  <motion.button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                          : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                      }
                    `}
                  >
                    {/* Play/Pause Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayPreview(track)
                      }}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                        hover:bg-white/20 transition-colors shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-[#D4AF37]" />
                      ) : (
                        <Play className="w-4 h-4 text-white/70 ml-0.5" />
                      )}
                    </button>

                    {/* Track Info */}
                    <div className="flex-1 text-left min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isSelected ? 'text-[#D4AF37]' : 'text-white'
                        }`}
                      >
                        {track.name}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {track.artist} · {track.genre}
                      </p>
                    </div>

                    {/* Duration & Selection */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-white/30">
                        {formatDuration(track.duration)}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-black" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                )
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-white/10 p-4 flex items-center justify-between">
            <p className="text-white/30 text-xs">
              {selectedTrack
                ? `Selected: ${selectedTrack.name}`
                : 'No track selected'}
            </p>
            <button
              onClick={() => setMusicDrawerOpen(false)}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black font-medium text-sm
                hover:bg-[#FDB931] transition-colors"
            >
              Done
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </AnimatePresence>
  )
}
