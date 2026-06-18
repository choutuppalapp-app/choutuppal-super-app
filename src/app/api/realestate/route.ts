export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const userId = searchParams.get('userId')
    const all = searchParams.get('all') === 'true'

    const where: Record<string, unknown> = {}
    if (!all) where.status = 'APPROVED'
    if (cityId) where.cityId = cityId
    if (userId) where.userId = userId

    const listings = await db.realEstateListing.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        city: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching real estate listings:', error)
    return NextResponse.json({ error: 'Failed to fetch real estate listings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, price, images, ownerPhone, bedroomCount, area, cityId, userId } = body

    if (!title || !price || !ownerPhone || !cityId || !userId || bedroomCount === undefined || bedroomCount === null || !area) {
      return NextResponse.json({ error: 'Missing required fields: title, price, ownerPhone, cityId, userId, bedroomCount, area' }, { status: 400 })
    }

    const listing = await db.realEstateListing.create({
      data: {
        title,
        price,
        images: images ? JSON.stringify(images) : null,
        ownerPhone,
        bedroomCount: bedroomCount ? parseInt(bedroomCount) : null,
        area: area || null,
        cityId,
        userId,
        status: 'PENDING',
        isApproved: false,
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Error creating real estate listing:', error)
    return NextResponse.json({ error: 'Failed to create real estate listing' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, price, images, ownerPhone, bedroomCount, area, cityId, userId } = body

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const existing = await db.realEstateListing.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (price !== undefined) updateData.price = price
    if (images !== undefined) updateData.images = images ? JSON.stringify(images) : null
    if (ownerPhone !== undefined) updateData.ownerPhone = ownerPhone
    if (bedroomCount !== undefined) updateData.bedroomCount = bedroomCount ? parseInt(bedroomCount) : null
    if (area !== undefined) updateData.area = area || null
    if (cityId !== undefined) updateData.cityId = cityId

    const listing = await db.realEstateListing.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error updating real estate listing:', error)
    return NextResponse.json({ error: 'Failed to update real estate listing' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.realEstateListing.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting real estate listing:', error)
    return NextResponse.json({ error: 'Failed to delete real estate listing' }, { status: 500 })
  }
}
