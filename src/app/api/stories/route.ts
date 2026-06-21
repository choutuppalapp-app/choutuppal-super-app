export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const cityId = searchParams.get('cityId')

    if (id) {
      const updatedStory = await db.story.update({
        where: { id },
        data: {
          views: { increment: 1 },
          viewsCount: { increment: 1 },
        },
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
      })
      return NextResponse.json(updatedStory)
    }

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { storyId, action, userId, fullName, text } = body

    if (!storyId || !action) {
      return NextResponse.json({ error: 'Missing storyId or action' }, { status: 400 })
    }

    if (action === 'like') {
      const updated = await db.story.update({
        where: { id: storyId },
        data: { likes: { increment: 1 } },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } }
        }
      })
      return NextResponse.json(updated)
    }

    if (action === 'comment') {
      if (!userId || !text) {
        return NextResponse.json({ error: 'Missing userId or text for comment' }, { status: 400 })
      }

      const story = await db.story.findUnique({
        where: { id: storyId },
        select: { comments: true }
      })

      if (!story) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 })
      }

      const existingComments = Array.isArray(story.comments) ? story.comments : []
      const newComment = {
        userId,
        fullName: fullName || 'Anonymous',
        text,
        timestamp: new Date().toISOString()
      }

      const updated = await db.story.update({
        where: { id: storyId },
        data: {
          comments: [...existingComments, newComment]
        },
        include: {
          user: { select: { id: true, fullName: true, avatarUrl: true } }
        }
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating story action:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}
