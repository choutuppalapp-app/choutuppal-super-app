'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Sparkles, Trophy, Gift, Users, Edit3, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SpinCampaign {
  id: string
  sponsorName: string
  offerDetails: string
  totalWinners: number
  isActive: boolean
  createdAt: string
}

export default function AdminSpinCampaignsPage() {
  const { data: activeCampaign, mutate } = useSWR<SpinCampaign | null>(
    '/api/spin-campaign',
    (url) => fetch(url).then((res) => res.json())
  )

  const [sponsorName, setSponsorName] = useState('')
  const [offerDetails, setOfferDetails] = useState('')
  const [totalWinners, setTotalWinners] = useState('10')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sponsorName.trim() || !offerDetails.trim()) {
      toast.error('దయచేసి స్పాన్సర్ పేరు మరియు ఆఫర్ వివరాలను నమోదు చేయండి.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/spin-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorName: sponsorName.trim(),
          offerDetails: offerDetails.trim(),
          totalWinners: parseInt(totalWinners) || 10,
        }),
      })

      if (res.ok) {
        toast.success('ఈ వారపు లక్కీ డ్రా స్పాన్సర్ వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!')
        setSponsorName('')
        setOfferDetails('')
        setTotalWinners('10')
        mutate()
      } else {
        toast.error('స్పాన్సర్ వివరాలు అప్‌డేట్ చేయడంలో విఫలమైంది.')
      }
    } catch (err) {
      console.error(err)
      toast.error('సాంకేతిక సమస్య సంభవించింది.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
          వారపు లక్కీ డ్రా నిర్వహణ (Spin Campaigns)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          హోమ్‌పేజీలో ప్రదర్శించబడే వారపు లక్కీ డ్రా స్పాన్సర్లు, ఆఫర్ల వివరాలు ఇక్కడ మార్చవచ్చు.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Update Form */}
        <div className="lg:col-span-1 bg-white border border-gray-150 p-6 rounded-2xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
            <Edit3 className="w-5 h-5 text-blue-600" />
            కొత్త స్పాన్సర్ వివరాలు
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">స్పాన్సర్ వ్యాపారం పేరు (Sponsor Name)</label>
              <input
                type="text"
                placeholder="ఉదా: చౌటుప్పల్ దర్బార్ బిర్యానీ"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">ఆఫర్ / బహుమతి వివరాలు (Offer Details)</label>
              <textarea
                rows={3}
                placeholder="ఉదా: 5 మంది విజేతలకు ఉచిత చికెన్ బిర్యానీ మరియు మిగిలిన వారికి 20% డిస్కౌంట్ వోచర్లు."
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">మొత్తం విజేతలు (Total Draw Winners)</label>
              <input
                type="number"
                placeholder="10"
                value={totalWinners}
                onChange={(e) => setTotalWinners(e.target.value)}
                className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-3 rounded-xl hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 text-xs shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  అప్‌డేట్ అవుతోంది...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  కొత్త డ్రా సక్రియం చేయండి
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Active Campaign Stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-yellow-500" />
              ప్రస్తుత సక్రియ లక్కీ డ్రా (Active Sponsor)
            </h2>

            {activeCampaign ? (
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50/50 rounded-xl border border-yellow-100 flex items-start gap-4">
                  <div className="p-3 bg-yellow-500 text-white rounded-lg text-2xl shrink-0">
                    🎁
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-yellow-750 bg-yellow-100/50 px-2 py-0.5 rounded-md">
                      ACTIVE WEEKLY DRAW
                    </span>
                    <h3 className="text-xl font-black font-telugu text-gray-900">
                      {activeCampaign.sponsorName}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 leading-normal font-telugu">
                      {activeCampaign.offerDetails}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-150 p-4 rounded-xl flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">డ్రా విజేతలు</div>
                      <div className="text-base font-extrabold text-gray-900">{activeCampaign.totalWinners} విజేతలు</div>
                    </div>
                  </div>

                  <div className="border border-gray-150 p-4 rounded-xl flex items-center gap-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">సృష్టించబడిన తేదీ</div>
                      <div className="text-base font-extrabold text-gray-900">
                        {new Date(activeCampaign.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                ఎటువంటి లక్కీ డ్రా క్యాంపెయిన్ సక్రియంగా లేదు. డీఫాల్ట్ స్పాన్సర్ వివరాలు ప్రదర్శించబడుతున్నాయి.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
