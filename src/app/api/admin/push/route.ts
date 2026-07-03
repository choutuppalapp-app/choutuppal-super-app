import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import webpush from 'web-push'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'



async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get(name: string) { return cookieStore.get(name)?.value } },
    }
  )
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function POST(request: Request) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
    const privateKey = process.env.VAPID_PRIVATE_KEY || ''
    
    if (publicKey && privateKey) {
      webpush.setVapidDetails('mailto:support@choutuppal.in', publicKey, privateKey)
    } else {
      console.warn('VAPID keys not configured, push notifications will fail')
    }

    const sessionUser = await getUser()
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: sessionUser.id } })
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'city_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, message, url } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    const subscriptions = await db.pushSubscription.findMany()

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || '/',
    })

    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as any },
          payload
        ).catch(e => {
          if (e.statusCode === 410 || e.statusCode === 404) {
            return db.pushSubscription.delete({ where: { id: sub.id } })
          }
          throw e
        })
      )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({ success: true, sentCount: successful })
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
