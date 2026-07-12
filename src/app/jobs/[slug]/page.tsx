export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Phone, Calendar, User } from 'lucide-react'
import Link from 'next/link'

async function getClassified(id: string) {
  try {
    return await db.classified.findUnique({
      where: { id },
      include: { user: true },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await getClassified(slug)
  if (!item) return { title: 'Classified Not Found' }

  const title = `${item.title} | Jobs & Classifieds | Choutuppal App`
  const description = item.description.substring(0, 160)
  const rawImage = item.imageUrl || '/og-default.png'
  const absoluteImageUrl = rawImage.startsWith('/') 
    ? `https://choutuppal.in${rawImage}` 
    : rawImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
      type: 'website',
      url: `https://choutuppal.in/jobs/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
    }
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getClassified(slug)

  if (!item) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 animate-in fade-in duration-200">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/classifieds" className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
            <ArrowLeft className="size-5 text-gray-700" />
          </Link>
          <h1 className="font-semibold text-gray-900 truncate flex-1">జాబ్స్ & క్లాసిఫైడ్స్</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          {item.imageUrl && (
            <div className="w-full aspect-video bg-gray-100 relative">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-xs font-black px-2.5 py-1 rounded-full border bg-blue-50 text-blue-800 border-blue-200 uppercase tracking-wider">
                {item.category === 'JOB' ? 'పనివాళ్లు కావాలి' : item.category === 'SALE' ? 'అమ్మబడును' : 'అద్దెకు ఇవ్వబడును'}
              </span>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{item.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center shrink-0">
                  {item.user?.avatarUrl ? (
                    <img src={item.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">{item.user?.fullName || 'User'}</p>
                  <p className="text-[10px] text-gray-400">ప్రకటనదారుడు (Advertiser)</p>
                </div>
              </div>

              <a
                href={`tel:${item.contactNumber}`}
                className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <Phone className="w-4 h-4 text-white" />
                కాల్ చేయండి ({item.contactNumber})
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export { JobDetailPage }
