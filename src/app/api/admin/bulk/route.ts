export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH — Bulk actions on listings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, listingIds, type } = body // type: 'business' | 'realestate'

    if (!action || !listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: 'action and listingIds[] required' }, { status: 400 })
    }

    switch (action) {
      case 'approve': {
        if (type === 'realestate') {
          await db.realEstateListing.updateMany({
            where: { id: { in: listingIds } },
            data: { isApproved: true },
          })
        } else {
          await db.listing.updateMany({
            where: { id: { in: listingIds } },
            data: { isApproved: true },
          })
        }
        return NextResponse.json({ success: true, count: listingIds.length })
      }
      case 'reject': {
        if (type === 'realestate') {
          await db.realEstateListing.updateMany({
            where: { id: { in: listingIds } },
            data: { isApproved: false },
          })
        } else {
          await db.listing.updateMany({
            where: { id: { in: listingIds } },
            data: { isApproved: false },
          })
        }
        return NextResponse.json({ success: true, count: listingIds.length })
      }
      case 'feature': {
        if (type === 'realestate') {
          await db.realEstateListing.updateMany({
            where: { id: { in: listingIds } },
            data: { isFeatured: true },
          })
        } else {
          await db.listing.updateMany({
            where: { id: { in: listingIds } },
            data: { isFeatured: true },
          })
        }
        return NextResponse.json({ success: true, count: listingIds.length })
      }
      case 'unfeature': {
        if (type === 'realestate') {
          await db.realEstateListing.updateMany({
            where: { id: { in: listingIds } },
            data: { isFeatured: false },
          })
        } else {
          await db.listing.updateMany({
            where: { id: { in: listingIds } },
            data: { isFeatured: false },
          })
        }
        return NextResponse.json({ success: true, count: listingIds.length })
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error bulk updating:', error)
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
  }
}
