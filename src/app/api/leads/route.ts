import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (listingId) {
      where.listingId = listingId
    }
    if (userId) {
      where.userId = userId
    }
    if (status) {
      where.status = status
    }

    const leads = await db.lead.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const lead = await db.lead.create({
      data: {
        listingId: body.listingId,
        userId: body.userId || null,
        customerPhone: body.customerPhone,
        customerName: body.customerName || null,
        requirementText: body.requirementText || null,
        source: body.source || 'form',
        status: body.status || 'new',
      },
      include: {
        listing: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
