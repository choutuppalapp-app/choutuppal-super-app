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
