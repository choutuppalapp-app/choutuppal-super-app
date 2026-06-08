import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import webpush from 'web-push'

// ─── Configure web-push with VAPID keys ───
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      'mailto:contact@choutuppal.in',
      vapidPublicKey,
      vapidPrivateKey
    )
  } catch (error) {
    console.warn('Invalid VAPID keys provided. Push notifications will not work.', error)
  }
} else {
  console.warn('VAPID keys are missing. Push notifications are disabled.')
}

interface SendNotificationPayload {
  title: string
  body: string
  icon?: string
  url?: string
  tag?: string
  /** If provided, send only to this specific subscription endpoint */
  targetEndpoint?: string
}

/**
 * POST /api/push/send-notification
 * Send a push notification to all (or a specific) subscribed devices
 *
 * Body:
 *   - title: string (required)
 *   - body: string (required)
 *   - icon: string (optional, defaults to /icons/icon-192x192.png)
 *   - url: string (optional, URL to open on notification click)
 *   - tag: string (optional, for grouping notifications)
 *   - targetEndpoint: string (optional, send to a specific device only)
 */
export async function POST(request: NextRequest) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'VAPID keys are not configured on the server.' },
        { status: 500 }
      )
    }

    const body: SendNotificationPayload = await request.json()

    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body' },
        { status: 400 }
      )
    }

    // Fetch subscriptions from database
    const where = body.targetEndpoint
      ? { endpoint: body.targetEndpoint }
      : {}

    const subscriptions = await db.pushSubscription.findMany({ where })

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No push subscriptions found.', sent: 0, failed: 0 },
        { status: 404 }
      )
    }

    // Build the push payload
    const payload = JSON.stringify({
      title: body.title,
      body: body.body,
      icon: body.icon || '/icons/icon-192x192.png',
      url: body.url || '/',
      tag: body.tag,
    })

    // Send notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: JSON.parse(sub.keys) as { p256dh: string; auth: string },
        }

        return webpush.sendNotification(pushSubscription, payload)
      })
    )

    // Count successes and failures
    let sent = 0
    let failed = 0
    const invalidEndpoints: string[] = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        sent++
      } else {
        failed++
        // If the subscription is invalid (410 Gone or 404), remove it
        const error = result.reason
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          invalidEndpoints.push(subscriptions[index].endpoint)
        }
      }
    })

    // Clean up invalid subscriptions
    if (invalidEndpoints.length > 0) {
      await db.pushSubscription.deleteMany({
        where: {
          endpoint: { in: invalidEndpoints },
        },
      })
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      cleanedUp: invalidEndpoints.length,
    })
  } catch (error) {
    console.error('[Push Send] Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
