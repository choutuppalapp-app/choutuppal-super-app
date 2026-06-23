import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import webpush from 'web-push'

// Configure web-push with VAPID keys if they exist in env, otherwise log warning
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@mana.in',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
} else {
  console.warn('VAPID keys not configured for web-push')
}

export async function POST(request: Request) {
  try {
    const { title, body, url } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
    }

    const subscriptions = await prisma.pushSubscription.findMany()

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/'
    })

    const notifications = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      }
      return webpush.sendNotification(pushSubscription, payload).catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription expired or removed
          return prisma.pushSubscription.delete({ where: { id: sub.id } })
        }
        console.error('Push send error:', err)
      })
    })

    await Promise.all(notifications)

    return NextResponse.json({ success: true, count: subscriptions.length })
  } catch (error) {
    console.error('Push Notification Error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
