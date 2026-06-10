export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    const where: Record<string, unknown> = { isApproved: true }

    if (cityId) {
      where.cityId = cityId
    }

    const listings = await db.realEstateListing.findMany({
      where,
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
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching real estate listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch real estate listings' },
      { status: 500 }
    )
  }
}
