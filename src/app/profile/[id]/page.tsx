import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db as prisma } from '@/lib/db'
import { UserProfileView } from '@/components/user-profile-view'

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
      },
      posts: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
      }
    }
  })

  if (!user || !user.isPublic) {
    notFound()
  }

  // Without server session readily available, default initialIsFollowing to false
  // The client can re-verify or handle toggles.
  return <UserProfileView user={user} initialIsFollowing={false} />
}
