import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const channels = await prisma.youtubeChannel.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Error fetching youtube channels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { channelId, channelName } = body

    if (!channelId || !channelName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const channel = await prisma.youtubeChannel.create({
      data: {
        channelId,
        channelName
      }
    })

    return NextResponse.json({ channel })
  } catch (error: any) {
    console.error('Error adding youtube channel:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Channel ID already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing channel ID' }, { status: 400 })
    }

    await prisma.youtubeChannel.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting youtube channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
