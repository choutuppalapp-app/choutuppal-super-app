import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      totalUsers,
      totalListings,
      totalLeads,
      approvedListings,
      featuredListings,
      premiumListings,
      totalReviews,
      cities,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count(),
      db.lead.count(),
      db.listing.count({ where: { isApproved: true } }),
      db.listing.count({ where: { isFeatured: true } }),
      db.listing.count({ where: { isPremium: true } }),
      db.review.count(),
      db.city.findMany({
        include: {
          _count: {
            select: {
              listings: true,
              users: true,
              news: true,
              stories: true,
            },
          },
        },
      }),
    ])

    // Leads by status
    const leadsByStatus = await db.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    // Listings by category
    const listingsByCategory = await db.listing.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { isApproved: true },
    })

    // Users by role
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })

    // Average rating across all reviews
    const reviews = await db.review.findMany({
      select: { rating: true },
    })
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return NextResponse.json({
      totalUsers,
      totalListings,
      totalLeads,
      approvedListings,
      featuredListings,
      premiumListings,
      totalReviews,
      averageRating: Math.round(avgRating * 10) / 10,
      cities,
      leadsByStatus: leadsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      listingsByCategory: listingsByCategory.map((item) => ({
        category: item.category,
        count: item._count.category,
      })),
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count.role,
      })),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
