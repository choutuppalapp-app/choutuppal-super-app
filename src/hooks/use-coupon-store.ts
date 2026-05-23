'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCouponCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface CouponState {
  coupons: Coupon[]
  appliedCoupon: AppliedCoupon | null

  // Actions
  addCoupon: (data: Omit<Coupon, 'id' | 'code' | 'currentUsage' | 'createdAt'> & { code?: string }) => Coupon
  updateCoupon: (id: string, data: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  toggleCouponStatus: (id: string) => void
  applyCoupon: (code: string, cartTotal: number) => { success: boolean; error?: string; coupon?: AppliedCoupon }
  removeAppliedCoupon: () => void
  calculateDiscount: (cartTotal: number) => number
  getDiscountedTotal: (cartTotal: number) => number
  generateCode: () => string
}

// ─── Zustand Store with persist middleware ────────────────────────────────────
//
// WHY THIS FIXES THE INFINITE LOOP:
//
// The previous implementation used useSyncExternalStore with localStorage.
// useSyncExternalStore requires getSnapshot to return the SAME reference
// when data hasn't changed. But JSON.parse(localStorage.getItem(...))
// ALWAYS creates new objects, causing React to detect "changed state" and
// re-render infinitely.
//
// Zustand's persist middleware solves this because:
// 1. React state lives in the Zustand store (JavaScript memory), NOT localStorage
// 2. getSnapshot returns a reference to the store's internal state object
// 3. That reference only changes when set() is called with new data
// 4. localStorage is used as a PERSISTENCE layer only — never read during render
// 5. Hydration from localStorage happens asynchronously after first render
//    (no hydration mismatch, no synchronous setState in effect)
//
// Result: Zero infinite loops. Stable references. SSR-safe.

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: [],
      appliedCoupon: null,

      // ─── CRUD Actions ────────────────────────────────────────────────────

      addCoupon: (data) => {
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
        set((state) => ({ coupons: [...state.coupons, newCoupon] }))
        return newCoupon
      },

      updateCoupon: (id, data) => {
        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }))
      },

      deleteCoupon: (id) => {
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }))
      },

      toggleCouponStatus: (id) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        }))
      },

      // ─── Apply / Remove Coupon ──────────────────────────────────────────

      applyCoupon: (code, cartTotal) => {
        const upperCode = code.toUpperCase().trim()
        const allCoupons = get().coupons
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

        // Increment usage count and update both coupons and appliedCoupon atomically
        set({
          coupons: allCoupons.map((c) =>
            c.code === upperCode ? { ...c, currentUsage: c.currentUsage + 1 } : c
          ),
          appliedCoupon: applied,
        })

        return { success: true, coupon: applied }
      },

      removeAppliedCoupon: () => {
        set({ appliedCoupon: null })
      },

      calculateDiscount: (_cartTotal: number) => {
        return get().appliedCoupon?.discountAmount || 0
      },

      getDiscountedTotal: (cartTotal: number) => {
        const discount = get().appliedCoupon?.discountAmount || 0
        return Math.max(0, cartTotal - discount)
      },

      generateCode: () => {
        return generateCouponCode()
      },
    }),
    {
      name: 'choutuppal_coupon_store', // localStorage key
      // Only persist these fields (not the action functions)
      partialize: (state) => ({
        coupons: state.coupons,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
)
