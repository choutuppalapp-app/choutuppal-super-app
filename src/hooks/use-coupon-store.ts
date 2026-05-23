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

// Custom event names for same-tab notifications
const COUPONS_CHANGED_EVENT = 'choutuppal:coupons-changed'
const APPLIED_CHANGED_EVENT = 'choutuppal:applied-coupon-changed'

// ─── Module-Level Snapshot Cache ─────────────────────────────────────────────
//
// CRITICAL: useSyncExternalStore requires getSnapshot to return the SAME
// reference when the underlying data has not changed. JSON.parse() always
// creates new objects, so we cache the parsed result and only re-parse when
// the raw localStorage string actually changes.

let _couponsRawString: string | null | undefined = undefined
let _couponsParsed: Coupon[] = []

let _appliedRawString: string | null | undefined = undefined
let _appliedParsed: AppliedCoupon | null = null

/**
 * Get coupons from localStorage with referential stability.
 * Returns the same Coupon[] reference if the raw string hasn't changed.
 */
function getCouponsSnapshot(): Coupon[] {
  if (typeof window === 'undefined') return _EMPTY_COUPONS
  const raw = localStorage.getItem(COUPONS_KEY)
  if (raw !== _couponsRawString) {
    _couponsRawString = raw
    try {
      _couponsParsed = raw ? JSON.parse(raw) : []
    } catch {
      _couponsParsed = []
    }
  }
  return _couponsParsed
}

/**
 * Get applied coupon from localStorage with referential stability.
 * Returns the same AppliedCoupon | null reference if the raw string hasn't changed.
 */
function getAppliedCouponSnapshot(): AppliedCoupon | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(APPLIED_COUPON_KEY)
  if (raw !== _appliedRawString) {
    _appliedRawString = raw
    try {
      _appliedParsed = raw ? JSON.parse(raw) : null
    } catch {
      _appliedParsed = null
    }
  }
  return _appliedParsed
}

// ─── Stable Server Snapshots ─────────────────────────────────────────────────
// Must be referentially stable across calls.

const _EMPTY_COUPONS: Coupon[] = []

function getServerCouponsSnapshot(): Coupon[] {
  return _EMPTY_COUPONS
}

function getServerAppliedCouponSnapshot(): AppliedCoupon | null {
  return null
}

// ─── Stable Subscribe Functions ──────────────────────────────────────────────
// Must be referentially stable so useSyncExternalStore doesn't re-subscribe.
// We listen for both:
//   - 'storage' event: fires when OTHER tabs modify localStorage
//   - Custom event: fires when THIS tab modifies localStorage (via our writers)

function subscribeCoupons(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  window.addEventListener(COUPONS_CHANGED_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(COUPONS_CHANGED_EVENT, callback)
  }
}

function subscribeAppliedCoupon(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  window.addEventListener(APPLIED_CHANGED_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(APPLIED_CHANGED_EVENT, callback)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCouponCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 to avoid confusion
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ─── Storage Writers (with cache invalidation + event dispatch) ──────────────

function writeCouponsToStorage(coupons: Coupon[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons))
  // Invalidate the snapshot cache so the next getSnapshot call re-parses
  _couponsRawString = undefined
  // Notify subscribers (same-tab via custom event, cross-tab via storage event)
  window.dispatchEvent(new Event(COUPONS_CHANGED_EVENT))
}

function writeAppliedCouponToStorage(coupon: AppliedCoupon | null): void {
  if (typeof window === 'undefined') return
  if (coupon) {
    localStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(coupon))
  } else {
    localStorage.removeItem(APPLIED_COUPON_KEY)
  }
  // Invalidate the snapshot cache
  _appliedRawString = undefined
  // Notify subscribers
  window.dispatchEvent(new Event(APPLIED_CHANGED_EVENT))
}

// ─── Hook: useCouponStore ─────────────────────────────────────────────────────

export function useCouponStore() {
  // ─── Reactive State via useSyncExternalStore ──────────────────────────────
  //
  // Both getSnapshot functions use module-level caching to return stable
  // references when the underlying localStorage data has not changed.
  // This prevents the infinite loop that occurs when getSnapshot returns
  // a new object on every call.

  const coupons = useSyncExternalStore(
    subscribeCoupons,
    getCouponsSnapshot,
    getServerCouponsSnapshot,
  )

  const appliedCoupon = useSyncExternalStore(
    subscribeAppliedCoupon,
    getAppliedCouponSnapshot,
    getServerAppliedCouponSnapshot,
  )

  // ─── CRUD Actions ─────────────────────────────────────────────────────────
  // These read from localStorage directly (bypassing the cache) to get the
  // latest data, then write back and let the cache invalidation + event
  // dispatch handle reactivity.

  const addCoupon = useCallback((data: Omit<Coupon, 'id' | 'code' | 'currentUsage' | 'createdAt'> & { code?: string }) => {
    const raw = localStorage.getItem(COUPONS_KEY)
    const current: Coupon[] = raw ? JSON.parse(raw) : []
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
    writeCouponsToStorage([...current, newCoupon])
    return newCoupon
  }, [])

  const updateCoupon = useCallback((id: string, data: Partial<Coupon>) => {
    const raw = localStorage.getItem(COUPONS_KEY)
    const current: Coupon[] = raw ? JSON.parse(raw) : []
    writeCouponsToStorage(current.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }, [])

  const deleteCoupon = useCallback((id: string) => {
    const raw = localStorage.getItem(COUPONS_KEY)
    const current: Coupon[] = raw ? JSON.parse(raw) : []
    writeCouponsToStorage(current.filter((c) => c.id !== id))
  }, [])

  const toggleCouponStatus = useCallback((id: string) => {
    const raw = localStorage.getItem(COUPONS_KEY)
    const current: Coupon[] = raw ? JSON.parse(raw) : []
    writeCouponsToStorage(
      current.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    )
  }, [])

  // ─── Apply / Remove Coupon ────────────────────────────────────────────────

  const applyCoupon = useCallback((code: string, cartTotal: number): { success: boolean; error?: string; coupon?: AppliedCoupon } => {
    const upperCode = code.toUpperCase().trim()
    const raw = localStorage.getItem(COUPONS_KEY)
    const allCoupons: Coupon[] = raw ? JSON.parse(raw) : []
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

    // Increment usage count and write back
    writeCouponsToStorage(
      allCoupons.map((c) =>
        c.code === upperCode ? { ...c, currentUsage: c.currentUsage + 1 } : c
      )
    )
    writeAppliedCouponToStorage(applied)

    return { success: true, coupon: applied }
  }, [])

  const removeAppliedCoupon = useCallback(() => {
    writeAppliedCouponToStorage(null)
  }, [])

  const calculateDiscount = useCallback((cartTotal: number): number => {
    const raw = localStorage.getItem(APPLIED_COUPON_KEY)
    try {
      const applied: AppliedCoupon | null = raw ? JSON.parse(raw) : null
      return applied?.discountAmount || 0
    } catch {
      return 0
    }
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
