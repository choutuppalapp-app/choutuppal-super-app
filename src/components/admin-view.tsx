'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Store, Image as ImageIcon, Megaphone, Plus, Trash2, CheckCircle, Edit3, X, Save, Newspaper, FileText, LayoutDashboard, ArrowLeft, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {  Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MediaUploader } from '@/components/media-uploader'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'
import { toast } from 'sonner'
import Image from 'next/image'
import { GlassCard } from '@/components/glass-card'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Home, AlertTriangle } from 'lucide-react'
import { ForbiddenPage } from '@/components/auth/forbidden-page'

export default function AdminView() {
  const { user } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'realestate' | 'banners' | 'announcements' | 'news' | 'blogs' | 'branding'>('overview')
  
  const [users, setUsers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [realestate, setRealestate] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [usersError, setUsersError] = useState<any>(null)
  const [brandingError, setBrandingError] = useState<any>(null)

  // Forms
  const [isAddingListing, setIsAddingListing] = useState(false)
  const [isAddingRealEstate, setIsAddingRealEstate] = useState(false)
  const [isAddingBanner, setIsAddingBanner] = useState(false)
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false)
  const [isAddingNews, setIsAddingNews] = useState(false)
  const [isAddingBlog, setIsAddingBlog] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)

  const [branding, setBranding] = useState<any>({})
  const [isSavingBranding, setIsSavingBranding] = useState(false)

  useEffect(() => {
    if (activeTab === 'branding') {
      setLoading(true)
      fetch(`/api/settings?t=${Date.now()}`)
        .then(async res => {
          const data = await res.json()
          if (!res.ok || data.error || data.success === false) {
            setBrandingError(data);
            return;
          }
          setBrandingError(null);
          setBranding(data)
        })
        .catch(e => setBrandingError({ error: e.message, stack: e.stack }))
        .finally(() => setLoading(false))
    }
  }, [activeTab])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const role = user?.role?.toLowerCase() || '';

  async function fetchData() {
    setLoading(true)
    try {
      const promises: Promise<void>[] = []
      
      if (activeTab === 'users' || activeTab === 'overview') {
        promises.push(fetch(`/api/admin/users?t=${Date.now()}`).then(async r => {
          const uRes = await r.json();
          if (!r.ok || uRes.error || uRes.success === false) {
            setUsersError(uRes);
            return;
          }
          setUsersError(null);
          if (Array.isArray(uRes)) setUsers(uRes)
          else if (uRes.users) setUsers(uRes.users)
        }).catch(e => {
          setUsersError({ error: e.message, stack: e.stack });
        }))
      }
      
      if (activeTab === 'listings' || activeTab === 'overview') {
        promises.push(fetch(`/api/admin/listings?t=${Date.now()}`).then(r => r.json()).then(lRes => {
          if (lRes.listings) setListings(lRes.listings)
        }))
      }
      
      if (activeTab === 'realestate' || activeTab === 'overview') {
        promises.push(fetch(`/api/admin/realestate?t=${Date.now()}`).then(r => r.json()).then(reRes => {
          if (reRes.listings) setRealestate(reRes.listings)
        }))
      }
      
      if (activeTab === 'banners' || activeTab === 'overview') {
        promises.push(fetch(`/api/banners?all=true&t=${Date.now()}`).then(r => r.json()).then(bRes => {
          if (Array.isArray(bRes)) setBanners(bRes)
        }))
      }
      
      if (activeTab === 'announcements' || activeTab === 'overview') {
        promises.push(fetch(`/api/announcements?activeOnly=false&t=${Date.now()}`).then(r => r.json()).then(aRes => {
          if (Array.isArray(aRes)) setAnnouncements(aRes)
        }))
      }
      
      if (activeTab === 'news') {
        promises.push(fetch(`/api/admin/news?all=true&t=${Date.now()}`).then(r => r.json()).then(nRes => {
          if (Array.isArray(nRes)) setNews(nRes)
        }))
      }
      
      if (activeTab === 'blogs') {
        promises.push(fetch(`/api/blogs?all=true&t=${Date.now()}`).then(r => r.json()).then(blRes => {
          if (Array.isArray(blRes)) setBlogs(blRes)
        }))
      }

      await Promise.allSettled(promises)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      console.log(`[FRONTEND] Sending PATCH to /api/admin/users for user ${userId} with new role ${newRole}`);
      const res = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'changeRole', newRole })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        console.error(`[FRONTEND] API Error:`, errData || res.statusText);
        throw new Error('Update failed')
      }
      toast.success('Role updated successfully')
    } catch (err: any) {
      console.error(`[FRONTEND] Exception in handleRoleChange:`, err);
      toast.error('Failed to update role')
      // Revert could be handled here by re-fetching
      fetchData()
    }
  }

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await fetch(`/api/admin/listings?id=${id}`, { method: 'DELETE' })
      setListings(listings.filter(l => l.id !== id))
      toast.success('Listing deleted')
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  const handleDeleteRealEstate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    try {
      await fetch(`/api/admin/realestate?id=${id}`, { method: 'DELETE' })
      setRealestate(realestate.filter(r => r.id !== id))
      toast.success('Property deleted')
    } catch {
      toast.error('Failed to delete property')
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    try {
      await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
      setBanners(banners.filter(b => b.id !== id))
      toast.success('Banner deleted')
    } catch {
      toast.error('Failed to delete banner')
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' })
      setAnnouncements(announcements.filter(a => a.id !== id))
      toast.success('Announcement deleted')
    } catch {
      toast.error('Failed to delete announcement')
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return
    try {
      await fetch(`/api/admin/news?id=${id}`, { method: 'DELETE' })
      setNews(news.filter(n => n.id !== id))
      toast.success('News deleted')
    } catch {
      toast.error('Failed to delete news')
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return
    try {
      await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      setBlogs(blogs.filter(b => b.id !== id))
      toast.success('Blog deleted')
    } catch {
      toast.error('Failed to delete blog')
    }
  }

  // loading moved to content area

  const handleSaveBranding = async () => {
    setIsSavingBranding(true)
    try {
      const res = await fetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding)
      })
      if (res.ok) {
        toast.success('Branding updated successfully!')
      } else {
        toast.error('Failed to update branding')
      }
    } catch (e) {
      toast.error('Failed to update branding')
    } finally {
      setIsSavingBranding(false)
    }
  }

  const renderBranding = () => (
    <div className="space-y-6">
      {brandingError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded break-words">
          <h3 className="font-bold mb-2">API Error Fetching Branding:</h3>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(brandingError, null, 2)}</pre>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">App Branding & Settings</h2>
        <Button onClick={handleSaveBranding} disabled={isSavingBranding} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
          {isSavingBranding ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>App Name</Label>
            <Input value={branding.appName || ''} onChange={e => setBranding({...branding, appName: e.target.value})} placeholder="Super App" />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={branding.tagline || ''} onChange={e => setBranding({...branding, tagline: e.target.value})} placeholder="Your Tagline" />
          </div>
          <div className="space-y-4 md:col-span-2">
            <Label>App Logo</Label>
            <MediaUploader
              value={branding.appLogoUrl}
              onChange={url => setBranding({...branding, appLogoUrl: url, logoUrl: url})}
              guideline="logo"
              folder="branding"
              label="Upload App Logo (Desktop/Header)"
            />
          </div>
          <div className="space-y-4 md:col-span-2">
            <Label>Favicon</Label>
            <MediaUploader
              value={branding.faviconUrl}
              onChange={url => setBranding({...branding, faviconUrl: url})}
              guideline="logo"
              folder="branding"
              label="Upload Favicon (192x192 recommended)"
            />
          </div>
          <div className="space-y-4 md:col-span-2">
            <Label>Mobile App Icon (PWA)</Label>
            <MediaUploader
              value={branding.pwaIconUrl}
              onChange={url => setBranding({...branding, pwaIconUrl: url})}
              guideline="logo"
              folder="branding"
              label="Upload PWA Icon (512x512 recommended)"
            />
          </div>
          <div className="space-y-2">
            <Label>Primary Color Hex</Label>
            <Input type="color" className="h-10 px-1 py-1" value={branding.primaryColorHex || '#4169E1'} onChange={e => setBranding({...branding, primaryColorHex: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input value={branding.whatsappNumber || ''} onChange={e => setBranding({...branding, whatsappNumber: e.target.value})} placeholder="+91..." />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={branding.email || ''} onChange={e => setBranding({...branding, email: e.target.value})} placeholder="contact@..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Input value={branding.address || ''} onChange={e => setBranding({...branding, address: e.target.value})} placeholder="123 Main St..." />
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 pb-20 md:pb-0">
      
      {/* Mobile Horizontal Tabs */}
      <div className="md:hidden flex overflow-x-auto hide-scrollbar bg-white p-4 gap-2 border-b border-gray-200 sticky top-0 z-40">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
        <TabButton active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={Settings} label="Branding" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users" />
        <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} icon={Store} label="Listings" />
        <TabButton active={activeTab === 'realestate'} onClick={() => setActiveTab('realestate')} icon={Home} label="Property" />
        <TabButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={Newspaper} label="News" />
        <TabButton active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={FileText} label="Blogs" />
        <TabButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={ImageIcon} label="Banners" />
        <TabButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={Megaphone} label="Ticker" />
      </div>

      {/* Desktop Left Sidebar (20%) */}
      <div className="hidden md:flex flex-col w-[20%] bg-white border-r border-gray-200 p-6 gap-4 sticky top-0 h-screen">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h2>
        <SidebarButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
        <SidebarButton active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={Settings} label="Branding" />
        <SidebarButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Users Management" />
        <SidebarButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} icon={Store} label="Listings" />
        <SidebarButton active={activeTab === 'realestate'} onClick={() => setActiveTab('realestate')} icon={Home} label="Real Estate" />
        <SidebarButton active={activeTab === 'news'} onClick={() => setActiveTab('news')} icon={Newspaper} label="News" />
        <SidebarButton active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={FileText} label="Blogs" />
        <SidebarButton active={activeTab === 'banners'} onClick={() => setActiveTab('banners')} icon={ImageIcon} label="Banners & Ads" />
        <SidebarButton active={activeTab === 'announcements'} onClick={() => setActiveTab('announcements')} icon={Megaphone} label="Announcements" />
      </div>

      {/* Main Content (80%) */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {(!isMounted || loading) ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#4169E1] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium animate-pulse">Loading data...</p>
            </div>
          </div>
        ) : (role !== 'super_admin' && role !== 'city_admin' && role !== 'admin' && process.env.NODE_ENV !== 'development') ? (
          <ForbiddenPage />
        ) : (
          <>
            {(role !== 'super_admin' && role !== 'city_admin' && role !== 'admin' && process.env.NODE_ENV === 'development') && (
              <div className="mx-4 mb-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-700">
                <AlertTriangle className="size-4 shrink-0" />
                Dev Mode: Viewing admin panel as non-admin user.
              </div>
            )}

            {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <Users className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="text-3xl font-black text-gray-900">{users.length}</h3>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Total Users</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <Store className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="text-3xl font-black text-gray-900">{listings.length}</h3>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Listings</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <ImageIcon className="w-8 h-8 text-orange-500 mb-2" />
                <h3 className="text-3xl font-black text-gray-900">{banners.length}</h3>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Banners</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <Megaphone className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="text-3xl font-black text-gray-900">{announcements.length}</h3>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">Announcements</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && renderBranding()}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <Button onClick={() => setIsAddingUser(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> Add User</Button>
            </div>
            {usersError && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded break-words">
                <h3 className="font-bold mb-2">API Error Fetching Users:</h3>
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(usersError, null, 2)}</pre>
              </div>
            )}
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>
                        <select 
                          value={u.role || 'user'} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-blue-50 text-blue-600 rounded-md px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="city_admin">City Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {users.map(u => (
                <GlassCard key={u.id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{u.fullName}</h3>
                    <p className="text-sm text-gray-500">{u.phone}</p>
                    <select 
                        value={u.role || 'user'} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="mt-2 bg-blue-50 text-blue-600 rounded-md px-2 py-1 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                      <option value="city_admin">City Admin</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listings' && isAddingListing ? <AddListingForm onOpenChange={setIsAddingListing} onSuccess={() => { setIsAddingListing(false); fetchData(); }} /> : activeTab === 'listings' && (<div className="space-y-4"><div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
              <Button onClick={() => setIsAddingListing(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Listing</Button>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                        {l.coverImage ? <img src={l.coverImage} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"><Store className="w-5 h-5 text-gray-400" /></div>}
                        {l.name}
                      </TableCell>
                      <TableCell>{l.category}</TableCell>
                      <TableCell>{l.phoneNumber || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(l.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {listings.map(l => (
                <GlassCard key={l.id} className="p-4 flex flex-row items-center gap-4">
                  {l.coverImage ? <img src={l.coverImage} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><Store className="w-6 h-6 text-gray-400" /></div>}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{l.name}</h3>
                    <p className="text-xs text-gray-500">{l.category} • {l.phoneNumber}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(l.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </GlassCard>
              ))}
              </div>
            </div>
          )}

        {activeTab === 'realestate' && isAddingRealEstate ? <AddRealEstateForm onOpenChange={setIsAddingRealEstate} onSuccess={() => { setIsAddingRealEstate(false); fetchData(); }} /> : activeTab === 'realestate' && (<div className="space-y-4"><div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Real Estate</h1>
              <Button onClick={() => setIsAddingRealEstate(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Property</Button>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {realestate.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                        {r.images?.[0] ? <img src={r.images[0]} className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center"><Home className="w-5 h-5 text-gray-400" /></div>}
                        {r.title}
                      </TableCell>
                      <TableCell>{r.propertyType}</TableCell>
                      <TableCell>₹{r.price}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRealEstate(r.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {realestate.map(r => (
                <GlassCard key={r.id} className="p-4 flex flex-row items-center gap-4">
                  {r.images?.[0] ? <img src={r.images[0]} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><Home className="w-6 h-6 text-gray-400" /></div>}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{r.title}</h3>
                    <p className="text-xs text-gray-500">{r.propertyType} • ₹{r.price}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRealEstate(r.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && isAddingBanner ? <AddBannerForm onOpenChange={setIsAddingBanner} onSuccess={() => { setIsAddingBanner(false); fetchData(); }} /> : activeTab === 'banners' && (<div className="space-y-4"><div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
              <Button onClick={() => setIsAddingBanner(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Shop/Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <img src={b.imageUrl} className="w-24 h-12 rounded object-cover" />
                      </TableCell>
                      <TableCell className="font-medium">{b.shopName || b.title}</TableCell>
                      <TableCell><span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">{b.status}</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(b.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {banners.map(b => (
                <GlassCard key={b.id} className="p-4 overflow-hidden relative">
                  <img src={b.imageUrl} className="w-full h-32 object-cover rounded-xl mb-3" />
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-gray-900">{b.shopName || b.title}</h3>
                      <p className="text-xs font-semibold text-green-600 mt-1">{b.status}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(b.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10 shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && isAddingAnnouncement ? <AddAnnouncementForm onOpenChange={setIsAddingAnnouncement} onSuccess={() => { setIsAddingAnnouncement(false); fetchData(); }} /> : activeTab === 'announcements' && (<div className="space-y-4"><div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
              <Button onClick={() => setIsAddingAnnouncement(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> New Ticker</Button>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Announcement Text</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium max-w-lg truncate">{a.text}</TableCell>
                      <TableCell><span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">Active</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAnnouncement(a.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {announcements.map(a => (
                <GlassCard key={a.id} className="p-4 flex justify-between items-center">
                  <p className="font-medium text-gray-900 line-clamp-2 text-sm flex-1 mr-4">{a.text}</p>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAnnouncement(a.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'news' && isAddingNews ? <AddNewsForm onOpenChange={setIsAddingNews} onSuccess={() => { setIsAddingNews(false); fetchData(); }} /> : activeTab === 'news' && (<div className="space-y-4"><div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">News Articles</h1>
              <Button onClick={() => setIsAddingNews(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> Add News</Button>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map(n => (
                    <TableRow key={n.id}>
                      <TableCell>
                        {n.imageUrl ? <img src={n.imageUrl} className="w-16 h-10 rounded object-cover" /> : <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center"><Newspaper className="w-4 h-4 text-gray-400" /></div>}
                      </TableCell>
                      <TableCell className="font-medium max-w-lg truncate">{n.title}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(n.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {news.map(n => (
                <GlassCard key={n.id} className="p-4 flex flex-row items-center gap-4">
                  {n.imageUrl ? <img src={n.imageUrl} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><Newspaper className="w-6 h-6 text-gray-400" /></div>}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2">{n.title}</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(n.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blogs' && isAddingBlog ? <AddBlogForm onOpenChange={setIsAddingBlog} onSuccess={() => { setIsAddingBlog(false); fetchData(); }} /> : activeTab === 'blogs' && (<div className="space-y-4"><div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
              <Button onClick={() => setIsAddingBlog(true)} className="bg-[#4169E1] hover:bg-blue-700 text-white rounded-full"><Plus className="w-4 h-4 mr-2" /> Add Blog</Button>
            </div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        {b.coverImageUrl ? <img src={b.coverImageUrl} className="w-16 h-10 rounded object-cover" /> : <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-gray-400" /></div>}
                      </TableCell>
                      <TableCell className="font-medium max-w-lg truncate">{b.title}</TableCell>
                      <TableCell><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">{b.isPublished ? 'Yes' : 'Draft'}</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(b.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-3">
              {blogs.map(b => (
                <GlassCard key={b.id} className="p-4 flex flex-row items-center gap-4">
                  {b.coverImageUrl ? <img src={b.coverImageUrl} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><FileText className="w-6 h-6 text-gray-400" /></div>}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2">{b.title}</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(b.id)} className="text-red-500 bg-red-50 rounded-full h-10 w-10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

          </>
        )}
      </div>

      {/* Forms as Modals */}
      
      
      
      
      
      
      <AddUserModal open={isAddingUser} onOpenChange={setIsAddingUser} onSuccess={fetchData} />

    </div>
  )
}

// ─── Reusable Components ────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shrink-0 ${active ? 'bg-[#4169E1] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function SidebarButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${active ? 'bg-[#4169E1] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  )
}

// ─── Simplified Modals ─────────────────────────────────────────────────────────

function AddListingForm({ onOpenChange, onSuccess }: any) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      const payload = {
        name,
        slug,
        category: category || 'Business',
        phoneNumber: phone,
        coverImage: coverUrl,
        userId: 'temp', // Simplification for auto-approve mode
        cityId: 'temp', // Single city mode
      }
      await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success('Listing added')
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('Failed to add listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden flex flex-col relative w-full">
        {/* Mobile: Sticky save button container at bottom. Desktop: Left panel form, Right panel preview */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 relative">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Add Listing</h2>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
          
          <div className="space-y-4 pb-24 md:pb-0">
            <div>
              <Label>Business Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sri Sai Kirana" className="mt-1" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Grocery" className="mt-1" />
            </div>
            <div>
              <Label>Cover Photo</Label>
              <div className="mt-1">
                <MediaUploader onChange={(url) => setCoverUrl(url)} folder="listings" />
              </div>
            </div>
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 text-lg rounded-xl">
              <Save className="w-5 h-5 mr-2" /> Save Listing
            </Button>
          </div>
        </div>

        {/* Desktop Preview */}
        <div className="hidden md:flex flex-1 bg-gray-50 border-l border-gray-200 p-8 flex-col items-center justify-center relative">
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon" className="absolute top-4 right-4"><X className="w-5 h-5"/></Button>
          <div className="w-[300px] h-[500px] bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-gray-100 flex flex-col relative">
            <div className="h-40 bg-gray-200">
              {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-12 h-12 opacity-20"/></div>}
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-bold text-xl">{name || 'Business Name'}</h3>
              <p className="text-gray-500 text-sm mt-1">{category || 'Category'} • {phone || 'Phone'}</p>
            </div>
          </div>
          <div className="absolute bottom-8 right-8">
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#4169E1] hover:bg-blue-700 h-12 px-8 text-lg rounded-full shadow-lg">
              <Save className="w-5 h-5 mr-2" /> Save Listing
            </Button>
          </div>
        </div>
      </div>
  )
}

export function AddNewsForm({ onOpenChange, onSuccess }: any) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        title,
        content,
        imageUrl,
        source: 'Admin',
        cityId: 'temp', // Single city mode
      }
      await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success('News article published')
      if(onSuccess) onSuccess()
      onOpenChange(false)
      setTitle(''); setContent(''); setImageUrl('')
    } catch {
      toast.error('Failed to publish news')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden flex flex-col relative w-full">
        <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
          <h2 className="text-2xl font-bold">Compose News</h2>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 relative">
          
          {/* Main content form */}
          <div className="flex-1 space-y-4">
            <div>
              <Label>Article Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter an engaging title..." className="mt-1 font-semibold text-lg" />
            </div>
            <div>
              <Label>Article Content</Label>
              <div className="mt-1 bg-white">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <Label className="mb-2 block">Featured Image (16:9)</Label>
              <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {imageUrl ? (
                  <img src={imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-xs">No image selected</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <MediaUploader onChange={(url) => setImageUrl(url)} folder="news" label="Upload Featured Image" />
              </div>
            </div>
            
            <Button onClick={handleSubmit} disabled={loading || !title.trim()} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 text-lg rounded-xl shadow-md">
              <Save className="w-5 h-5 mr-2" /> Publish News
            </Button>
          </div>
        </div>
      </div>
  )
}

export function AddBlogForm({ onOpenChange, onSuccess }: any) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      const payload = {
        title,
        slug,
        content,
        coverImageUrl,
        isPublished: true,
      }
      await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success('Blog post published')
      if(onSuccess) onSuccess()
      onOpenChange(false)
      setTitle(''); setContent(''); setCoverImageUrl('')
    } catch {
      toast.error('Failed to publish blog post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden flex flex-col relative w-full">
        <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
          <h2 className="text-2xl font-bold">Write a Blog Post</h2>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 relative">
          
          <div className="flex-1 space-y-4">
            <div>
              <Label>Blog Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Catchy blog title..." className="mt-1 font-semibold text-lg" />
            </div>
            <div>
              <Label>Blog Content</Label>
              <div className="mt-1 bg-white">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <Label className="mb-2 block">Cover Image (16:9)</Label>
              <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {coverImageUrl ? (
                  <img src={coverImageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                    <span className="text-xs">No cover image</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <MediaUploader onChange={(url) => setCoverImageUrl(url)} folder="blogs" label="Upload Cover Image" />
              </div>
            </div>
            
            <Button onClick={handleSubmit} disabled={loading || !title.trim()} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 text-lg rounded-xl shadow-md">
              <Save className="w-5 h-5 mr-2" /> Publish Blog Post
            </Button>
          </div>
        </div>
      </div>
  )
}

function AddBannerForm({ onOpenChange, onSuccess }: any) {
  const [shopName, setShopName] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        title: shopName,
        shopName,
        imageUrl,
        status: 'APPROVED',
      }
      await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success('Banner added')
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('Failed to add banner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden flex flex-col relative w-full">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 relative">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Add Banner Ad</h2>
            <Button variant="outline" className="text-gray-600 rounded-xl" onClick={() => onOpenChange(false)}><ArrowLeft className="w-4 h-4 mr-2" /> Cancel</Button>
          </div>
          
          <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 flex items-start gap-3">
            <Megaphone className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
            <p className="font-semibold text-sm">బ్యానర్ ఖరీదు: ₹99/- రోజుకు <br/><span className="text-green-600">(ప్రస్తుతం ఉచితం - FREE)</span></p>
          </div>

          <div className="space-y-4 pb-24 md:pb-0 mt-2">
            <div>
              <Label>Shop/Business Name</Label>
              <Input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Sri Balaji Mobiles" className="mt-1" />
            </div>
            <div>
              <Label>Banner Image (16:9)</Label>
              <div className="mt-1">
                <MediaUploader onChange={(url) => setImageUrl(url)} folder="banners" />
              </div>
            </div>
          </div>

          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 text-lg rounded-xl">
              <Save className="w-5 h-5 mr-2" /> Save Banner
            </Button>
          </div>
        </div>

        {/* Desktop Preview */}
        <div className="hidden md:flex flex-1 bg-gray-50 border-l border-gray-200 p-8 flex-col items-center justify-center relative">
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon" className="absolute top-4 right-4"><X className="w-5 h-5"/></Button>
          <div className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border-4 border-gray-100 relative">
            <div className="w-full aspect-[16/9] bg-gray-200 flex items-center justify-center relative">
               {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-12 h-12 opacity-20 mb-2"/><span>Banner Preview</span></div>}
               {shopName && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                     <p className="text-white font-bold text-sm">{shopName}</p>
                  </div>
               )}
            </div>
          </div>
          <div className="absolute bottom-8 right-8">
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#4169E1] hover:bg-blue-700 h-12 px-8 text-lg rounded-full shadow-lg">
              <Save className="w-5 h-5 mr-2" /> Save Banner
            </Button>
          </div>
        </div>
      </div>
  )
}

function AddAnnouncementForm({ onOpenChange, onSuccess }: any) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        text,
        isActive: true,
      }
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success('Announcement added')
      onSuccess()
      onOpenChange(false)
      setText('')
    } catch {
      toast.error('Failed to add announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4 flex flex-col relative w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">New Ticker Announcement</h2>
        <Button variant="outline" className="text-gray-600 rounded-xl" onClick={() => onOpenChange(false)}><ArrowLeft className="w-4 h-4 mr-2" /> Cancel</Button></div>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Ticker Text (Telugu/English)</Label>
            <Input value={text} onChange={e => setText(e.target.value)} placeholder="e.g. రేపు చౌటుప్పల్ లో ఫ్రీ మెడికల్ క్యాంప్..." className="mt-1 h-12" />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !text.trim()} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 text-lg rounded-xl mt-4">
            <Save className="w-5 h-5 mr-2" /> Publish Ticker
          </Button>
        </div>
      </div>
  )
}
function AddRealEstateForm({ onOpenChange, onSuccess }: any) {
  const [title, setTitle] = useState('')
  const [propertyType, setPropertyType] = useState('Land')
  const [price, setPrice] = useState('')
  const [bhk, setBhk] = useState('')
  const [area, setArea] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        title,
        propertyType,
        price: Number(price) || 0,
        bhk: Number(bhk) || 0,
        area,
        images: imageUrl ? [imageUrl] : [],
        cityId: 'temp',
        status: 'APPROVED'
      }
      await fetch('/api/admin/realestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      toast.success('Property added')
      if (onSuccess) onSuccess()
      onOpenChange(false)
      setTitle(''); setPrice(''); setImageUrl('')
    } catch {
      toast.error('Failed to add property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4 flex flex-col relative w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Add Real Estate</h2>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Property Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 2 BHK House for sale" />
          </div>
          <div>
            <Label>Type</Label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950">
              <option value="Land">Land</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div>
            <Label>Price (?)</Label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 5000000" />
          </div>
          <div>
            <Label>BHK (If applicable)</Label>
            <Input type="number" value={bhk} onChange={e => setBhk(e.target.value)} placeholder="e.g. 2" />
          </div>
          <div>
            <Label>Area</Label>
            <Input value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 1500 sqft" />
          </div>
          <div className="md:col-span-2">
             <Label>Image</Label>
             <div className="mt-2">
               {imageUrl && <img src={imageUrl} className="w-32 h-32 object-cover rounded-xl mb-4" />}
               <MediaUploader onChange={(url) => setImageUrl(url)} folder="realestate" label="Upload Image" />
             </div>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading || !title.trim()} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 mt-6">
          <Save className="w-5 h-5 mr-2" /> Save Property
        </Button>
      </div>
  )
}

function AddUserModal({ open, onOpenChange, onSuccess }: any) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, role })
      })
      toast.success('User added')
      if (onSuccess) onSuccess()
      onOpenChange(false)
      setFullName(''); setPhone('')
    } catch {
      toast.error('Failed to add user (endpoint might not exist)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add User</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
          </div>
          <div>
            <Label>Role</Label>
            <select value={role} onChange={e => setRole(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950">
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="city_admin">City Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={loading || !fullName.trim() || !phone.trim()} className="w-full bg-[#4169E1] hover:bg-blue-700 h-12 mt-6">
          <Save className="w-5 h-5 mr-2" /> Save User
        </Button>
      </DialogContent>
    </Dialog>
  )
}

