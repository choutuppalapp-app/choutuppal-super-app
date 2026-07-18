'use client'

import { useState, useEffect, useRef } from 'react'
import { Coins, Gift, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import useSWR from 'swr'

interface SpinCampaign {
  id: string
  sponsorName: string
  offerDetails: string
  totalWinners: number
  isActive: boolean
}

const REWARDS = [
  'ఉచిత బిర్యానీ',
  '10% డిస్కౌంట్',
  'ఉచిత కూల్ డ్రింక్',
  '₹50 క్యాష్‌బ్యాక్',
  'మళ్లీ ప్రయత్నించండి',
  'ఉచిత టీ/కాఫీ',
]

const COLORS = [
  '#1e3a8a', // Dark Blue
  '#eab308', // Yellow/Gold
  '#2563eb', // Royal Blue
  '#ca8a04', // Darker Gold
  '#1d4ed8', // Medium Blue
  '#fef08a', // Pale Yellow
]

export default function SpinAndWin() {
  const { isAuthenticated, setShowLoginModal } = useAuth()
  const [spinning, setSpinning] = useState(false)
  const [walletCoins, setWalletCoins] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [rotation, setRotation] = useState(0)
  const [wonReward, setWonReward] = useState<string | null>(null)
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; delay: number }[]>([])

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

  // Fetch active sponsored campaign
  const { data: campaign } = useSWR<SpinCampaign | null>(
    '/api/spin-campaign',
    (url) => fetch(url).then((res) => res.json())
  )

  // Timer countdown
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

  // Confetti trigger
  const triggerConfetti = () => {
    const colors = ['#FFC107', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4', '#4CAF50', '#FFFFFF']
    const newConfetti = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }))
    setConfetti(newConfetti)
    setTimeout(() => setConfetti([]), 6000)
  }

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
      const res = await fetch('/api/spin', { method: 'POST' })

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
      const rewardIndex = data.rewardIndex

      // Calculate target rotation degrees
      const segmentAngle = 60
      const extraAngle = 360 - (rewardIndex * segmentAngle + segmentAngle / 2)
      const targetRotation = rotation + 360 * 5 + extraAngle - (rotation % 360)

      setRotation(targetRotation)

      // Wait for the animation to finish (4s)
      setTimeout(() => {
        setSpinning(false)
        const prize = REWARDS[rewardIndex]
        setWonReward(prize)
        setWalletCoins(data.walletCoins)
        setTimeLeft(24 * 60 * 60 * 1000) // 24-hour lock
        triggerConfetti()
        toast.success(`అభినందనలు! మీరు ${prize} గెలుచుకున్నారు! 🥳`, { duration: 6000 })
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
      <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-sm text-gray-500 font-medium">లోడ్ అవుతోంది...</p>
      </div>
    )
  }

  const sponsor = campaign?.sponsorName || 'చౌటుప్పల్ దర్బార్ బిర్యానీ'

  return (
    <div className="relative w-full md:max-w-none bg-gradient-to-r from-blue-900 to-yellow-500 rounded-2xl md:rounded-3xl p-6 shadow-2xl my-8 overflow-hidden">
      {/* Inline styles for Confetti Rain */}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(600px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation-name: confettiFall;
          animation-timing-function: linear;
        }
      `}</style>

      {/* Confetti Rain Container */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0 w-2.5 h-5 opacity-90 animate-confetti pointer-events-none z-50"
          style={{
            left: `${c.left}%`,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: '3.5s',
            animationIterationCount: 1,
            animationFillMode: 'forwards',
          }}
        />
      ))}

      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main headings */}
      <div className="relative z-10 w-full flex flex-col items-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-md font-telugu">
          ఈ వారపు లక్కీ డ్రా!
        </h2>
        <p className="text-base md:text-lg text-yellow-200 text-center mt-2 font-semibold font-telugu">
          స్పాన్సర్: {sponsor}
        </p>
        <p className="text-white text-center mt-1 text-xs md:text-sm opacity-90 font-telugu">
          స్పిన్ చేయండి - ఉచిత బహుమతులు గెలుచుకోండి!
        </p>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full max-w-4xl mx-auto">
        {/* Spin Wheel Visuals */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center shrink-0">
          {/* Top Pointer */}
          <div className="absolute top-0 z-30 -translate-y-2.5 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-650 filter drop-shadow-md" />
            <div className="w-4 h-4 rounded-full bg-red-700 -mt-1 border-2 border-white" />
          </div>

          {/* The wheel container */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full border-[6px] border-white shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.1,0.8,0.3,1)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              backgroundImage: `conic-gradient(${COLORS.map(
                (color, idx) => `${color} ${idx * 60}deg ${(idx + 1) * 60}deg`
              ).join(', ')})`,
            }}
          >
            {/* Draw Rewards names overlay */}
            {REWARDS.map((val, idx) => {
              const angle = idx * 60 + 30
              return (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-start justify-center origin-center py-2"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div
                    className="text-white font-extrabold text-[8px] sm:text-[9px] font-telugu text-center max-w-[50px] leading-tight select-none"
                    style={{ transform: 'rotate(180deg) translateY(6px)' }}
                  >
                    {val}
                  </div>
                </div>
              )
            })}

            {/* Center hub */}
            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center shadow-lg z-20">
              <Gift className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text descriptions and Action triggers */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left text-white max-w-md">
          <h3 className="text-xl font-black mb-2 font-telugu">భాగస్వామ్యం పొందండి</h3>
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed mb-6 font-telugu">
            స్థానిక వ్యాపారాలు స్పాన్సర్ చేసే ప్రత్యేక బహుమతులు లేదా వోచర్లు పొందడానికి రోజుకు ఒకసారి మాత్రమే స్పిన్ చేసే అవకాశం ఉంటుంది. విజేతల వోచర్లు ప్రొఫైల్ వాలెట్కు పంపబడతాయి.
          </p>

          {/* User coin balance display */}
          {isAuthenticated && (
            <div className="inline-flex items-center justify-center md:justify-start gap-1.5 mb-5 text-xs text-yellow-100 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit mx-auto md:mx-0 border border-white/15">
              <span>మీ వాలెట్ బ్యాలెన్స్:</span>
              <span className="font-bold flex items-center gap-0.5">
                {walletCoins}
                <Coins className="w-3.5 h-3.5 text-yellow-300" />
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="w-full flex flex-col gap-2.5 items-center md:items-start text-black">
            {timeLeft > 0 ? (
              <div className="w-full max-w-xs flex flex-col items-center">
                <button
                  disabled
                  className="w-full bg-white/10 border border-white/20 text-white/50 font-bold py-3 rounded-xl cursor-not-allowed flex items-center justify-center text-xs"
                >
                  తదుపరి స్పిన్ సిద్ధంగా లేదు
                </button>
                <p className="text-xs text-yellow-300 mt-2 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
                  మళ్ళీ స్పిన్ చేయడానికి {formatTime(timeLeft)} వేచి ఉండండి.
                </p>
              </div>
            ) : (
              <button
                onClick={handleSpin}
                disabled={spinning}
                className="w-full max-w-xs bg-white text-blue-900 hover:bg-yellow-400 hover:text-black font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs disabled:opacity-70"
              >
                {spinning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    తిరుగుతోంది...
                  </>
                ) : (
                  'స్పిన్ చేయండి 🎯'
                )}
              </button>
            )}

            {wonReward && !spinning && (
              <p className="text-xs text-yellow-200 font-bold mt-2 animate-bounce font-telugu text-center md:text-left">
                🎉 అభినందనలు! మీరు [{wonReward}] గెలుచుకున్నారు!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
