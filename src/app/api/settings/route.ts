export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const settings = await db.siteSetting.findFirst()

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await db.siteSetting.create({
        data: {
          logoUrl: '/brand-logo.png',
          appLogoUrl: '/brand-logo.png',
          faviconUrl: '/icons/icon-192x192.png?v=new',
          pwaIconUrl: '/icons/icon-512x512.png?v=new',
          affiliateBaseUrl: 'https://choutuppal.com',
          heroHeadline: 'Discover Choutuppal — Your Town, One App',
          heroDescription:
            'Find the best local businesses, services, real estate, news, and more — all in one super app built for Choutuppal.',
          primaryColor: '#D4AF37',
          accentColor: '#4169E1',
          whatsappSupportNumber: '918790083706',
          whatsappCommunityLink: '',
          whatsappChannelLink: '',
          heroWhatsappText: 'నమస్కారం, చౌతుప్పల్ యాప్ గురించి సమాచారం కావాలి',
          franchiseWhatsappText: 'నా నగరానికి ఫ్రాంచైజీ కోసం అప్లై చేయాలనుకుంటున్నాను',
          agentWhatsappText: 'చౌతుప్పల్ యాప్ లో ఏజెంట్ గా చేరాలనుకుంటున్నాను',
          instagramUrl: '',
          facebookUrl: '',
          youtubeUrl: '',
          contactName: 'Citizen CSC',
          contactAddress: 'Choutuppal, Yadadri, Telangana-508252',
          contactPhone: '8790083706',
        },
      })
      return NextResponse.json(defaultSettings, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
    }

    return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const currentSettings = await db.siteSetting.findFirst()

    const allowedFields = [
      'logoUrl',
      'appLogoUrl',
      'faviconUrl',
      'pwaIconUrl',
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
      'heroWhatsappText',
      'franchiseWhatsappText',
      'agentWhatsappText',
      'instagramUrl',
      'facebookUrl',
      'youtubeUrl',
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

    let updatedSettings
    if (currentSettings) {
      updatedSettings = await db.siteSetting.update({
        where: { id: currentSettings.id },
        data: updateData,
      })
    } else {
      updatedSettings = await db.siteSetting.create({
        data: updateData as any,
      })
    }

    return NextResponse.json(updatedSettings, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  }
}
