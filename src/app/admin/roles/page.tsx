'use client'

import useSWR from 'swr'
import { Shield, Loader2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export default function AdminRolesPage() {
  const { data: users, error, mutate } = useSWR('/api/admin/users', (url) =>
    fetch(url).then((res) => res.json())
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loading = !users && !error

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (res.ok) {
        toast.success('యూజర్ రోల్ విజయవంతంగా నవీకరించబడింది!')
        mutate()
      } else {
        toast.error('రోల్ మార్చడం విఫలమైంది.')
      }
    } catch {
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6 text-gray-900 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          రోల్ మేనేజ్‌మెంట్ (Role Management Panel)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యూజర్ల పాత్రలను (USER, AGENT, ADMIN) ఇక్కడ నిర్వహించండి మరియు అప్‌గ్రేడ్ చేయండి.
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-6 font-semibold">యూజర్లను లోడ్ చేయడం విఫలమైంది.</div>
        ) : users && users.length === 0 ? (
          <div className="text-gray-400 text-center py-8">ఎటువంటి యూజర్లు లేరు.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-gray-500 font-bold uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4">Name (పేరు)</th>
                  <th className="py-3 px-4">Email / Phone</th>
                  <th className="py-3 px-4">Current Role (ప్రస్తుత రోల్)</th>
                  <th className="py-3 px-4 text-right">Change Role (రోల్ మార్చండి)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.isArray(users) && users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/40 transition">
                    <td className="py-3 px-4 font-semibold text-gray-800 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      {u.fullName}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {u.email || u.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        u.role === 'admin' || u.role === 'super_admin'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : u.role === 'agent'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {updatingId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 ml-auto" />
                      ) : (
                        <select
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border rounded-lg px-2 py-1 outline-none bg-gray-50 font-bold text-gray-700 cursor-pointer"
                        >
                          <option value="user">USER</option>
                          <option value="agent">AGENT</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
export { AdminRolesPage }
