import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/push/subscribe
 * Save a push subscription (endpoint + keys) to the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Missing required fields: endpoint, keys.p256dh, keys.auth' },
        { status: 400 }
      )
    }

    // Check if this endpoint already exists (avoid duplicates)
    const existing = await db.pushSubscription.findFirst({
      where: { endpoint },
    })

    if (existing) {
      // Update the existing subscription with new keys
      await db.pushSubscription.update({
        where: { id: existing.id },
        data: {
          keys: JSON.stringify(keys),
        },
      })
      return NextResponse.json({ success: true, id: existing.id, updated: true })
    }

    // Create new subscription
    const subscription = await db.pushSubscription.create({
      data: {
        endpoint,
        keys: JSON.stringify(keys),
      },
    })

    return NextResponse.json({ success: true, id: subscription.id })
  } catch (error) {
    console.error('[Push Subscribe] Error saving subscription:', error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/push/subscribe
 * Remove a push subscription from the database
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing required field: endpoint' },
        { status: 400 }
      )
    }

    const deleted = await db.pushSubscription.deleteMany({
      where: { endpoint },
    })

    return NextResponse.json({ success: true, deleted: deleted.count })
  } catch (error) {
    console.error('[Push Subscribe] Error removing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    )
  }
}
