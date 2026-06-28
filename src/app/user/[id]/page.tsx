import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { UserProfileClient } from './user-profile-client'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' }
      },
      posts: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              fullName: true,
              avatarUrl: true
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
