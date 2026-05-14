import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await db.siteSetting.findFirst()

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await db.siteSetting.create({
        data: {
          logoUrl: '/logo.png',
          affiliateBaseUrl: 'https://choutuppal.com',
          heroHeadline: 'Discover Choutuppal — Your Town, One App',
          heroDescription:
            'Find the best local businesses, services, real estate, news, and more — all in one super app built for Choutuppal.',
          primaryColor: '#D4AF37',
          accentColor: '#4169E1',
          whatsappSupportNumber: '919912353705',
          whatsappCommunityLink: '',
          whatsappChannelLink: '',
          contactName: 'Mosin Md',
          contactAddress: 'Choutuppal, Yadadri, Telangana-508252',
          contactPhone: '9912353705',
        },
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const currentSettings = await db.siteSetting.findFirst()

    if (!currentSettings) {
      return NextResponse.json(
        { error: 'No settings found. GET the settings endpoint first to initialize.' },
        { status: 404 }
      )
    }

    const allowedFields = [
      'logoUrl',
      'affiliateBaseUrl',
      'heroHeadline',
      'heroDescription',
      'heroImageUrl',
      'primaryColor',
      'accentColor',
      'metaTitle',
      'metaDescription',
      'ogImageUrl',
      // Contact & WhatsApp Integration
      'whatsappSupportNumber',
      'whatsappCommunityLink',
      'whatsappChannelLink',
      'contactName',
      'contactAddress',
      'contactPhone',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedSettings = await db.siteSetting.update({
      where: { id: currentSettings.id },
      data: updateData,
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
