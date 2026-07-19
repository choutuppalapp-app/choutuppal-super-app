import { db } from '@/lib/db'
import { LayoutDashboard, Users, Store, PlaySquare, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const usersCount = await db.user.count()
  const listingsCount = await db.listing.count()
  const bannersCount = await db.banner.count()
  const storiesCount = await db.story.count()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          అడ్మిన్ డాష్‌బోర్డ్ అవలోకనం (Overview)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          చౌటుప్పల్ యాప్ యొక్క ప్రస్తుత గణాంకాలు మరియు యాక్టివిటీలను ఇక్కడ పర్యవేక్షించండి.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">మొత్తం యూజర్లు (Users)</p>
            <p className="text-2xl font-black text-gray-955 mt-0.5">{usersCount}</p>
          </div>
        </div>

        {/* Listings Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">మొత్తం లిస్టింగ్స్ (Listings)</p>
            <p className="text-2xl font-black text-gray-955 mt-0.5">{listingsCount}</p>
          </div>
        </div>

        {/* Banners Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">యాక్టివ్ బ్యానర్లు (Banners)</p>
            <p className="text-2xl font-black text-gray-955 mt-0.5">{bannersCount}</p>
          </div>
        </div>

        {/* Stories Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PlaySquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">మొత్తం స్టోరీలు (Stories)</p>
            <p className="text-2xl font-black text-gray-955 mt-0.5">{storiesCount}</p>
          </div>
        </div>
      </div>

      {/* Welcome Card / Instructions */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">త్వరిత చర్యలు (Quick Guide)</h2>
        <p className="text-sm text-gray-650 leading-relaxed">
          ఎడమవైపు సైడ్‌బార్‌లో ఉన్న నావిగేషన్ లింక్‌లను ఉపయోగించి క్రింది విభాగాలను నిర్వహించవచ్చు:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-3 space-y-2">
          <li><strong>Dashboard:</strong> గణాంకాలు మరియు అవలోకనం.</li>
          <li><strong>Banner Ads:</strong> 16:9 హోమ్‌పేజీ బ్యానర్ ప్రకటనలను నిర్వహించడం.</li>
          <li><strong>User Stories:</strong> యూజర్లు పోస్ట్ చేసిన 24 గంటల స్టోరీలను పర్యవేక్షించడం.</li>
          <li><strong>Listings Moderation:</strong> బిజినెస్ మరియు రియల్ ఎస్టేట్ లిస్టింగులను ఆమోదించడం/తొలగించడం.</li>
          <li><strong>Role Management:</strong> వినియోగదారుల పాత్రలను (Roles) నిర్వహించడం.</li>
        </ul>
      </div>
    </div>
  )
}
