import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import webpush from 'web-push'

export const dynamic = 'force-dynamic';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const privateKey = process.env.VAPID_PRIVATE_KEY || ''

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@choutuppal.in',
    publicKey,
    privateKey
  )
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user: sbUser } } = await supabase.auth.getUser()

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 })
    }

    const user = await db.user.findFirst({
      where: { email: sbUser.email },
    })

    if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'city_admin')) {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 })
    }

    const { title, body, url } = await req.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body message' }, { status: 400 })
    }

    const subscriptions = await db.pushSubscription.findMany()

    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: 'No push subscribers found' })
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
    })

    let sentCount = 0
    let failedCount = 0

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        await webpush.sendNotification(pushSubscription, payload)
        sentCount++
      } catch (err: any) {
        console.error('Push notification failed for:', sub.endpoint, err)
        failedCount++

        if (err.statusCode === 410 || err.statusCode === 404) {
          try {
            await db.pushSubscription.delete({
              where: { id: sub.id },
            })
          } catch (deleteErr) {
            console.error('Failed to prune expired subscription:', deleteErr)
          }
        }
      }
    })

    await Promise.all(sendPromises)

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
    })
  } catch (error) {
    console.error('Admin Push API Error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
