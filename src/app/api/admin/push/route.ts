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
    
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'VAPID Keys missing in Vercel Env' }, { status: 500 })
    }
    webpush.setVapidDetails('mailto:admin@choutuppal.in', publicKey, privateKey)

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
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No users subscribed yet. Subscribe on a phone first.' }, { status: 400 })
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || '/',
    })

    let successful = 0;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as any },
          payload
        )
        successful++;
      } catch (e: any) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } })
        } else {
          throw e
        }
      }
    }

    return NextResponse.json({ success: true, sentCount: successful })
  } catch (error: any) {
    console.error('Push Send Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
