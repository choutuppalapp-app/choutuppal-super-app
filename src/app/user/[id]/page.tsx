import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { UserProfileClient } from './user-profile-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params

  const decodedId = decodeURIComponent(id)
  const isUsername = decodedId.startsWith('@')
  const queryParam = isUsername ? decodedId.substring(1) : decodedId

  const user = await db.user.findUnique({
    where: isUsername ? { username: queryParam } : { id: queryParam },
    include: {
      _count: {
        select: {
          followers: true,
          following: true
        }
      },
      listings: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' as const }
      },
      posts: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' as const },
        include: {
          author: {
            select: {
              fullName: true,
              avatarUrl: true,
              username: true
            }
          }
        }
      }
    }
  })

  if (!user) {
    notFound()
  }

  return <UserProfileClient user={user} />
}
