export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get('cityId')
    const userId = searchParams.get('userId')

    const where: any = {
      expiresAt: { gt: new Date() }
    }

    if (cityId) {
      where.cityId = cityId
    }
    if (userId) {
      where.userId = userId
    }

    const stories = await db.story.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            subscriptionTier: true,
          }
        },
        city: {
          select: { id: true, name: true, slug: true }
        },
        music: {
          select: { id: true, name: true, audioUrl: true, artist: true }
        }
      },
      orderBy: { createdAt: 'desc' }
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
    const { userId, cityId, mediaUrl, text, ctaLink, mediaType, musicId, musicName, isPremium } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Missing user ID' }, { status: 401 })
    }

    // Verify user exists in DB
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid user' }, { status: 401 })
    }

    if (!cityId || !mediaUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: cityId, mediaUrl' },
        { status: 400 }
      )
    }

    // Set expiresAt to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const story = await db.story.create({
      data: {
        userId,
        cityId,
        mediaType: mediaType || 'IMAGE',
        mediaUrl,
        text: text || null,
        ctaLink: ctaLink || null,
        title: text || 'Story', // Fallback for title column
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
