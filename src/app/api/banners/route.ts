export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/banners — Fetch banner ads (public: active only; admin: all)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const citySlug = searchParams.get('citySlug')
    const userId = searchParams.get('userId')
    const all = searchParams.get('all') === 'true'

    const where: Record<string, unknown> = {}
    if (!all) {
      where.isActive = true
      where.status = 'APPROVED'
    }
    if (cityId) {
      where.cityId = cityId
    } else if (citySlug) {
      const city = await db.city.findUnique({ where: { slug: citySlug } })
      if (city) {
        where.cityId = city.id
      }
    }
    
    if (userId) where.userId = userId

    const ads = await db.bannerAd.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching banner ads:', error)
    return NextResponse.json([])
  }
}

// POST /api/banners — Create a new banner ad
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, imageUrl, shopName, offerText, linkUrl, cityId, isActive, userId } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const banner = await db.bannerAd.create({
      data: {
        title: title.trim(),
        imageUrl: imageUrl || null,
        shopName: shopName || '',
        offerText: offerText || null,
        linkUrl: linkUrl || null,
        cityId: cityId || null,
        userId: userId || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        status: 'PENDING',
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Error creating banner ad:', error)
    return NextResponse.json({ error: 'Failed to create banner ad' }, { status: 500 })
  }
}

// PUT /api/banners — Update a banner ad
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, imageUrl, shopName, offerText, linkUrl, cityId, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const existing = await db.bannerAd.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.trim()
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null
    if (shopName !== undefined) updateData.shopName = shopName || ''
    if (offerText !== undefined) updateData.offerText = offerText || null
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl || null
    if (cityId !== undefined) updateData.cityId = cityId || null
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const updated = await db.bannerAd.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating banner ad:', error)
    return NextResponse.json({ error: 'Failed to update banner ad' }, { status: 500 })
  }
}

// DELETE /api/banners — Delete a banner ad
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const existing = await db.bannerAd.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    await db.bannerAd.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner ad:', error)
    return NextResponse.json({ error: 'Failed to delete banner ad' }, { status: 500 })
  }
}
