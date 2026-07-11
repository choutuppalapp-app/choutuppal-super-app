import { NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2-storage'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    let folder = formData.get('folder') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Default folder fallback
    if (!folder) {
      folder = 'content'
    }

    // Validate folder is one of: avatars, listings, content, banners, stories
    const validFolders = ['avatars', 'listings', 'content', 'banners', 'stories']
    // Clean up folder name (remove subfolders if necessary, or check prefix)
    const folderBase = folder.split('/')[0]
    if (!validFolders.includes(folderBase)) {
      // If folder isn't one of the allowed bases, default to 'content'
      folder = `content/${folder}`
    }

    // Validate video size (max 15MB)
    if (file.type.startsWith('video/')) {
      const maxVideoSize = 15 * 1024 * 1024 // 15MB
      if (file.size > maxVideoSize) {
        return NextResponse.json(
          { error: 'Video file size exceeds the 15MB limit for stories and content.' },
          { status: 400 }
        )
      }
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique key
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `${folder}/${Date.now()}_${sanitizedFileName}`

    // Upload to Cloudflare R2
    const publicUrl = await uploadToR2(buffer, key, file.type)

    return NextResponse.json({ url: publicUrl, success: true })
  } catch (error) {
    console.error('Upload API Error:', error)
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 })
  }
}
