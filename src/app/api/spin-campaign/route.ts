import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const campaign = await db.spinCampaign.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(campaign)
  } catch (error) {
    console.error('Error fetching active spin campaign:', error)
    return NextResponse.json(null)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sponsorName, offerDetails, totalWinners } = body

    if (!sponsorName || !offerDetails) {
      return NextResponse.json({ error: 'Sponsor name and offer details are required' }, { status: 400 })
    }

    // Deactivate all previous active campaigns
    await db.spinCampaign.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create new active campaign
    const campaign = await db.spinCampaign.create({
      data: {
        sponsorName,
        offerDetails,
        totalWinners: parseInt(totalWinners) || 10,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error: any) {
    console.error('Error creating spin campaign:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
