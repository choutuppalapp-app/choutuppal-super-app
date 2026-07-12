import { db } from '@/lib/db'
import { LayoutDashboard, MousePointer, Store, PlaySquare, BellRing } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const bannersData = await db.bannerAd.aggregate({
    _sum: {
      clicks: true
    }
  })
  const totalBannerClicks = bannersData._sum.clicks ?? 0

  const listingsCount = await db.listing.count({
    where: {
      createdAt: {
        gte: startOfToday
      }
    }
  })

  const storiesCount = await db.story.count({
    where: {
      createdAt: {
        gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }
  })

  const pushCount = await db.pushSubscription.count()

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
        {/* Banner Clicks Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MousePointer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">ఈరోజు ఎన్ని బ్యానర్ క్లిక్స్ వచ్చాయి?</p>
            <p className="text-2xl font-black text-gray-950 mt-0.5">{totalBannerClicks}</p>
          </div>
        </div>

        {/* New Listings Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">కొత్తగా ఎన్ని లిస్టింగ్స్ వచ్చాయి?</p>
            <p className="text-2xl font-black text-gray-950 mt-0.5">{listingsCount}</p>
          </div>
        </div>

        {/* Stories Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PlaySquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">ప్రస్తుతం ఉన్న యూజర్ స్టోరీలు</p>
            <p className="text-2xl font-black text-gray-955 mt-0.5">{storiesCount}</p>
          </div>
        </div>

        {/* Push Subscriptions Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">పుష్ నోటిఫికేషన్ సబ్‌స్క్రైబర్లు</p>
            <p className="text-2xl font-black text-gray-955 mt-0.5">{pushCount}</p>
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
          <li><strong>Banner Ads:</strong> యాక్టివ్ బ్యానర్ ప్రకటనలను తొలగించడం లేదా క్లిక్‌లను పర్యవేక్షించడం.</li>
          <li><strong>User Stories:</strong> యూజర్లు పోస్ట్ చేసిన 24 గంటల స్టోరీలను పర్యవేక్షించడం మరియు స్పామ్ తొలగించడం.</li>
          <li><strong>Listings Moderation:</strong> బిజినెస్ మరియు రియల్ ఎస్టేట్ లిస్టింగుల మోడరేషన్.</li>
          <li><strong>Send Notifications:</strong> సబ్‌స్క్రైబ్ చేసుకున్న యూజర్లందరికీ ఒకేసారి పుష్ నోటిఫికేషన్‌లు పంపడం.</li>
        </ul>
      </div>
    </div>
  )
}
