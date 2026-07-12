'use client'

import { useState } from 'react'
import { X, CheckCircle, Ticket, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemType: 'banner' | 'listing'
  itemName: string
  originalPrice: number
  onSuccess: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  itemId,
  itemType,
  itemName,
  originalPrice,
  onSuccess,
}: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState(0)
  const [amountDue, setAmountDue] = useState(originalPrice)
  const [couponApplied, setCouponApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setApplying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          couponCode: couponCode.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setDiscountPercentage(data.discountPercentage)
        setAmountDue(data.amountDue)
        setCouponApplied(true)
        toast.success('కూపన్ విజయవంతంగా వర్తించబడింది! 🏷️')
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'కూపన్ కోడ్ సరైనది కాదు.')
      }
    } catch (err) {
      console.error(err)
      toast.error('కూపన్ అప్లై చేయడంలో లోపం సంభవించింది.')
    } finally {
      setApplying(false)
    }
  }

  const handleCheckoutSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          couponCode: couponApplied ? couponCode.trim() : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.free) {
          toast.success('ఆర్డర్ విజయవంతంగా పూర్తయింది! 🥳')
          onSuccess()
          onClose()
        } else {
          toast.info(`చెల్లింపు మొత్తం: ₹${data.amountDue}. గేట్‌వే ఓపెన్ అవుతోంది...`)
          onSuccess()
          onClose()
        }
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'చెకౌట్ విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('చెకౌట్ చేయడంలో లోపం సంభవించింది.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-150 p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            సురక్షిత చెల్లింపు (Secure Checkout)
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">కొనుగోలు సమాచారం (Item)</p>
          <p className="text-sm font-extrabold text-gray-800 mt-1">{itemName}</p>
          <div className="flex justify-between items-center mt-3 border-t border-gray-200/60 pt-2 text-xs">
            <span className="text-gray-500">అసలు ధర (Original Price)</span>
            <span className="font-bold text-gray-900">₹{originalPrice}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between items-center mt-1.5 text-xs text-green-600">
              <span>డిస్కౌంట్ (Discount - {discountPercentage}%)</span>
              <span className="font-bold">-₹{(originalPrice * discountPercentage) / 100}</span>
            </div>
          )}
          <div className="flex justify-between items-center mt-2 border-t border-gray-200/60 pt-2 text-sm font-bold">
            <span className="text-gray-800">చెల్లించాల్సిన మొత్తం (Amount Due)</span>
            <span className="text-blue-600">₹{amountDue}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700">కూపన్ కోడ్ ఉందా? (Enter Coupon)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="కూపన్ కోడ్ ఎంటర్ చేయండి"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={couponApplied}
                className="w-full text-xs border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-blue-500 transition disabled:bg-gray-50"
              />
              <Ticket className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={handleApplyCoupon}
              disabled={applying || couponApplied || !couponCode.trim()}
              className="bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {applying ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'కూపన్ వర్తించండి'}
            </button>
          </div>
          {couponApplied && (
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              కూపన్ విజయవంతంగా అప్లై చేయబడింది!
            </p>
          )}
        </div>

        <button
          onClick={handleCheckoutSubmit}
          disabled={submitting}
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-70"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            amountDue === 0 ? 'ఉచితంగా పొందండి' : 'చెల్లింపు చేయండి'
          )}
        </button>
      </div>
    </div>
  )
}
export default CheckoutModal
