import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic';

async function getUser() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: { get(name: string) { return cookieStore.get(name)?.value } },
      }
    )
    const { data } = await supabase.auth.getUser()
    if (data.user && data.user.email) {
      const user = await db.user.findFirst({
        where: { email: data.user.email },
      })
      return user ? user.id : null
    }
  } catch {
    // Ignore and return null
  }
  return null
}

export async function POST(request: Request) {
  try {
    const userId = await getUser()
    const body = await request.json()
    const { endpoint, keys, p256dh, auth } = body

    const resolvedP256dh = p256dh || keys?.p256dh
    const resolvedAuth = auth || keys?.auth

    if (!endpoint || !resolvedP256dh || !resolvedAuth) {
      return NextResponse.json({ error: 'Endpoint, p256dh and auth keys are required' }, { status: 400 })
    }

    const subscription = await db.pushSubscription.upsert({
      where: { endpoint },
      update: { 
        userId, 
        p256dh: resolvedP256dh, 
        auth: resolvedAuth 
      },
      create: { 
        userId, 
        endpoint, 
        p256dh: resolvedP256dh, 
        auth: resolvedAuth 
      },
    })

    return NextResponse.json({ success: true, subscription })
  } catch (error) {
    console.error('Error saving subscription:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
