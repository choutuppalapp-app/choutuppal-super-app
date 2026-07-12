import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { listingId },
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

    const count = reviews.length
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    const averageRating = count > 0 ? Number((sum / count).toFixed(1)) : 5.0

    return NextResponse.json({
      reviews,
      averageRating,
      totalCount: count,
    })
  } catch (error: any) {
    console.error('Get Reviews Error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
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
      return NextResponse.json({ error: 'Unauthorized: Please sign in to submit a review' }, { status: 401 })
    }

    const user = await db.user.findFirst({
      where: { email: sbUser.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { listingId, rating, comment } = await req.json()

    if (!listingId || !rating) {
      return NextResponse.json({ error: 'listingId and rating are required' }, { status: 400 })
    }

    const numericRating = parseInt(rating, 10)
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const existingReview = await db.review.findFirst({
      where: {
        listingId,
        userId: user.id,
      }
    })

    let review
    if (existingReview) {
      review = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: numericRating,
          comment,
        }
      })
    } else {
      review = await db.review.create({
        data: {
          listingId,
          userId: user.id,
          rating: numericRating,
          comment,
        }
      })
    }

    const allReviews = await db.review.findMany({
      where: { listingId },
      select: { rating: true }
    })

    const count = allReviews.length
    const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0)
    const newAverage = count > 0 ? Number((sum / count).toFixed(1)) : 5.0

    await db.listing.update({
      where: { id: listingId },
      data: { rating: newAverage }
    })

    return NextResponse.json({ success: true, review, averageRating: newAverage })
  } catch (error: any) {
    console.error('Post Review Error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
