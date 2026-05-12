'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Award } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

const SEGMENTS = [
  { label: '5 Coins', value: 5, color: '#D4AF37' },
  { label: '10 Coins', value: 10, color: '#4169E1' },
  { label: '2 Coins', value: 2, color: '#E8B84B' },
  { label: '50 Coins', value: 50, color: '#FF6B35' },
  { label: '1 Coin', value: 1, color: '#7CB342' },
  { label: '20 Coins', value: 20, color: '#8E24AA' },
  { label: '3 Coins', value: 3, color: '#00897B' },
  { label: 'Try Again', value: 0, color: '#9E9E9E' },
]

const SEGMENT_COUNT = SEGMENTS.length
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT

export function SpinWheel() {
  const { showSpinWheel, setShowSpinWheel, currentUser, setCurrentUser, addNotification } =
    useAppStore()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, size: number) => {
      const center = size / 2
      const radius = center - 10

      SEGMENTS.forEach((segment, i) => {
        const startAngle = (i * SEGMENT_ANGLE * Math.PI) / 180
        const endAngle = ((i + 1) * SEGMENT_ANGLE * Math.PI) / 180

        // Draw segment
        ctx.beginPath()
        ctx.moveTo(center, center)
        ctx.arc(center, center, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = segment.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw text
        ctx.save()
        ctx.translate(center, center)
        ctx.rotate(startAngle + ((endAngle - startAngle) / 2))
        ctx.textAlign = 'right'
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `bold ${size > 300 ? 14 : 11}px sans-serif`
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 3
        ctx.fillText(segment.label, radius - 15, 5)
        ctx.restore()
      })

      // Center circle
      ctx.beginPath()
      ctx.arc(center, center, 22, 0, 2 * Math.PI)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 3
      ctx.stroke()

      // Center text
      ctx.fillStyle = '#D4AF37'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('SPIN', center, center)
    },
    []
  )

  // Draw wheel on mount
  const handleCanvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return
      const size = Math.min(window.innerWidth - 80, 320)
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) drawWheel(ctx, size)
    },
    [drawWheel]
  )

  const handleSpin = async () => {
    if (isSpinning) return
    setIsSpinning(true)
    setResult(null)

    // Calculate random result
    const winningIndex = Math.floor(Math.random() * SEGMENT_COUNT)
    const winningSegment = SEGMENTS[winningIndex]

    // Calculate rotation: multiple full spins + landing on winning segment
    // The pointer is at the top (270 degrees or -90 degrees)
    const targetAngle = 360 - winningIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2
    const fullSpins = 5 + Math.floor(Math.random() * 3) // 5-7 full spins
    const totalRotation = fullSpins * 360 + targetAngle

    setRotation((prev) => prev + totalRotation)

    // Wait for spin animation
    setTimeout(async () => {
      setIsSpinning(false)
      setResult(winningSegment.value)

      // Update coins
      if (winningSegment.value > 0 && currentUser) {
        setCurrentUser({
          ...currentUser,
          coinsBalance: currentUser.coinsBalance + winningSegment.value,
        })
        addNotification(`You won ${winningSegment.value} coins!`)
      } else if (winningSegment.value === 0) {
        addNotification('Better luck next time! Spin again tomorrow.')
      }

      // Try API call (non-blocking)
      try {
        await fetch('/api/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: winningSegment.value }),
        })
      } catch {
        // API not available yet, that's fine
      }
    }, 4000)
  }

  return (
    <Dialog open={showSpinWheel} onOpenChange={setShowSpinWheel}>
      <DialogContent className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="size-5" />
            Spin & Win!
          </DialogTitle>
          <DialogDescription>
            Spin the wheel to earn coins and rewards
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex flex-col items-center py-4">
          {/* Pointer */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#D4AF37] drop-shadow-md" />
          </div>

          {/* Wheel */}
          <div className="relative">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
              className="rounded-full shadow-xl"
            >
              <canvas ref={handleCanvasRef} className="rounded-full" />
            </motion.div>
          </div>

          {/* Spin Button */}
          <motion.div whileTap={{ scale: 0.95 }} className="mt-6">
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#C5A233] hover:to-[#A8882A] text-white font-bold px-8 shadow-lg disabled:opacity-60"
              size="lg"
            >
              {isSpinning ? 'Spinning...' : 'SPIN NOW'}
            </Button>
          </motion.div>

          {/* Result */}
          <AnimatePresence>
            {result !== null && !isSpinning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-[#4169E1]/10 border border-[#D4AF37]/20">
                  <Award className="size-5 text-[#D4AF37]" />
                  <span className="font-semibold text-gray-800">
                    {result > 0 ? `You won ${result} coins!` : 'Better luck next time!'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
