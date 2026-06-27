'use client';

import React, { useEffect, useState } from 'react';
import { getAdminUsers, updateAdminUserRole, toggleAdminUserPremium, resetAdminUserPassword, deleteAdminUser } from '@/app/actions/admin-actions';
import { Trash2, Key, Crown, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // store userId + action

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(`${userId}-role`);
    try {
      await updateAdminUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePremiumToggle = async (userId: string, currentTier: string) => {
    const isPremium = currentTier === 'premium';
    setActionLoading(`${userId}-premium`);
    try {
      await toggleAdminUserPremium(userId, !isPremium);
      setUsers(users.map(u => u.id === userId ? { ...u, subscriptionTier: !isPremium ? 'premium' : 'free' } : u));
      toast.success(!isPremium ? 'User upgraded to Premium 👑' : 'Premium removed');
    } catch (error) {
      toast.error('Failed to toggle premium');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (!email) {
      toast.error('User has no email');
      return;
    }
    setActionLoading(`${userId}-reset`);
    try {
      await resetAdminUserPassword(email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setActionLoading(`${userId}-delete`);
    try {
      await deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-[#4169E1]" />
          Users Management
        </h3>
        <div className="text-sm text-gray-500 font-bold bg-white px-3 py-1 rounded-full border border-gray-200">
          Total: {users.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Premium</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{user.fullName || 'No Name'}</div>
                  <div className="text-xs text-gray-500">{user.id.slice(0, 8)}...</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{user.email || 'No Email'}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{user.phone || 'No Phone'}</div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role || 'user'}
                    disabled={actionLoading === `${user.id}-role`}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-2 py-1 text-xs font-semibold focus:ring-[#4169E1] focus:border-[#4169E1] transition-all"
                  >
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="city_manager">City Manager</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handlePremiumToggle(user.id, user.subscriptionTier)}
                    disabled={actionLoading === `${user.id}-premium`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      user.subscriptionTier === 'premium'
                        ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20'
                        : 'bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200'
                    }`}
                  >
                    <Crown className={`w-3.5 h-3.5 ${user.subscriptionTier === 'premium' ? 'fill-current' : ''}`} />
                    {user.subscriptionTier === 'premium' ? 'Premium' : 'Standard'}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleResetPassword(user.id, user.email)}
                      disabled={actionLoading === `${user.id}-reset`}
                      title="Force Password Reset"
                      className="p-2 text-gray-500 hover:text-[#4169E1] hover:bg-blue-50 rounded-lg transition"
                    >
                      {actionLoading === `${user.id}-reset` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={actionLoading === `${user.id}-delete`}
                      title="Delete User"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      {actionLoading === `${user.id}-delete` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
