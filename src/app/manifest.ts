import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let settings: any = null
  try {
    settings = await db.siteSetting.findFirst()
  } catch (e) {
    console.error('Failed to fetch settings for manifest:', e)
  }

  const pwaIconUrl = settings?.pwaIconUrl || settings?.faviconUrl || '/icons/icon-512x512.png?v=new'
  const appName = settings?.appName || 'Choutuppal App'
  const description = settings?.metaDescription || 'Discover businesses, news, and services in Choutuppal.'

  return {
    name: appName,
    short_name: appName.length > 12 ? appName.substring(0, 12) : appName,
    description: description,
    start_url: '/?v=fresh',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4169E1',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['business', 'lifestyle', 'social'],
    icons: [
      {
        src: pwaIconUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: pwaIconUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Explore',
        short_name: 'Explore',
        description: 'Browse local businesses and services',
        url: '/city/choutuppal?view=explore',
        icons: [{ src: pwaIconUrl, sizes: '192x192' }],
      },
      {
        name: 'News',
        short_name: 'News',
        description: 'Read the latest local news',
        url: '/city/choutuppal?view=news',
        icons: [{ src: pwaIconUrl, sizes: '192x192' }],
      },
    ],
  }
}
