import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { endpoint, keys, userId } = data

    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const existing = await prisma.pushSubscription.findFirst({ where: { endpoint } });
    if (existing) {
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          keys: JSON.stringify(keys),
          userId: userId || null
        }
      })
    } else {
      await prisma.pushSubscription.create({
        data: {
          endpoint,
          keys: JSON.stringify(keys),
          userId: userId || null
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push Subscription Error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
