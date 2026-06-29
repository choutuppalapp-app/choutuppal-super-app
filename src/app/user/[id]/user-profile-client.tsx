'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import ListingCard from '@/components/listing-card'
import { format } from 'date-fns'
import { MapPin, Calendar, Star, FileText, Image as ImageIcon, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface UserProfileClientProps {
  user: any
}

export function UserProfileClient({ user }: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'listings'>('posts')
  const { user: currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser && currentUser.id === user.id) {
      router.push('/dashboard')
    }
  }, [currentUser, user.id, router])

  if (currentUser && currentUser.id === user.id) {
    return null // Prevent flash of content before redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto w-full bg-white shadow-sm min-h-screen">
        {/* Cover Photo */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-yellow-500 w-full relative" />
        
        {/* Profile Header */}
        <div className="px-4 sm:px-6 relative">
          <div className="flex justify-between items-end">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-md relative z-10 shrink-0 -mt-12 sm:-mt-16 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                  {user.fullName.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Action Buttons could go here */}
          </div>
          
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              {user.isFeatured && (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-current" /> Featured
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-500 mt-1">
              @{user.id.substring(0, 8)} • Member since {format(new Date(user.createdAt || new Date()), 'MMM yyyy')}
            </p>
            
            {user.bio && !user.isPrivate && (
              <p className="mt-4 text-gray-800 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {user.bio}
              </p>
            )}
            
            {/* Stats Row */}
            {!user.isPrivate && (
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span className="font-bold text-gray-900">{user.posts?.length || 0}</span> Posts
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ImageIcon className="w-4 h-4" />
                  <span className="font-bold text-gray-900">{user.listings?.length || 0}</span> Listings
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        {!user.isPrivate && (
          <div className="mt-6 border-b border-gray-200 px-4 sm:px-6 flex gap-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Community Posts
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'listings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Listings
              {activeTab === 'listings' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-4 sm:p-6 bg-gray-50 min-h-[50vh]">
          {user.isPrivate ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">Account is Private</h3>
              <p className="text-gray-500 text-sm">🔒 This account is private</p>
            </div>
          ) : (
            <>
              {activeTab === 'posts' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {!user.posts || user.posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 font-bold mb-1">No Posts Yet</h3>
                      <p className="text-gray-500 text-sm">When this user posts, they'll show up here.</p>
                    </div>
                  ) : (
                    user.posts.map((post: any) => (
                      <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {post.author.avatarUrl ? (
                              <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-blue-600 font-bold">{post.author.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{post.author.fullName}</div>
                            <div className="text-xs text-gray-500">{format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}</div>
                          </div>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="space-y-4">
                  {!user.listings || user.listings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 font-bold mb-1">No Listings Yet</h3>
                      <p className="text-gray-500 text-sm">This user hasn't created any listings.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.listings.map((listing: any) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}
