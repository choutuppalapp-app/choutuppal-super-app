import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://choutuppal.app'

  // Fetch News
  const newsItems = await db.news.findMany({
    where: { isPublished: true },
    select: { id: true, createdAt: true },
  })
  
  const newsUrls = newsItems.map((news) => ({
    url: `${baseUrl}/news/${news.id}`,
    lastModified: news.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch Blogs
  const blogItems = await db.blog.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  })

  const blogUrls = blogItems.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...newsUrls,
    ...blogUrls,
  ]
}
