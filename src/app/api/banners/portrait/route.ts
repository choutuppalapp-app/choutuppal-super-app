import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    const where: any = {}
    if (!all) {
      where.expiresAt = {
        gt: new Date(),
      }
    }

    const banners = await db.banner.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(banners)
  } catch (error: any) {
    console.error('Error fetching portrait banners in API:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUrl, linkUrl, uploadedBy } = body
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Exactly 24 hours from now
    const banner = await db.banner.create({
      data: {
        imageUrl,
        linkUrl: linkUrl || null,
        uploadedBy: uploadedBy || 'Admin',
        expiresAt,
      },
    })

    return NextResponse.json({ success: true, banner })
  } catch (error: any) {
    console.error('Error creating portrait banner in API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.banner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting portrait banner in API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
