import { NextResponse } from 'next/server'
import { r2Client, bucketName } from '@/lib/r2-storage'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
    }

    const decodedKey = decodeURIComponent(key)

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: decodedKey,
    })

    const response = await r2Client.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Transform S3 stream body to byte array
    const bytes = await response.Body.transformToByteArray()

    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Media API Error:', error)
    return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
  }
}
