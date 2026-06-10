export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Auto-affiliate function: wraps product keywords in Amazon affiliate links
function autoAffiliate(text: string): string {
  const affiliateTag = 'choutuppal-21'
  const keywords = ['mobile', 'laptop', 'AC', 'air conditioner', 'phone', 'tablet', 'TV', 'television', 'refrigerator', 'washing machine', 'camera', 'headphones', 'speaker', 'watch', 'laptop bag', 'charger', 'power bank', 'router', 'printer', 'monitor']

  let result = text
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    const url = `https://amazon.in/s?tag=${affiliateTag}&k=${encodeURIComponent(keyword)}`
    result = result.replace(regex, `<a href="${url}" target="_blank" rel="noopener noreferrer sponsored" class="text-[#4169E1] underline decoration-dotted hover:decoration-solid">$1</a>`)
  })

  return result
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeUnpublished = searchParams.get('all') === 'true'

    const where: Record<string, unknown> = {}
    if (!includeUnpublished) {
      where.isPublished = true
    }

    const news = await db.news.findMany({
      where,
      include: {
        city: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.cityId) {
      return NextResponse.json({ error: 'title and cityId are required' }, { status: 400 })
    }

    // Run auto-affiliate on content
    const processedContent = body.content ? autoAffiliate(body.content) : null

    const news = await db.news.create({
      data: {
        cityId: body.cityId,
        title: body.title,
        content: processedContent,
        imageUrl: body.imageUrl || null,
        source: body.source || null,
        isPublished: body.isPublished !== undefined ? body.isPublished : true,
      },
      include: {
        city: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Run auto-affiliate on content if provided
    const processedContent = body.content ? autoAffiliate(body.content) : undefined

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (processedContent !== undefined) updateData.content = processedContent
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.source !== undefined) updateData.source = body.source
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
    if (body.cityId !== undefined) updateData.cityId = body.cityId

    const news = await db.news.update({
      where: { id: body.id },
      data: updateData,
      include: {
        city: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await db.news.delete({ where: { id } })

    return NextResponse.json({ message: 'News deleted successfully' })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
