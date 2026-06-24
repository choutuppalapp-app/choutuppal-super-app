export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'


export async function GET() {
  try {
    const branding = await prisma.appBranding.findFirst()
    return NextResponse.json(branding || {})
  } catch (error) {
    console.error('Error fetching branding:', error)
    return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Basic auth check can be added here
    const data = await request.json()
    
    // Check if one exists
    const existing = await prisma.appBranding.findFirst()
    
    let branding;
    if (existing) {
      branding = await prisma.appBranding.update({
        where: { id: existing.id },
        data
      })
    } else {
      branding = await prisma.appBranding.create({
        data
      })
    }
    
    return NextResponse.json(branding)
  } catch (error) {
    console.error('Error updating branding:', error)
    return NextResponse.json({ error: 'Failed to update branding' }, { status: 500 })
  }
}
