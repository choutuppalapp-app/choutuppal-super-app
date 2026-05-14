import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Increment views — safe, controlled operation
    if (body.incrementViews) {
      const story = await db.story.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
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
