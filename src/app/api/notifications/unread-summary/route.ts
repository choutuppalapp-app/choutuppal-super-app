import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const unread = await db.notification.findMany({
      where: { userId, isRead: false },
      select: { type: true, linkUrl: true }
    })

    const summary = {
      my_posts: unread.some(n => n.type === 'COMMENT' || n.type === 'LIKE' || n.type === 'REPLY' || n.linkUrl?.includes('/post/')),
      listings: unread.some(n => n.type === 'REVIEW' || n.linkUrl?.includes('/listing/')),
      stories: unread.some(n => n.linkUrl?.includes('/story/')),
      total: unread.length
    }

    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('Unread summary error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
