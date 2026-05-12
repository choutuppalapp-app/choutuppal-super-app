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
      totalSubscriptions,
      cities,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count(),
      db.lead.count(),
      db.listing.count({ where: { isApproved: true } }),
      db.listing.count({ where: { isFeatured: true } }),
      db.listing.count({ where: { isPremium: true } }),
      db.review.count(),
      db.subscription.count({ where: { status: 'active' } }),
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

    // Revenue calculation
    const activeSubscriptions = await db.subscription.findMany({
      where: { status: 'active' },
      select: { plan: true },
    })
    const planPrices: Record<string, number> = { pro: 499, premium: 999 }
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + (planPrices[sub.plan] || 0), 0)

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

    // User growth over time (last 6 months)
    const now = new Date()
    const userGrowth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const count = await db.user.count({
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      })
      userGrowth.push({
        month: monthStart.toLocaleDateString('en-IN', { month: 'short' }),
        users: count,
      })
    }

    // Revenue over time (last 6 months)
    const revenueGrowth = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthSubscriptions = await db.subscription.findMany({
        where: {
          status: 'active',
          startDate: { gte: monthStart, lt: monthEnd },
        },
        select: { plan: true },
      })
      const monthRevenue = monthSubscriptions.reduce((sum, sub) => sum + (planPrices[sub.plan] || 0), 0)
      revenueGrowth.push({
        month: monthStart.toLocaleDateString('en-IN', { month: 'short' }),
        revenue: monthRevenue,
      })
    }

    // Subscriptions by plan
    const subscriptionsByPlan = await db.subscription.groupBy({
      by: ['plan'],
      _count: { plan: true },
      where: { status: 'active' },
    })

    return NextResponse.json({
      totalUsers,
      totalListings,
      totalLeads,
      approvedListings,
      featuredListings,
      premiumListings,
      totalReviews,
      totalActiveSubscriptions: totalSubscriptions,
      totalRevenue,
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
      userGrowth,
      revenueGrowth,
      subscriptionsByPlan: subscriptionsByPlan.map((item) => ({
        plan: item.plan,
        count: item._count.plan,
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
