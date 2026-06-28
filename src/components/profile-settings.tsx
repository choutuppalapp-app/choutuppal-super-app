'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { deleteMyAccount } from '@/app/actions/user-actions'
import { Loader2, UploadCloud, LogOut, ShieldAlert, Key, User as UserIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import imageCompression from 'browser-image-compression'

export default function ProfileSettings() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [bio, setBio] = useState(user?.bio || '')
  
  const [newPassword, setNewPassword] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUpdatingProfile(true)
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 512, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const fileName = `${user.id}-${Date.now()}`
      
      const { error } = await supabase.storage.from('avatars').upload(fileName, compressedFile)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      setAvatarUrl(publicUrl)
      
      // Auto-save avatar to profile
      await supabase.from('User').update({ avatarUrl: publicUrl }).eq('id', user.id)
      toast({ title: 'Success', description: 'Profile photo updated! Reloading...' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setUpdatingProfile(true)
    try {
      const { error } = await supabase.from('User').update({ fullName, phone, bio }).eq('id', user.id)
      if (error) throw error
      toast({ title: 'Success', description: 'Profile updated successfully! Reloading...' })
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      toast({ title: 'Success', description: 'Password changed successfully!' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    const confirmed = window.confirm(
      "DANGER: Are you absolutely sure you want to permanently delete your account? This action cannot be undone and you will lose all your data."
    )
    if (!confirmed) return

    setDeleting(true)
    try {
      const res = await deleteMyAccount(user.id)
      if (res.success) {
        toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' })
        await logout()
      } else {
        throw new Error(res.error)
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete account', variant: 'destructive' })
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24">
      {/* Profile Photo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        <label className="w-24 h-24 rounded-full bg-gray-100 mb-4 overflow-hidden relative border-4 border-white shadow-md cursor-pointer group">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
              {fullName?.[0] || 'U'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <UploadCloud className="w-6 h-6 text-white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={updatingProfile} />
        </label>
        <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
        <p className="text-gray-500">{phone}</p>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-900">
          <UserIcon className="w-5 h-5 text-blue-600" /> Personal Information
        </div>
        <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell the community about yourself..." className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          <button type="submit" disabled={updatingProfile} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50">
            {updatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-900">
          <Key className="w-5 h-5 text-orange-500" /> Change Password
        </div>
        <form onSubmit={handleUpdatePassword} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={updatingPassword} className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50">
            {updatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden mt-8">
        <div className="p-4 border-b border-red-100 flex items-center gap-2 font-bold text-red-600 bg-red-50">
          <ShieldAlert className="w-5 h-5" /> Danger Zone
        </div>
        <div className="p-5 space-y-4">
          <button onClick={logout} className="w-full flex items-center justify-center p-3 border-2 border-gray-200 hover:bg-gray-50 rounded-xl transition text-gray-700 font-bold gap-2">
            <LogOut className="w-5 h-5" /> Log Out
          </button>
          
          <div className="pt-4 mt-4 border-t border-red-100">
            <p className="text-sm text-red-600 mb-3 text-center">Permanently remove your account and all data.</p>
            <button onClick={handleDeleteAccount} disabled={deleting} className="w-full flex items-center justify-center p-3 bg-red-500 hover:bg-red-600 rounded-xl transition text-white font-bold gap-2 disabled:opacity-50">
              {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
