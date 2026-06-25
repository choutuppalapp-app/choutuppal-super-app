'use client'

import { useState, useEffect } from 'react'
import {
  Users, Store, Image as ImageIcon, Settings, Plus, Trash2, CheckCircle, X, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import Image from 'next/image'
import { GlassCard } from '@/components/glass-card'
import { supabase } from '@/lib/supabase'

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'banners' | 'branding'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [branding, setBranding] = useState<any>(null)
  
  const [loading, setLoading] = useState(true)
  const [errorLogs, setErrorLogs] = useState<string[]>([])
  
  const [isSavingBranding, setIsSavingBranding] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setErrorLogs([])
    
    try {
      const [{ data: usersData, error: usersErr }, { data: listingsData, error: listingsErr }, { data: bannersData, error: bannersErr }, { data: brandingData, error: brandingErr }] = await Promise.all([
        supabase.from('User').select('id, fullName, phone, email, role, createdAt').order('createdAt', { ascending: false }),
        supabase.from('Listing').select('*').order('createdAt', { ascending: false }),
        supabase.from('BannerAd').select('*').order('createdAt', { ascending: false }),
        supabase.from('SiteSetting').select('*').limit(1).maybeSingle()
      ]);

      if (usersErr) throw usersErr;
      if (listingsErr) throw listingsErr;
      if (bannersErr) throw bannersErr;
      if (brandingErr) throw brandingErr;

      setUsers(usersData || []);
      setListings(listingsData || []);
      setBanners(bannersData || []);
      setBranding(brandingData || { appLogoUrl: '/brand-logo.png', heroHeadline: 'Discover Choutuppal - Your Town, One App' });
    } catch (e: any) {
      setErrorLogs(prev => [...prev, e.message || 'Unknown error'])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      const { error } = await supabase.from('User').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch (err) {
      toast.error('Failed to delete user')
    }
  }

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return
    try {
      const { error } = await supabase.from('Listing').delete().eq('id', id);
      if (error) throw error;
      setListings(listings.filter(l => l.id !== id))
      toast.success('Listing deleted')
    } catch (err) {
      toast.error('Failed to delete listing')
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    try {
      const { error } = await supabase.from('BannerAd').delete().eq('id', id);
      if (error) throw error;
      setBanners(banners.filter(b => b.id !== id))
      toast.success('Banner deleted')
    } catch (err) {
      toast.error('Failed to delete banner')
    }
  }

  const handleSaveBranding = async () => {
    setIsSavingBranding(true)
    try {
      let error;
      if (branding.id) {
        const { error: updateErr } = await supabase.from('SiteSetting').update(branding).eq('id', branding.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase.from('SiteSetting').insert([branding]);
        error = insertErr;
      }
      if (error) throw error;
      toast.success('Branding saved successfully')
    } catch (err) {
      toast.error('Failed to save branding')
    } finally {
      setIsSavingBranding(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Admin Dashboard...</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col hidden md:flex">
        <h1 className="text-xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        <nav className="space-y-2">
          <Button variant={activeTab === 'users' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('users')}>
            <Users className="w-4 h-4 mr-2" /> Users
          </Button>
          <Button variant={activeTab === 'listings' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('listings')}>
            <Store className="w-4 h-4 mr-2" /> Listings
          </Button>
          <Button variant={activeTab === 'banners' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('banners')}>
            <ImageIcon className="w-4 h-4 mr-2" /> Banners
          </Button>
          <Button variant={activeTab === 'branding' ? 'default' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('branding')}>
            <Settings className="w-4 h-4 mr-2" /> Branding
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {errorLogs.length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h3 className="font-bold mb-2">Errors Encountered:</h3>
            <ul className="list-disc pl-5">
              {errorLogs.map((log, i) => <li key={i}>{log}</li>)}
            </ul>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Users Management</h2>
            <GlassCard className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell>{u.fullName}</TableCell>
                      <TableCell>{u.phone}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Listings Management</h2>
            <GlassCard className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map(l => (
                    <TableRow key={l.id}>
                      <TableCell>{l.name}</TableCell>
                      <TableCell>{l.category}</TableCell>
                      <TableCell>{l.status}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteListing(l.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Banners Management</h2>
            <GlassCard className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>
                        {b.imageUrl && <Image src={b.imageUrl} alt="Banner" width={50} height={50} className="rounded" />}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBanner(b.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </GlassCard>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && branding && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">App Branding & Settings</h2>
              <Button onClick={handleSaveBranding} disabled={isSavingBranding}>
                {isSavingBranding ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
            <GlassCard className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>App Logo URL</Label>
                <Input value={branding.appLogoUrl || ''} onChange={e => setBranding({ ...branding, appLogoUrl: e.target.value })} />
                {branding.appLogoUrl && <Image src={branding.appLogoUrl} alt="Logo" width={100} height={100} className="rounded" />}
              </div>
              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input value={branding.faviconUrl || ''} onChange={e => setBranding({ ...branding, faviconUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hero Headline</Label>
                <Input value={branding.heroHeadline || ''} onChange={e => setBranding({ ...branding, heroHeadline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hero Description</Label>
                <Input value={branding.heroDescription || ''} onChange={e => setBranding({ ...branding, heroDescription: e.target.value })} />
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}
