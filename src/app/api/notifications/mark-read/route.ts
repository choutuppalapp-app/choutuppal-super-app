import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    // We should parse the body for userId
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId missing' }, { status: 400 })
    }

    let filterTypes: string[] = []
    let linkUrlFilter: any = undefined

    if (type === 'my_posts') {
      filterTypes = ['COMMENT', 'LIKE', 'REPLY']
    } else if (type === 'listings') {
      filterTypes = ['REVIEW']
    } else if (type === 'stories') {
      // Just mark all stories as read by URL
      linkUrlFilter = { contains: '/story/' }
    }

    await db.notification.updateMany({
      where: {
        userId,
        isRead: false,
        ...(filterTypes.length > 0 && { type: { in: filterTypes } }),
        ...(linkUrlFilter && { linkUrl: linkUrlFilter })
      },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
