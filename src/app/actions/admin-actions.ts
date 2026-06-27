"use server";

import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function getAdminStats() {
  return {
    users: await db.user.count(),
    listings: await db.listing.count(),
    banners: await db.bannerAd.count(),
    realEstate: await db.realEstateListing.count()
  };
}

export async function getAdminListings() {
  const listings = await db.listing.findMany({ orderBy: { createdAt: 'desc' } });
  const realEstate = await db.realEstateListing.findMany({ orderBy: { createdAt: 'desc' } });
  return { listings, realEstate };
}

export async function deleteAdminListing(id: string, type: 'business' | 'real_estate') {
  if (type === 'real_estate') {
    return await db.realEstateListing.delete({ where: { id } });
  } else {
    return await db.listing.delete({ where: { id } });
  }
}

export async function getAdminBanners() {
  return await db.bannerAd.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteAdminBanner(id: string) {
  return await db.bannerAd.delete({ where: { id } });
}

export async function getAdminStories() {
  return await db.story.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteAdminStory(id: string) {
  return await db.story.delete({ where: { id } });
}

export async function getAdminNews() {
  return await db.news.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteAdminNews(id: string) {
  return await db.news.delete({ where: { id } });
}

export async function createAdminListing(data: any, type: 'business' | 'real_estate') {
  if (type === 'real_estate') {
    return await db.realEstateListing.create({ data });
  } else {
    return await db.listing.create({ data });
  }
}

export async function createAdminBanner(data: any) {
  return await db.bannerAd.create({ data });
}

export async function createAdminStory(data: any) {
  return await db.story.create({ data });
}

export async function createAdminNews(data: any) {
  return await db.news.create({ data });
}

// ─── Users Management ──────────────────────────────────────────────────

export async function getAdminUsers() {
  return await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      subscriptionTier: true,
      createdAt: true,
    }
  });
}

export async function updateAdminUserRole(id: string, role: string) {
  return await db.user.update({
    where: { id },
    data: { role }
  });
}

export async function toggleAdminUserPremium(id: string, isPremium: boolean) {
  return await db.user.update({
    where: { id },
    data: { subscriptionTier: isPremium ? 'premium' : 'free' }
  });
}

export async function resetAdminUserPassword(email: string) {
  const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteAdminUser(id: string) {
  // First delete from Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    console.error('Failed to delete user from Supabase Auth:', error);
    // Even if it fails (e.g. not found in Supabase Auth), we might still want to delete from Prisma
  }

  // Delete from Prisma (Cascading will handle their listings/posts if setup correctly, 
  // but if not we might need to manually delete dependencies or just let prisma cascade)
  return await db.user.delete({ where: { id } });
}
