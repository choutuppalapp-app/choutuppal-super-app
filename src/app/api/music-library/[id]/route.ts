import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// PATCH - Update a music track
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const track = await db.musicLibrary.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(track)
  } catch (error) {
    console.error('Error updating music track:', error)
    return NextResponse.json({ error: 'Failed to update music track' }, { status: 500 })
  }
}

// DELETE - Remove a music track
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.musicLibrary.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting music track:', error)
    return NextResponse.json({ error: 'Failed to delete music track' }, { status: 500 })
  }
}
