export const dynamic = 'force-dynamic';
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
    const userId = searchParams.get('userId')
    const referredByAgentId = searchParams.get('referredByAgentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // If userId is provided, show ALL listings (including unapproved) for that user
    // If referredByAgentId is provided, show all listings for that agent (including unapproved)
    // Otherwise, only show approved listings
    if (userId) {
      where.userId = userId
    } else if (referredByAgentId) {
      // Show both approved and pending for agent's referrals
    } else {
      where.status = 'APPROVED'
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
    if (referredByAgentId) {
      where.referredByAgentId = referredByAgentId
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
    return NextResponse.json({
      listings: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.userId || !body.cityId || !body.slug || !body.name || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, cityId, slug, name, category' },
        { status: 400 }
      )
    }
    // Sanitize string inputs
    const sanitizedName = String(body.name).trim().slice(0, 200)
    const sanitizedCategory = String(body.category).trim().slice(0, 100)
    const sanitizedDescription = body.description ? String(body.description).trim().slice(0, 5000) : null

    const listing = await db.listing.create({
      data: {
        userId: body.userId,
        cityId: body.cityId,
        slug: body.slug,
        name: sanitizedName,
        category: sanitizedCategory,
        description: sanitizedDescription,
        services: body.services ? JSON.stringify(body.services) : null,
        images: body.images ? JSON.stringify(body.images) : null,
        coverImage: body.coverImage || null,
        logoUrl: body.logoUrl || null,
        gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        instagramUrl: body.instagramUrl || null,
        instagramUsername: body.instagramUsername || null,
        facebookUrl: body.facebookUrl || null,
        youtubeUrl: body.youtubeUrl || null,
        phoneNumber: body.phoneNumber || null,
        whatsappNumber: body.whatsappNumber || null,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        isApproved: false,
        status: 'PENDING',
        isPremium: false,
        isFeatured: false,
        operatingHours: body.operatingHours || null,
        referredByAgentId: body.referredByAgentId || null,
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
