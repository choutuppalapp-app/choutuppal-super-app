'use client'

import { useCallback, useSyncExternalStore } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  minimumPurchase: number
  expiryDate: string // ISO date string
  maxUsage: number
  currentUsage: number
  isActive: boolean
  createdAt: string
  description?: string
}

export interface AppliedCoupon {
  code: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  discountAmount: number // actual saved amount
  minimumPurchase: number
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const COUPONS_KEY = 'choutuppal_coupons'
const APPLIED_COUPON_KEY = 'choutuppal_applied_coupon'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCouponCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 to avoid confusion
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function readCouponsFromStorage(): Coupon[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COUPONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCouponsToStorage(coupons: Coupon[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons))
  // Dispatch custom event so other tabs/hooks pick it up
  window.dispatchEvent(new StorageEvent('storage', { key: COUPONS_KEY }))
}

function readAppliedCouponFromStorage(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(APPLIED_COUPON_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeAppliedCouponToStorage(coupon: AppliedCoupon | null): void {
  if (typeof window === 'undefined') return
  if (coupon) {
    localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(coupon))
  } else {
    localStorage.removeItem(APPLIED_COUPON_KEY)
  }
  window.dispatchEvent(new StorageEvent('storage', { key: APPLIED_COUPON_KEY }))
}

// ─── Hook: useCouponStore ─────────────────────────────────────────────────────

export function useCouponStore() {
  // Use useSyncExternalStore for hydration-safe reads
  const coupons = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback)
      return () => window.removeEventListener('storage', callback)
    },
    () => readCouponsFromStorage(),
    () => [] // server snapshot
  )

  const appliedCoupon = useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback)
      return () => window.removeEventListener('storage', callback)
    },
    () => readAppliedCouponFromStorage(),
    () => null // server snapshot
  )

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  const addCoupon = useCallback((data: Omit<Coupon, 'id' | 'code' | 'currentUsage' | 'createdAt'> & { code?: string }) => {
    const current = readCouponsFromStorage()
    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code: data.code?.toUpperCase() || generateCouponCode(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumPurchase: data.minimumPurchase || 0,
      expiryDate: data.expiryDate,
      maxUsage: data.maxUsage || 100,
      currentUsage: 0,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
      description: data.description,
    }
    const updated = [...current, newCoupon]
    writeCouponsToStorage(updated)
    return newCoupon
  }, [])

  const updateCoupon = useCallback((id: string, data: Partial<Coupon>) => {
    const current = readCouponsFromStorage()
    const updated = current.map((c) => (c.id === id ? { ...c, ...data } : c))
    writeCouponsToStorage(updated)
  }, [])

  const deleteCoupon = useCallback((id: string) => {
    const current = readCouponsFromStorage()
    writeCouponsToStorage(current.filter((c) => c.id !== id))
  }, [])

  const toggleCouponStatus = useCallback((id: string) => {
    const current = readCouponsFromStorage()
    const updated = current.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    )
    writeCouponsToStorage(updated)
  }, [])

  // ─── Apply / Remove Coupon ────────────────────────────────────────────────

  const applyCoupon = useCallback((code: string, cartTotal: number): { success: boolean; error?: string; coupon?: AppliedCoupon } => {
    const upperCode = code.toUpperCase().trim()
    const allCoupons = readCouponsFromStorage()
    const coupon = allCoupons.find((c) => c.code === upperCode)

    if (!coupon) {
      return { success: false, error: 'Invalid coupon code' }
    }
    if (!coupon.isActive) {
      return { success: false, error: 'This coupon is no longer active' }
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      return { success: false, error: 'This coupon has expired' }
    }
    if (coupon.currentUsage >= coupon.maxUsage) {
      return { success: false, error: 'This coupon has reached its usage limit' }
    }
    if (coupon.minimumPurchase > 0 && cartTotal < coupon.minimumPurchase) {
      return { success: false, error: `Minimum purchase of ₹${coupon.minimumPurchase} required` }
    }

    // Calculate discount
    let discountAmount: number
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100)
      // Cap at cart total
      if (discountAmount > cartTotal) discountAmount = cartTotal
    } else {
      discountAmount = coupon.discountValue
      if (discountAmount > cartTotal) discountAmount = cartTotal
    }

    const applied: AppliedCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      minimumPurchase: coupon.minimumPurchase,
    }

    // Increment usage
    const updatedCoupons = allCoupons.map((c) =>
      c.code === upperCode ? { ...c, currentUsage: c.currentUsage + 1 } : c
    )
    writeCouponsToStorage(updatedCoupons)
    writeAppliedCouponToStorage(applied)

    return { success: true, coupon: applied }
  }, [])

  const removeAppliedCoupon = useCallback(() => {
    writeAppliedCouponToStorage(null)
  }, [])

  const calculateDiscount = useCallback((cartTotal: number): number => {
    const applied = readAppliedCouponFromStorage()
    if (!applied) return 0
    return applied.discountAmount
  }, [])

  const getDiscountedTotal = useCallback((cartTotal: number): number => {
    const discount = appliedCoupon?.discountAmount || 0
    return Math.max(0, cartTotal - discount)
  }, [appliedCoupon])

  const generateCode = useCallback((): string => {
    return generateCouponCode()
  }, [])

  return {
    coupons,
    appliedCoupon,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    applyCoupon,
    removeAppliedCoupon,
    calculateDiscount,
    getDiscountedTotal,
    generateCode,
  }
}
