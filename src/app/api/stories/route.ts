export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')

    const where: Record<string, unknown> = {}

    if (cityId) {
      where.cityId = cityId
    }

    // 24-hour expiry: only return stories that haven't expired
    where.expiresAt = { gte: new Date() }

    const stories = await db.story.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            subscriptionTier: true,
          },
        },
        city: {
          select: { id: true, name: true, slug: true },
        },
        music: {
          select: { id: true, name: true, audioUrl: true, artist: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, cityId, title, mediaType, mediaUrl, musicId, musicName, isPremium } = body

    if (!userId || !cityId || !title || !mediaUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, cityId, title, mediaUrl' },
        { status: 400 }
      )
    }

    // Auto-set expiresAt to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const story = await db.story.create({
      data: {
        userId,
        cityId,
        title,
        mediaType: mediaType || 'IMAGE',
        mediaUrl,
        musicId: musicId || null,
        musicName: musicName || null,
        isPremium: isPremium || false,
        expiresAt,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, subscriptionTier: true },
        },
        music: {
          select: { id: true, name: true, audioUrl: true, artist: true },
        },
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    )
  }
}
