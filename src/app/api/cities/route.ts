import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cities = await db.city.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { listings: true, users: true },
        },
      },
    })
    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}
