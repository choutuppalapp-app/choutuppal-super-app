import { Metadata } from 'next'
import { db } from '@/lib/db'
import ListingView from '@/components/listing-view'

async function getListing(id: string) {
  try {
    return await db.listing.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let listing: any = null
  try {
    listing = await db.listing.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] }
    })
  } catch {}

  if (!listing) return { title: 'Listing Not Found' }

  const title = `${listing.name} in Choutuppal | Choutuppal App`
  const description = listing.description?.replace(/<[^>]*>?/gm, '').substring(0, 160) || `Check out ${listing.name} on Choutuppal App`
  
  let firstGalleryImage = null;
  try {
    if (listing.images && typeof listing.images === 'string') {
      const parsed = JSON.parse(listing.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        firstGalleryImage = parsed[0];
      }
    }
  } catch {}

  const rawImage = listing.coverImage || listing.logoUrl || firstGalleryImage || '/logo.png'
  const absoluteImageUrl = rawImage.startsWith('http') 
    ? rawImage 
    : `https://choutuppal.in${rawImage.startsWith('/') ? '' : '/'}${rawImage}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
      type: 'website',
      url: `https://choutuppal.in/listing/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 1200, height: 630 }],
    }
  }
}

export default function ListingDetailPage() {
  return <ListingView />
}
