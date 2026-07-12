import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { itemId, itemType, couponCode } = await req.json()

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'itemId and itemType are required' }, { status: 400 })
    }

    const settings = await db.siteSetting.findFirst()
    const paymentsEnabled = settings?.paymentsEnabled ?? false

    let originalPrice = 99 
    if (itemType === 'banner') {
      const banner = await db.bannerAd.findUnique({ where: { id: itemId } })
      if (!banner) {
        return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
      }
      originalPrice = banner.pricePerDay || 99
    } else if (itemType === 'listing') {
      const listing = await db.listing.findUnique({ where: { id: itemId } })
      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      originalPrice = 299 
    } else {
      return NextResponse.json({ error: 'Invalid itemType' }, { status: 400 })
    }

    // 1. Payment disabled (Auto-approve as Free)
    if (!paymentsEnabled) {
      if (itemType === 'banner') {
        await db.bannerAd.update({
          where: { id: itemId },
          data: { status: 'APPROVED', isActive: true },
        })
      } else if (itemType === 'listing') {
        await db.listing.update({
          where: { id: itemId },
          data: { isFeatured: true },
        })
      }

      return NextResponse.json({
        success: true,
        free: true,
        discountPercentage: 100,
        amountDue: 0,
        message: 'Order approved under free early-bird mode.',
      })
    }

    // 2. Payment enabled (Validate coupons)
    let discountPercentage = 0
    let couponApplied = false

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      })

      if (coupon && coupon.isActive) {
        discountPercentage = coupon.discountPercentage
        couponApplied = true
      } else {
        return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 400 })
      }
    }

    const discountAmount = (originalPrice * discountPercentage) / 100
    const finalAmount = Math.max(0, originalPrice - discountAmount)

    // If final amount is 0 due to 100% discount
    if (finalAmount === 0) {
      if (itemType === 'banner') {
        await db.bannerAd.update({
          where: { id: itemId },
          data: { status: 'APPROVED', isActive: true },
        })
      } else if (itemType === 'listing') {
        await db.listing.update({
          where: { id: itemId },
          data: { isFeatured: true },
        })
      }

      return NextResponse.json({
        success: true,
        free: true,
        discountPercentage,
        amountDue: 0,
        message: 'Coupon fully covered the price. Order approved!',
      })
    }

    return NextResponse.json({
      success: true,
      free: false,
      couponApplied,
      discountPercentage,
      amountDue: finalAmount,
      requiresPayment: true,
    })
  } catch (error) {
    console.error('Checkout API Error:', error)
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 })
  }
}
