export const revalidate = 60;
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, cityId, listings } = body

    if (!userId || !cityId || !Array.isArray(listings) || listings.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields or empty listings array.' },
        { status: 400 }
      )
    }

    const createdListings = []

    for (const item of listings) {
      if (!item.name || !item.category) continue

      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      const sanitizedName = String(item.name).trim().slice(0, 200)
      const sanitizedCategory = String(item.category).trim().slice(0, 100)

      const newListing = await db.listing.create({
        data: {
          userId,
          cityId,
          slug,
          name: sanitizedName,
          category: sanitizedCategory,
          description: item.description || null,
          phoneNumber: item.phoneNumber || null,
          whatsappNumber: item.whatsappNumber || null,
          address: item.address || null,
          latitude: item.latitude ? parseFloat(item.latitude) : null,
          longitude: item.longitude ? parseFloat(item.longitude) : null,
          
          isApproved: true,
          status: 'APPROVED',
          isPremium: false,
          isFeatured: false,
          
          // Optional real estate fields or others passed from CSV
          // (Commented out because these might not exist in the base schema natively yet)
          // price: item.price || null,
          // bedroomCount: item.bedroomCount ? parseInt(item.bedroomCount, 10) : null,
          // area: item.area || null,
        }
      })
      createdListings.push(newListing)
    }

    return NextResponse.json({ success: true, count: createdListings.length }, { status: 201 })
  } catch (error) {
    console.error('Error in bulk listing creation:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    )
  }
}
