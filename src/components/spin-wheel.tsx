'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, Award, Ticket, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useCouponActions } from '@/hooks/use-coupon-store'
import { useMounted } from '@/hooks/use-mounted'
import { toast } from 'sonner'

interface SpinSegment {
  label: string
  value: number
  color: string
  type: 'coins' | 'coupon' | 'none'
  couponDiscount?: number
}

const SEGMENTS: SpinSegment[] = [
  { label: '5 Coins', value: 5, color: '#D4AF37', type: 'coins' },
  { label: '10% Off', value: 0, color: '#E74C3C', type: 'coupon', couponDiscount: 10 },
  { label: '2 Coins', value: 2, color: '#E8B84B', type: 'coins' },
  { label: '50 Coins', value: 50, color: '#FF6B35', type: 'coins' },
  { label: '25% Off', value: 0, color: '#9B59B6', type: 'coupon', couponDiscount: 25 },
  { label: '20 Coins', value: 20, color: '#8E24AA', type: 'coins' },
  { label: '3 Coins', value: 3, color: '#00897B', type: 'coins' },
  { label: 'Try Again', value: 0, color: '#9E9E9E', type: 'none' },
]

const SEGMENT_COUNT = SEGMENTS.length
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT

export function SpinWheel() {
  const showSpinWheel = useAppStore((s) => s.showSpinWheel)
  const setShowSpinWheel = useAppStore((s) => s.setShowSpinWheel)
  const currentUser = useAppStore((s) => s.currentUser)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const { addCoupon } = useCouponActions()
  const mounted = useMounted()

  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<SpinSegment | null>(null)
  const [wonCouponCode, setWonCouponCode] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wheelDrawn = useRef(false)

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const center = size / 2
    const radius = center - 10

    SEGMENTS.forEach((segment, i) => {
      const startAngle = (i * SEGMENT_ANGLE * Math.PI) / 180
      const endAngle = ((i + 1) * SEGMENT_ANGLE * Math.PI) / 180

      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = segment.color
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + (endAngle - startAngle) / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${size > 300 ? 14 : 11}px sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3
      ctx.fillText(segment.label, radius - 15, 5)
      ctx.restore()
    })

    ctx.beginPath()
    ctx.arc(center, center, 22, 0, 2 * Math.PI)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = '#D4AF37'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#D4AF37'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SPIN', center, center)
  }, [])

  // Draw canvas when dialog opens
  useEffect(() => {
    if (!showSpinWheel || !mounted || wheelDrawn.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const size = Math.min(window.innerWidth - 80, 320)
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      drawWheel(ctx, size)
      wheelDrawn.current = true
    }
  }, [showSpinWheel, mounted, drawWheel])

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Coupon code copied to clipboard!', { description: `Use ${code} at checkout` })
    }).catch(() => {
      toast.info(`Your coupon code: ${code}`)
    })
  }

  const handleSpin = async () => {
    if (isSpinning) return
    if (!currentUser) {
      toast.error('Please login to spin the wheel!')
      return
    }
    
    setIsSpinning(true)
    setResult(null)
    setWonCouponCode(null)

    const winningIndex = Math.floor(Math.random() * SEGMENT_COUNT)
    const winningSegment = SEGMENTS[winningIndex]

    const targetAngle = 360 - winningIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2
    const fullSpins = 5 + Math.floor(Math.random() * 3)
    const totalRotation = fullSpins * 360 + targetAngle

    setRotation((prev) => prev + totalRotation)

    setTimeout(async () => {
      setIsSpinning(false)
      setResult(winningSegment)

      if (winningSegment.type === 'coins' && winningSegment.value > 0) {
        setCurrentUser({
          ...currentUser,
          coinsBalance: (currentUser.coinsBalance || 0) + winningSegment.value,
        })
        toast.success(`You won ${winningSegment.value} coins!`)
      } else if (winningSegment.type === 'coupon' && winningSegment.couponDiscount) {
        const newCoupon = addCoupon({
          discountType: 'percentage',
          discountValue: winningSegment.couponDiscount,
          minimumPurchase: 0,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          maxUsage: 1,
          isActive: true,
          description: `Spin & Win: ${winningSegment.couponDiscount}% off!`,
        })
        setWonCouponCode(newCoupon.code)
        toast.success(`🎉 You won ${winningSegment.couponDiscount}% off coupon!`, {
          description: `Code: ${newCoupon.code} — copied to clipboard!`,
          duration: 5000,
        })
        try { await navigator.clipboard.writeText(newCoupon.code) } catch { /* non-critical */ }
      } else if (winningSegment.type === 'none') {
        toast.info('Better luck next time! Spin again tomorrow.')
      }

      try {
        await fetch('/api/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, result: winningSegment.value }),
        })
      } catch { /* API not available */ }
    }, 4000)
  }

  if (!mounted) {
    return (
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="bg-white border border-gray-200 shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#D4AF37]">
              <Sparkles className="size-5" />
              Spin & Win!
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={showSpinWheel} onOpenChange={setShowSpinWheel}>
      <DialogContent className="bg-white border border-gray-200 shadow-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles className="size-5" />
            Spin & Win!
          </DialogTitle>
          <DialogDescription>
            Spin the wheel to earn coins and discount coupons
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex flex-col items-center py-4">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#D4AF37] drop-shadow-md" />
          </div>

          <div className="relative">
            <div
              className="rounded-full shadow-xl transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
              }}
            >
              <canvas ref={canvasRef} className="rounded-full" />
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#C5A233] hover:to-[#A8882A] text-white font-bold px-8 shadow-lg disabled:opacity-60 active:scale-95 transition-transform"
              size="lg"
            >
              {isSpinning ? 'Spinning...' : 'SPIN NOW'}
            </Button>
          </div>

          {result && !isSpinning && (
            <div className="mt-4 text-center w-full">
              {result.type === 'coins' && result.value > 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-[#4169E1]/10 border border-[#D4AF37]/20">
                  <Award className="size-5 text-[#D4AF37]" />
                  <span className="font-semibold text-gray-800">You won {result.value} coins!</span>
                </div>
              ) : result.type === 'coupon' && wonCouponCode ? (
                <div className="rounded-xl border border-[#E74C3C]/30 bg-gradient-to-r from-[#E74C3C]/5 to-[#9B59B6]/5 p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Ticket className="size-5 text-[#E74C3C]" />
                    <span className="font-bold text-gray-800">{result.couponDiscount}% OFF Coupon!</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <code className="px-3 py-1.5 rounded-lg bg-[#4169E1]/10 text-[#4169E1] font-mono font-bold text-sm tracking-widest">
                      {wonCouponCode}
                    </code>
                    <button
                      onClick={() => handleCopyCoupon(wonCouponCode)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Valid for 7 days · Apply at checkout</p>
                  <Button
                    onClick={() => {
                      setShowSpinWheel(false)
                      toast.info('Apply your coupon on the Pricing Plans section!', { duration: 4000 })
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-[#4169E1] border-[#4169E1]/30 hover:bg-[#4169E1]/5"
                  >
                    Apply on Checkout →
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-medium text-gray-500">Better luck next time!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
