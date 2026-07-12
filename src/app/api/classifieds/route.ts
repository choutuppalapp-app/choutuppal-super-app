import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) {
      where.category = category
    }

    const classifieds = await db.classified.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(classifieds)
  } catch (error: any) {
    console.error('Get Classifieds Error:', error)
    return NextResponse.json({ error: 'Failed to fetch classifieds' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user: sbUser } } = await supabase.auth.getUser()

    if (!sbUser || !sbUser.email) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to post classifieds' }, { status: 401 })
    }

    const user = await db.user.findFirst({
      where: { email: sbUser.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { title, description, category, contactNumber, imageUrl } = await req.json()

    if (!title || !description || !category || !contactNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newClassified = await db.classified.create({
      data: {
        title,
        description,
        category,
        contactNumber,
        imageUrl: imageUrl || null,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          }
        }
      }
    })

    return NextResponse.json(newClassified)
  } catch (error: any) {
    console.error('Post Classified Error:', error)
    return NextResponse.json({ error: 'Failed to create classified' }, { status: 500 })
  }
}
