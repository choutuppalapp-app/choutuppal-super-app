'use server'

import { db } from '@/lib/db'

export async function getBanners() {
  try {
    return await db.banner.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return []
  }
}

export async function createBanner(data: {
  imageUrl: string
  linkUrl?: string
  uploadedBy: string
}) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Exactly 24 hours from now
    return await db.banner.create({
      data: {
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        uploadedBy: data.uploadedBy,
        expiresAt,
      },
    })
  } catch (error) {
    console.error('Error creating banner:', error)
    throw new Error('Failed to create banner')
  }
}

export async function deleteBanner(id: string) {
  try {
    return await db.banner.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error deleting banner:', error)
    throw new Error('Failed to delete banner')
  }
}
