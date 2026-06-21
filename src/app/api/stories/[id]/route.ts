export const dynamic = 'force-dynamic';
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const story = await db.story.update({
      where: { id },
      data: {
        views: { increment: 1 },
        viewsCount: { increment: 1 }
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true, subscriptionTier: true }
        },
        music: {
          select: { id: true, name: true, audioUrl: true, artist: true }
        }
      }
    })
    return NextResponse.json(story)
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Action actions
    if (body.action === 'like') {
      const story = await db.story.update({
        where: { id },
        data: { likes: { increment: 1 } }
      })
      return NextResponse.json(story)
    }

    if (body.action === 'comment') {
      const { userId, text, fullName } = body
      if (!userId || !text) {
        return NextResponse.json({ error: 'Missing userId or text for comment' }, { status: 400 })
      }
      const currentStory = await db.story.findUnique({
        where: { id },
        select: { comments: true }
      })
      if (!currentStory) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 })
      }
      const existingComments = Array.isArray(currentStory.comments) ? currentStory.comments : []
      const newComment = {
        userId,
        fullName: fullName || 'Anonymous',
        text,
        timestamp: new Date().toISOString()
      }
      const story = await db.story.update({
        where: { id },
        data: {
          comments: [...existingComments, newComment]
        }
      })
      return NextResponse.json(story)
    }

    // Increment views — safe, controlled operation
    if (body.incrementViews) {
      const story = await db.story.update({
        where: { id },
        data: {
          views: { increment: 1 },
          viewsCount: { increment: 1 }
        },
      })
      return NextResponse.json(story)
    }

    // General update — whitelist only safe fields to prevent mass assignment
    const allowedFields: Record<string, unknown> = {}
    if (typeof body.title === 'string') allowedFields.title = body.title.slice(0, 200)
    if (typeof body.isPremium === 'boolean') allowedFields.isPremium = body.isPremium
    if (body.musicId !== undefined) allowedFields.musicId = body.musicId || null
    if (typeof body.musicName === 'string') allowedFields.musicName = body.musicName.slice(0, 100)

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const story = await db.story.update({
      where: { id },
      data: allowedFields,
    })
    return NextResponse.json(story)
  } catch (error) {
    console.error('Error updating story:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.story.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting story:', error)
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 })
  }
}
