import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { supabase } from '@/lib/supabase'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

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

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
    }

    const channels = await prisma.youtubeChannel.findMany({
      where: { isActive: true }
    })

    if (channels.length === 0) {
      return NextResponse.json({ message: 'No active channels found', addedCount: 0 })
    }

    let totalAdded = 0

    for (const channel of channels) {
      // Fetch latest videos from this channel
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channelId}&maxResults=15&order=date&type=video&key=${YOUTUBE_API_KEY}`
      )
      
      if (!response.ok) {
        console.error(`Failed to fetch for channel ${channel.channelId}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const videoId = item.id.videoId
          const title = item.snippet.title
          const publishedAt = new Date(item.snippet.publishedAt)
          const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

          // Upsert into ShortVideo
          const existing = await prisma.shortVideo.findUnique({
            where: { youtubeUrl }
          })

          if (!existing) {
            await prisma.shortVideo.create({
              data: {
                youtubeUrl,
                title,
                channelId: channel.id,
                publishedAt
              }
            })
            totalAdded++
          }
        }
      }
    }

    return NextResponse.json({ message: 'Sync complete', addedCount: totalAdded })
  } catch (error) {
    console.error('Error syncing youtube shorts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
