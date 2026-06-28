import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Header } from '@/components/header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import ListingCard from '@/components/listing-card'
import { MapPin, Calendar, MessageSquare, Briefcase } from 'lucide-react'
import { format } from 'date-fns'

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto w-full">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-blue-600 to-yellow-500 w-full relative" />
        
        {/* Profile Info */}
        <div className="px-4 sm:px-6 relative pb-6 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-1.5 shadow-lg relative z-10 shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                  {user.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1 pb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {user.role === 'agent' ? 'Agent' : user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
          </div>
          
          {user.bio && (
            <div className="mt-4 text-gray-700 whitespace-pre-wrap text-center sm:text-left max-w-2xl">
              {user.bio}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="p-4 sm:p-6 space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Listings ({user.listings.length})
            </h2>
            
            {user.listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                This user has no active listings.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Community Posts ({user.posts.length})
            </h2>

            {user.posts.length > 0 ? (
              <div className="space-y-4">
                {user.posts.map(post => (
                  <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        {post.author.avatarUrl ? (
                          <img src={post.author.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <span className="text-blue-600 font-bold">{post.author.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{post.author.fullName}</div>
                        <div className="text-xs text-gray-500">{format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}</div>
                      </div>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                This user hasn't posted anything yet.
              </div>
            )}
          </div>

        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
