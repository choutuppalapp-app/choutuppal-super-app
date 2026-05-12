import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('isFeatured')
    const isPremium = searchParams.get('isPremium')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      isApproved: true,
    }

    if (cityId) {
      where.cityId = cityId
    }
    if (category) {
      where.category = category
    }
    if (isFeatured === 'true') {
      where.isFeatured = true
    }
    if (isPremium === 'true') {
      where.isPremium = true
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
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
              avatarUrl: true,
            },
          },
          city: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { reviews: true, leads: true },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { isPremium: 'desc' },
          { viewsCount: 'desc' },
        ],
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
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const listing = await db.listing.create({
      data: {
        userId: body.userId,
        cityId: body.cityId,
        slug: body.slug,
        name: body.name,
        category: body.category,
        description: body.description || null,
        services: body.services ? JSON.stringify(body.services) : null,
        images: body.images ? JSON.stringify(body.images) : null,
        whatsappNumber: body.whatsappNumber || null,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        isApproved: body.isApproved || false,
        isPremium: body.isPremium || false,
        isFeatured: body.isFeatured || false,
        operatingHours: body.operatingHours || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        city: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
