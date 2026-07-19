'use client'

import useSWR from 'swr'
import { Briefcase, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminJobsPage() {
  const { data: list, error, mutate } = useSWR('/api/classifieds?category=JOB', (url) =>
    fetch(url).then((res) => res.json())
  )

  const loading = !list && !error

  const handleDelete = async (id: string) => {
    if (!confirm('ఈ జాబ్ పోస్టును డిలీట్ చేయాలనుకుంటున్నారా?')) return

    try {
      const res = await fetch(`/api/classifieds?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('జాబ్ పోస్ట్ విజయవంతంగా డిలీట్ చేయబడింది.')
        mutate()
      } else {
        toast.error('డిలీట్ చేయడం విఫలమైంది.')
      }
    } catch {
      toast.error('సాంకేతిక లోపం సంభవించింది.')
    }
  }

  return (
    <div className="space-y-6 text-gray-900 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          ఉద్యోగాల మోడరేషన్ (Job Listings Management)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          యాప్‌లోని అన్ని ఉద్యోగ ప్రకటనలను ఇక్కడ పర్యవేక్షించండి మరియు మోడరేట్ చేయండి.
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-6 font-semibold">జాబ్స్ లోడ్ చేయడం విఫలమైంది.</div>
        ) : list && list.length === 0 ? (
          <div className="text-gray-400 text-center py-8">ఎటువంటి జాబ్స్ లేవు.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-gray-500 font-bold uppercase tracking-wider bg-gray-50/50">
                  <th className="py-3 px-4">Title (శీర్షిక)</th>
                  <th className="py-3 px-4">Phone (ఫోన్)</th>
                  <th className="py-3 px-4">Created At (తేదీ)</th>
                  <th className="py-3 px-4 text-right">Actions (చర్యలు)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition">
                    <td className="py-3 px-4 font-semibold text-gray-800">{item.title}</td>
                    <td className="py-3 px-4 font-medium text-gray-600">{item.contactNumber}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
export { AdminJobsPage }
