import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const prizes = await db.spinPrize.findMany({
      orderBy: { probability: 'desc' },
    })

    return NextResponse.json(prizes)
  } catch (error) {
    console.error('Error fetching spin prizes:', error)
    return NextResponse.json({ error: 'Failed to fetch spin prizes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.label || !body.prizeType) {
      return NextResponse.json({ error: 'label and prizeType are required' }, { status: 400 })
    }

    const prize = await db.spinPrize.create({
      data: {
        label: body.label,
        prizeType: body.prizeType,
        prizeValue: body.prizeValue || 0,
        probability: body.probability || 0.1,
        color: body.color || '#D4AF37',
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })

    return NextResponse.json(prize, { status: 201 })
  } catch (error) {
    console.error('Error creating spin prize:', error)
    return NextResponse.json({ error: 'Failed to create spin prize' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.label !== undefined) updateData.label = body.label
    if (body.prizeType !== undefined) updateData.prizeType = body.prizeType
    if (body.prizeValue !== undefined) updateData.prizeValue = body.prizeValue
    if (body.probability !== undefined) updateData.probability = body.probability
    if (body.color !== undefined) updateData.color = body.color
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const prize = await db.spinPrize.update({
      where: { id: body.id },
      data: updateData,
    })

    return NextResponse.json(prize)
  } catch (error) {
    console.error('Error updating spin prize:', error)
    return NextResponse.json({ error: 'Failed to update spin prize' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await db.spinPrize.delete({ where: { id } })

    return NextResponse.json({ message: 'Spin prize deleted successfully' })
  } catch (error) {
    console.error('Error deleting spin prize:', error)
    return NextResponse.json({ error: 'Failed to delete spin prize' }, { status: 500 })
  }
}
