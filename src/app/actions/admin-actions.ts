"use server";

import { db } from '@/lib/db';

export async function getAdminStats() {
  return {
    users: await db.user.count(),
    listings: await db.listing.count(),
    banners: await db.bannerAd.count(),
    realEstate: await db.realEstateListing.count()
  };
}
