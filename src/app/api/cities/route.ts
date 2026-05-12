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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'name and slug are required' },
        { status: 400 }
      )
    }

    const city = await db.city.create({
      data: {
        name: body.name,
        slug: body.slug,
        state: body.state || 'Telangana',
        heroImageUrl: body.heroImageUrl || null,
      },
    })

    return NextResponse.json(city, { status: 201 })
  } catch (error) {
    console.error('Error creating city:', error)
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    await db.city.delete({ where: { id } })

    return NextResponse.json({ message: 'City deleted successfully' })
  } catch (error) {
    console.error('Error deleting city:', error)
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    )
  }
}
