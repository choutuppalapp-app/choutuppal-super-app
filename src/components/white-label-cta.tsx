'use client'

import { HelpCircle, ArrowRight } from 'lucide-react'

export default function WhiteLabelCTA() {
  const whatsappUrl = `https://wa.me/918790083706?text=${encodeURIComponent(
    'నమస్తే, నేను మా ప్రాంతం కోసం వైట్ లేబుల్ సూపర్ యాప్ ను ప్రారంభించాలనుకుంటున్నాను. దయచేసి డెమో మరియు ధరల వివరాలను పంపగలరు.'
  )}`

  return (
    <section className="px-4 py-6 w-full">
      <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center text-center gap-5 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <span className="p-3 rounded-full bg-yellow-50 text-yellow-600 shrink-0">
            <HelpCircle className="w-8 h-8" />
          </span>
          <h3 className="font-extrabold text-lg text-gray-900 leading-snug">
            వైట్ లేబుల్ యాప్స్ (White Label Apps)
          </h3>
          <p className="text-sm text-gray-650 leading-relaxed max-w-md">
            ఇలాంటి సూపర్ యాప్ ని మీ స్వంత బ్రాండింగ్, మీ లోగో మరియు ఫీచర్లతో మీ నియోజకవర్గం లేదా పట్టణం లో ప్రారంభించండి. మా టెక్నాలజీ సపోర్ట్ తో మీ సొంత యాప్ బిజినెస్ సామ్రాజ్యాన్ని నెలకొల్పండి.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>యాప్ డెమో & ధరల కోసం వాట్సాప్ చేయండి</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  )
}
export { WhiteLabelCTA }
