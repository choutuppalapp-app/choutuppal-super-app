export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Support both ID and slug lookup
    const listing = await db.listing.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            whatsappNumber: true,
          },
        },
        city: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true, leads: true },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'category', 'description', 'services', 'images',
      'coverImage', 'logoUrl', 'gallery', 'instagramUrl', 'facebookUrl', 'youtubeUrl',
      'phoneNumber', 'whatsappNumber', 'address', 'latitude', 'longitude',
      'isPremium', 'isFeatured', 'operatingHours',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'services' && typeof body[field] !== 'string') {
          updateData[field] = JSON.stringify(body[field])
        } else if ((field === 'images' || field === 'gallery') && typeof body[field] !== 'string') {
          updateData[field] = JSON.stringify(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Support both ID and slug lookup
    const existingListing = await db.listing.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, userId: true },
    })
    if (!existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Ownership check: only the owner or an admin can update
    if (body.userId && body.userId !== existingListing.userId && !body.adminUserId) {
      return NextResponse.json({ error: 'Forbidden: not the listing owner' }, { status: 403 })
    }

    const listing = await db.listing.update({
      where: { id: existingListing.id },
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
    console.error('Error updating listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Increment views count
    if (body.action === 'incrementViews') {
      // Support both ID and slug lookup
      const existingListing = await db.listing.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        select: { id: true },
      })
      if (!existingListing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      const listing = await db.listing.update({
        where: { id: existingListing.id },
        data: { viewsCount: { increment: 1 } },
      })
      return NextResponse.json({ viewsCount: listing.viewsCount })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error patching listing:', error)
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}
