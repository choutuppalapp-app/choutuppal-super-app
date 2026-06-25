export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let settings = await db.siteSetting.findFirst();

    if (!settings) {
      settings = await db.siteSetting.create({
        data: {
          appLogoUrl: '/brand-logo.png',
          faviconUrl: '/icons/icon-192x192.png',
          pwaIconUrl: '/icons/icon-512x512.png',
          heroHeadline: 'Discover Choutuppal - Your Town, One App',
          heroDescription: 'Find the best local businesses, services, real estate, news, and more.',
          primaryColor: '#D4AF37',
          accentColor: '#4169E1'
        }
      });
    }

    return NextResponse.json(settings, { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const existing = await db.siteSetting.findFirst();

    let settings;
    if (existing) {
      settings = await db.siteSetting.update({
        where: { id: existing.id },
        data: body
      });
    } else {
      settings = await db.siteSetting.create({
        data: body
      });
    }

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
