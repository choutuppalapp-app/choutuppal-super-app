import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db as prisma } from '@/lib/db'
import { Phone, MessageCircle, Calendar, Star, Store } from 'lucide-react'

// UI
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/glass-card'
import ListingCard from '@/components/listing-card'

const formatJoinedDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params
  const isUsername = id.startsWith('%40') || id.startsWith('@')
  const usernameQuery = isUsername ? decodeURIComponent(id).substring(1) : undefined

  let user: any = null
  try {
    user = await prisma.user.findFirst({
      where: usernameQuery ? { username: usernameQuery } : { id }
    })
  } catch {}

  if (!user) return { title: 'Profile Not Found' }

  const roleLabel = user.role === 'city_admin' ? 'City Admin' : user.role === 'agent' ? 'Agent' : 'Business Owner'
  const title = `${user.fullName} | ${roleLabel} | Choutuppal App`
  const description = user.bio || `View ${user.fullName}'s profile, listings, and stories on Choutuppal App.`
  
  const rawImage = user.avatarUrl || '/logo.png'
  const absoluteImageUrl = rawImage.startsWith('http') 
    ? rawImage 
    : `https://choutuppal.in${rawImage.startsWith('/') ? '' : '/'}${rawImage}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 800, height: 800 }],
      type: 'profile',
      url: `https://choutuppal.in/profile/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: absoluteImageUrl, width: 800, height: 800 }],
    }
  }
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  
  // Resolve user id - might be username or just ID
  const isUsername = id.startsWith('%40') || id.startsWith('@')
  const usernameQuery = isUsername ? decodeURIComponent(id).substring(1) : undefined

  const user = await prisma.user.findFirst({
    where: usernameQuery ? { username: usernameQuery } : { id },
    include: {
      listings: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
      stories: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      }
    }
  })

  if (!user) {
    notFound()
  }

  const roleLabel = user.role === 'city_admin' ? 'City Admin' : user.role === 'agent' ? 'Agent' : 'Business Owner'

  const phoneToCall = user.phone
  const phoneToWA = user.whatsappNumber || user.phone

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-20">
      {/* Header Profile Section */}
      <div className="bg-gradient-to-tr from-[#4169E1] to-[#D4AF37] pt-12 pb-24 px-4 relative">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 space-y-6">
        <GlassCard className="p-6 bg-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="size-24 sm:size-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-4">
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              {user.username && <p className="text-sm text-gray-500">@{user.username}</p>}
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <Badge className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-medium">
                  {roleLabel}
                </Badge>
                <div className="flex items-center text-xs text-gray-500 font-medium">
                  <Calendar className="size-3.5 mr-1" />
                  Joined {formatJoinedDate(user.createdAt)}
                </div>
              </div>

              {user.bio && (
                <p className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 text-left">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-100">
            {phoneToCall && (
              <a href={`tel:${phoneToCall}`} className="w-full">
                <Button variant="outline" className="w-full rounded-xl h-12 flex items-center justify-center gap-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50">
                  <Phone className="size-4 text-gray-600" />
                  Call
                </Button>
              </a>
            )}
            {phoneToWA && (
              <a href={`https://wa.me/91${phoneToWA}`} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full rounded-xl h-12 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20 font-bold">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </GlassCard>

        {/* Stories Section */}
        {user.stories && user.stories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-1">
              <Star className="size-5 text-[#D4AF37] fill-[#D4AF37]" />
              Active Stories
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {user.stories.map((story) => (
                <div key={story.id} className="snap-start shrink-0">
                  {/* Basic story preview card */}
                  <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
                    <img src={story.mediaUrl} alt={story.title || 'Story'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2">
                      <p className="text-white text-xs font-medium line-clamp-2 shadow-sm">{story.title || 'Update'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Section */}
        {user.listings && user.listings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 px-1">
              <Store className="size-5 text-[#4169E1]" />
              Businesses & Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
