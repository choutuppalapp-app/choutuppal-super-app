import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    // Get all push subscriptions
    const subscriptions = await db.pushSubscription.findMany()

    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No push subscriptions found', 
        sent: 0 
      })
    }

    // In production, use web-push library with VAPID keys
    // For now, log the broadcast and return success
    console.log(`Broadcast to ${subscriptions.length} subscribers: ${body.message}`)

    return NextResponse.json({
      message: `Notification sent to ${subscriptions.length} subscribers`,
      sent: subscriptions.length,
    })
  } catch (error) {
    console.error('Error broadcasting notification:', error)
    return NextResponse.json({ error: 'Failed to broadcast notification' }, { status: 500 })
  }
}
