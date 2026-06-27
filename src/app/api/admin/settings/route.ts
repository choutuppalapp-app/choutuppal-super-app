import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const settings = await db.siteSetting.findFirst()
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error('Failed to get settings', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const settings = await db.siteSetting.findFirst()

    let updatedSettings
    if (settings) {
      updatedSettings = await db.siteSetting.update({
        where: { id: settings.id },
        data
      })
    } else {
      updatedSettings = await db.siteSetting.create({
        data
      })
    }

    revalidatePath('/', 'layout')
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Failed to update settings', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
