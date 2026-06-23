export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Calendar, FileText, ArrowLeft, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/optimized-image'
import Link from 'next/link'
import { ShareButtons } from '@/app/news/[id]/share-buttons'

async function getBlog(slug: string) {
  try {
    return await db.blog.findUnique({
      where: { slug },
      include: { author: true },
    })
  } catch {
    return null
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug)

  if (!blog || !blog.isPublished) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
            <ArrowLeft className="size-5 text-gray-700" />
          </Link>
          <h1 className="font-semibold text-gray-900 truncate flex-1">Blog Post</h1>
          <ShareButtons title={blog.title} text={blog.content?.substring(0, 100) || ''} />
        </div>
      </div>

      <main className="max-w-3xl mx-auto">
        <article className="bg-white shadow-sm md:mt-6 md:rounded-2xl overflow-hidden border border-gray-100">
          {/* Cover Image */}
          <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
            {blog.coverImageUrl ? (
              <OptimizedImage
                src={blog.coverImageUrl}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#4169E1] to-[#D4AF37] flex items-center justify-center">
                <FileText className="w-16 h-16 text-white/30" />
              </div>
            )}
          </div>

          <div className="p-5 md:p-8 space-y-6">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <Badge variant="secondary" className="bg-[#4169E1]/10 text-[#4169E1] hover:bg-[#4169E1]/20">
                Blog
              </Badge>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <time dateTime={blog.createdAt.toISOString()}>
                  {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              {blog.author && (
                <div className="flex items-center gap-1">
                  <User className="size-4" />
                  {blog.author.fullName}
                </div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {blog.title}
            </h1>

            {/* Content */}
            <div className="prose prose-gray max-w-none prose-p:leading-relaxed prose-p:text-gray-600 prose-headings:text-gray-900">
              {blog.content ? (
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              ) : (
                <p className="italic text-gray-400">No content available.</p>
              )}
            </div>

            {/* Share Section */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShareButtons title={blog.title} text="" showLabels={true} />
              </h3>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
