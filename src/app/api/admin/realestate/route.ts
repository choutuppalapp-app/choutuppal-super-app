export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status === 'approved') where.isApproved = true
    if (status === 'pending') where.isApproved = false
    if (status === 'featured') where.isFeatured = true

    const [listings, total] = await Promise.all([
      db.realEstateListing.findMany({
        where,
        include: {
          user: {
            select: { id: true, fullName: true, phone: true },
          },
          city: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.realEstateListing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching real estate listings:', error)
    return NextResponse.json({
      listings: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    if (!body.listingId || !body.action) {
      return NextResponse.json({ error: 'listingId and action are required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    switch (body.action) {
      case 'approve':
        updateData.isApproved = true
        break
      case 'reject':
        updateData.isApproved = false
        break
      case 'feature':
        updateData.isFeatured = true
        break
      case 'unfeature':
        updateData.isFeatured = false
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const listing = await db.realEstateListing.update({
      where: { id: body.listingId },
      data: updateData,
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error updating real estate listing:', error)
    return NextResponse.json({ error: 'Failed to update real estate listing' }, { status: 500 })
  }
}
