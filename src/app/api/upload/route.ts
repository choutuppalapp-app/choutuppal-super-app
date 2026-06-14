import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as Blob | null
    const folder = formData.get('folder') as string | null

    if (!file || !folder) {
      return NextResponse.json({ error: 'File and folder are required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Ensure the folder exists or just upload with path
    const fileExt = file.type.split('/')[1] || 'jpg'
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabaseAdmin.storage
      .from('listing-images')
      .upload(filePath, file)

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('listing-images')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
