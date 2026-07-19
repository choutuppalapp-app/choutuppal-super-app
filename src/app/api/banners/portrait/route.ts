import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'

    const where: any = {}
    if (!all) {
      where.expiresAt = {
        gt: new Date(),
      }
    }

    const banners = await db.banner.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(banners)
  } catch (error: any) {
    console.error('Error fetching portrait banners in API:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUrl, linkUrl, uploadedBy } = body
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    let resolvedUserId = uploadedBy || null

    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {}
            },
          },
        }
      )
      const { data: { user: sbUser } } = await supabase.auth.getUser()
      if (sbUser && sbUser.email) {
        const user = await db.user.findFirst({
          where: { email: sbUser.email }
        })
        if (user) {
          resolvedUserId = user.id
        }
      }
    } catch (err) {
      console.error('API routes auth session helper error:', err)
    }

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid user' }, { status: 401 })
    }

    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const banner = await db.banner.create({
        data: {
          imageUrl,
          linkUrl: linkUrl || null,
          uploadedBy: resolvedUserId,
          expiresAt,
        },
      })
      return NextResponse.json({ success: true, banner })
    } catch (dbError: any) {
      console.error("DB Create Error:", dbError)
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error creating portrait banner in API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await db.banner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting portrait banner in API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
