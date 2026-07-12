import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const q = searchParams.get('q') || searchParams.get('query') || ''
    const category = searchParams.get('category')

    // If type is 'user', preserve legacy User search behavior for community feed
    if (type === 'user') {
      if (!q) {
        return NextResponse.json({ users: [] })
      }
      const users = await db.user.findMany({
        where: {
          isPublic: true,
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { username: { contains: q, mode: 'insensitive' } },
          ]
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          avatarUrl: true,
          bio: true,
          isPublic: true,
        },
        take: 20
      })
      return NextResponse.json({ users })
    }

    // Default: query listings contains (case-insensitive) for title (name) and description
    // In Listing model, name is the title of the listing!
    const where: any = {}

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }

    const listings = await db.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(listings)
  } catch (error: any) {
    console.error('Search API Error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
