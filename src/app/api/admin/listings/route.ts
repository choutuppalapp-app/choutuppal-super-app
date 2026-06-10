export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // approved, pending, featured, premium
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status === 'approved') {
      where.isApproved = true
    } else if (status === 'pending') {
      where.isApproved = false
    } else if (status === 'featured') {
      where.isFeatured = true
    } else if (status === 'premium') {
      where.isPremium = true
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
          city: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { reviews: true, leads: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.listing.count({ where }),
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
    console.error('Error fetching admin listings:', error)
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
      return NextResponse.json(
        { error: 'listingId and action are required' },
        { status: 400 }
      )
    }

    const { listingId, action } = body

    const updateData: Record<string, unknown> = {}

    switch (action) {
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
      case 'makePremium':
        updateData.isPremium = true
        break
      case 'removePremium':
        updateData.isPremium = false
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, feature, unfeature, makePremium, removePremium' },
          { status: 400 }
        )
    }

    const listing = await db.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        user: {
          select: { id: true, fullName: true, phone: true },
        },
        city: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error updating listing status:', error)
    return NextResponse.json(
      { error: 'Failed to update listing status' },
      { status: 500 }
    )
  }
}
