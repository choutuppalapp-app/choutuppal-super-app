import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const banner = await db.bannerAd.findUnique({
      where: { id },
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Increment click counts
    await db.bannerAd.update({
      where: { id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    })

    const targetUrl = banner.linkUrl || '/'
    return NextResponse.redirect(new URL(targetUrl, request.url))
  } catch (error) {
    console.error('Error tracking banner click:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
