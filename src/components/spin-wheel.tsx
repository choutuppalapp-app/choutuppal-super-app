'use client'

import { useState, useEffect, useRef } from 'react'
import { Coins, Gift, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

const REWARDS = [50, 20, 10, 5, 2, 1] // Corresponding to 6 segments of 60deg each
const COLORS = [
  '#4169E1', // Royal Blue
  '#E6C229', // Gold-ish Yellow
  '#3155C1', // Medium Blue
  '#D4AF37', // Gold
  '#25449C', // Dark Royal Blue
  '#F3E5AB', // Pale Yellow
]

export default function SpinWheel() {
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const [spinning, setSpinning] = useState(false)
  const [walletCoins, setWalletCoins] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [wonReward, setWonReward] = useState<number | null>(null)

  const wheelRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch current spin status
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    async function fetchState() {
      try {
        const res = await fetch('/api/spin')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            setWalletCoins(data.walletCoins)
            setTimeLeft(data.timeLeft)
          }
        }
      } catch (err) {
        console.error('Error fetching spin state:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchState()
  }, [isAuthenticated])

  // Timer countdown hook
  useEffect(() => {
    if (timeLeft <= 0) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft])

  // Spin trigger
  const handleSpin = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (spinning || timeLeft > 0) return

    setSpinning(true)
    setWonReward(null)

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        if (res.status === 403 && errorData.timeLeft) {
          setTimeLeft(errorData.timeLeft)
          toast.warning('24 గంటల పరిమితి సక్రియంగా ఉంది.')
        } else {
          toast.error(errorData.error || 'స్పిన్ విఫలమైంది')
        }
        setSpinning(false)
        return
      }

      const data = await res.json()
      const rewardValue = data.reward
      const rewardIndex = REWARDS.indexOf(rewardValue)

      // Calculate target rotation degrees
      // 360 * 5 (5 full spins) + segment offset
      const segmentAngle = 60
      const extraAngle = 360 - (rewardIndex * segmentAngle + segmentAngle / 2)
      const targetRotation = rotation + 360 * 5 + extraAngle - (rotation % 360)
      
      setRotation(targetRotation)

      // Wait for the animation to finish (4s)
      setTimeout(() => {
        setSpinning(false)
        setWonReward(rewardValue)
        setWalletCoins(data.walletCoins)
        setTimeLeft(24 * 60 * 60 * 1000) // Set cooldown lock immediately
        toast.success(`అభినందనలు! మీరు ${rewardValue} కాయిన్స్ గెలుచుకున్నారు! 🥳`, {
          duration: 5000,
        })
      }, 4000)

    } catch (err) {
      console.error('Spin execution error:', err)
      toast.error('సాంకేతిక సమస్య సంభవించింది.')
      setSpinning(false)
    }
  }

  // Format time remaining: HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000)
    const hours = Math.floor(totalSecs / 3600)
    const minutes = Math.floor((totalSecs % 3600) / 60)
    const seconds = totalSecs % 60

    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-sm text-gray-500 font-medium">ఫీచర్‌ లోడ్ అవుతోంది...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-3xl mx-auto my-4 overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl" />

      {/* Left side: The Wheel UI */}
      <div className="relative flex-shrink-0 w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
        {/* Pointer Indicator */}
        <div className="absolute top-0 z-30 -translate-y-2 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 filter drop-shadow-md" />
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 -mt-1 border border-white" />
        </div>

        {/* The Wheel */}
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-[6px] border-white shadow-xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.1,0.8,0.3,1)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            backgroundImage: `conic-gradient(${COLORS.map(
              (color, idx) => `${color} ${idx * 60}deg ${(idx + 1) * 60}deg`
            ).join(', ')})`,
          }}
        >
          {/* Numbers overlay */}
          {REWARDS.map((val, idx) => {
            const angle = idx * 60 + 30
            return (
              <div
                key={idx}
                className="absolute inset-0 flex items-start justify-center origin-center py-2"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <div 
                  className="text-white font-black text-base sm:text-lg flex flex-col items-center filter drop-shadow-sm select-none"
                  style={{
                    transform: 'rotate(180deg) translateY(4px)', // Face numbers outwards nicely
                  }}
                >
                  <span className="leading-none">{val}</span>
                  <Coins className="w-3 h-3 mt-0.5 opacity-90" />
                </div>
              </div>
            )
          })}

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center shadow-lg z-20">
            <Gift className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right side: Texts & Trigger Controls */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <Coins className="w-6 h-6 text-yellow-500 animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            స్పిన్ అండ్ విన్!
          </h2>
        </div>
        
        <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4">
          ప్రతిరోజూ స్పిన్ చేయండి, కాయిన్స్ మరియు రివార్డ్స్ గెలుచుకోండి!
        </p>

        {/* Display Current Coin Balance if Logged In */}
        {isAuthenticated && (
          <div className="inline-flex items-center justify-center md:justify-start gap-1.5 mb-5 text-sm text-gray-700 bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-full w-fit mx-auto md:mx-0">
            <span className="font-medium">మీ వాలెట్ బ్యాలెన్స్:</span>
            <span className="font-bold text-blue-600 flex items-center gap-0.5">
              {walletCoins}
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
            </span>
          </div>
        )}

        {/* Action Button & Lock Info */}
        <div className="w-full flex flex-col gap-2.5 items-center md:items-start">
          {timeLeft > 0 ? (
            <div className="w-full max-w-xs flex flex-col items-center">
              <button
                disabled
                className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl border border-gray-200 cursor-not-allowed flex items-center justify-center gap-1.5 text-sm"
              >
                తదుపరి స్పిన్ సిద్ధంగా లేదు
              </button>
              <p className="text-xs text-red-500 mt-2 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                మళ్ళీ స్పిన్ చేయడానికి {formatTime(timeLeft)} వేచి ఉండండి.
              </p>
            </div>
          ) : (
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              {spinning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  తిరుగుతోంది...
                </>
              ) : (
                'స్పిన్ చేయండి 🎯'
              )}
            </button>
          )}

          {wonReward !== null && !spinning && (
            <p className="text-xs text-green-600 font-bold mt-2 animate-bounce">
              🎉 అభినందనలు! +{wonReward} కాయిన్స్ మీ వాలెట్కు యాడ్ అయ్యాయి!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
