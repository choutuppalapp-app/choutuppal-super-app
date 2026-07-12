export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArrowLeft, Phone, MapPin, Maximize, Bed } from 'lucide-react'
import Link from 'next/link'

async function getRealEstate(slug: string) {
  try {
    return await db.realEstateListing.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: { user: true, city: true },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await getRealEstate(slug)
  if (!item) return { title: 'Real Estate Listing Not Found' }

  const title = `${item.title} - ${item.price} | Real Estate | Choutuppal App`
  const description = `${item.address || ''}. ${item.bedroomCount ? item.bedroomCount + ' BHK. ' : ''}${item.area ? item.area + '. ' : ''}Check out this property on Choutuppal App.`
  
  let firstImage = '/og-default.png'
  try {
    if (item.images) {
      const parsed = JSON.parse(item.images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        firstImage = parsed[0]
      }
    }
  } catch {}

  const absoluteImageUrl = firstImage.startsWith('/') 
    ? `https://choutuppal.in${firstImage}` 
    : firstImage

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
      type: 'website',
      url: `https://choutuppal.in/real-estate/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
    }
  }
}

export default async function RealEstateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getRealEstate(slug)

  if (!item) {
    notFound()
  }

  let imagesList: string[] = []
  try {
    if (item.images) {
      const parsed = JSON.parse(item.images)
      if (Array.isArray(parsed)) {
        imagesList = parsed
      }
    }
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 animate-in fade-in duration-200">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
            <ArrowLeft className="size-5 text-gray-700" />
          </Link>
          <h1 className="font-semibold text-gray-900 truncate flex-1">రియల్ ఎస్టేట్ వివరాలు</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
          {imagesList.length > 0 ? (
            <div className="w-full aspect-video bg-gray-100 relative flex overflow-x-auto snap-x scrollbar-none">
              {imagesList.map((imgUrl, i) => (
                <div key={i} className="w-full aspect-video shrink-0 snap-center relative">
                  <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-blue-600 to-yellow-500 flex items-center justify-center">
              <span className="text-white font-extrabold text-lg">రియల్ ఎస్టేట్ ప్రకటన</span>
            </div>
          )}

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-xs font-black px-2.5 py-1 rounded-full border bg-purple-50 text-purple-800 border-purple-200 uppercase tracking-wider">
                {item.listingType === 'rent' ? 'అద్దెకు ఇవ్వబడును (Rent)' : 'అమ్మబడును (Sale)'}
              </span>
              <span className="text-lg font-black text-blue-600">{item.price}</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{item.title}</h2>
              
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                {item.bedroomCount !== null && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700">{item.bedroomCount} BHK</span>
                  </div>
                )}
                {item.area && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-700">{item.area}</span>
                  </div>
                )}
                {item.address && (
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-700 truncate">{item.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center shrink-0">
                  {item.user?.avatarUrl ? (
                    <img src={item.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-gray-450">Owner</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">{item.user?.fullName || 'User'}</p>
                  <p className="text-[10px] text-gray-400">యజమాని / ఏజెంట్ (Owner/Agent)</p>
                </div>
              </div>

              <a
                href={`tel:${item.ownerPhone}`}
                className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <Phone className="w-4 h-4 text-white" />
                కాల్ చేయండి ({item.ownerPhone})
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
export { RealEstateDetailPage }
