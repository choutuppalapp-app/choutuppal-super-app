import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { endpoint, p256dh, auth } = await req.json()

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing required subscription fields' }, { status: 400 })
    }

    let resolvedUserId: string | null = null
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
      if (sbUser && sbUser.email) {
        const user = await db.user.findFirst({
          where: { email: sbUser.email },
        })
        if (user) {
          resolvedUserId = user.id
        }
      }
    } catch {
      // Support anonymous subscriptions
    }

    const pushSub = await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: resolvedUserId,
        p256dh,
        auth,
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userId: resolvedUserId,
      },
    })

    return NextResponse.json({ success: true, id: pushSub.id })
  } catch (error) {
    console.error('Push Subscribe API Error:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
