export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'


export async function GET() {
  try {
    const branding = await prisma.appBranding.findFirst()
    return NextResponse.json(branding || { appLogoUrl: null, faviconUrl: null, pwaIconUrl: null }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json({ appLogoUrl: null, faviconUrl: null, pwaIconUrl: null }, {
      headers: { 'Cache-Control': 'no-store' }
    })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Sanitize data for AppBranding model
    const brandingData: any = {
      appName: data.appName,
      tagline: data.tagline,
      logoUrl: data.appLogoUrl || data.logoUrl,
      primaryColorHex: data.primaryColorHex,
      whatsappNumber: data.whatsappNumber,
      email: data.email,
      address: data.address,
    }
    Object.keys(brandingData).forEach(key => brandingData[key] === undefined && delete brandingData[key]);

    const existing = await prisma.appBranding.findFirst()
    let branding;
    if (existing) {
      branding = await prisma.appBranding.update({
        where: { id: existing.id },
        data: brandingData
      })
    } else {
      branding = await prisma.appBranding.create({
        data: brandingData
      })
    }

    // Also sync logo changes to SiteSetting
    const siteSettingsData: any = {
      appLogoUrl: data.appLogoUrl,
      faviconUrl: data.faviconUrl,
      pwaIconUrl: data.pwaIconUrl,
      logoUrl: data.appLogoUrl || data.logoUrl,
    }
    Object.keys(siteSettingsData).forEach(key => siteSettingsData[key] === undefined && delete siteSettingsData[key]);
    
    if (Object.keys(siteSettingsData).length > 0) {
      const existingSettings = await prisma.siteSetting.findFirst()
      if (existingSettings) {
        await prisma.siteSetting.update({
          where: { id: existingSettings.id },
          data: siteSettingsData
        })
      } else {
        await prisma.siteSetting.create({
          data: siteSettingsData
        })
      }
    }
    
    return NextResponse.json(branding)
  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json({}, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  }
}
