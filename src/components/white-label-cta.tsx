'use client'

import { HelpCircle, PhoneCall } from 'lucide-react'

export default function WhiteLabelCTA() {
  const handleContact = () => {
    window.location.href = 'tel:+919876543210'
  }

  return (
    <section className="px-4 py-4 w-full">
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-sm text-gray-900 leading-snug">
              వైట్ లేబుల్ యాప్స్ (White Label Apps)
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
            ఇలాంటి యాప్ మీ ఊరికి కూడా కావాలా? మీ స్వంత బ్రాండింగ్‌తో సూపర్ యాప్‌ను ప్రారంభించండి.
          </p>
        </div>

        <button
          onClick={handleContact}
          className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 px-5 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5 text-xs whitespace-nowrap self-start md:self-center"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          మమ్మల్ని సంప్రదించండి
        </button>
      </div>
    </section>
  )
}
export { WhiteLabelCTA }
