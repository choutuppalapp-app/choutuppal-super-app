'use client'

import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function AgentCTA() {
  const whatsappUrl = `https://wa.me/918790083706?text=${encodeURIComponent(
    'నమస్తే, నేను చౌటుప్పల్ సూపర్ యాప్ ఏజెంట్ గా చేరాలనుకుంటున్నాను. దయచేసి రిజిస్ట్రేషన్ మరియు కమీషన్ వివరాలను పంపగలరు.'
  )}`

  return (
    <section className="px-4 py-6 w-full">
      <div className="bg-white border border-gray-150 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center text-center gap-5 max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <span className="p-3 rounded-full bg-blue-50 text-blue-900 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </span>
          <h3 className="font-extrabold text-lg text-gray-900 leading-snug">
            ఏజెంట్ అవ్వండి (Become an Agent)
          </h3>
          <p className="text-sm text-gray-650 leading-relaxed max-w-md">
            చౌటుప్పల్ సూపర్ యాప్ అధికారిక ఏజెంట్ గా మారండి. మీ ప్రాంతంలోని దుకాణాలు, వ్యాపారాలు మరియు స్థానిక సేవలను యాప్ లో నమోదు చేస్తూ ప్రతి నెలా ఆకర్షణీయమైన కమీషన్లు మరియు ఆదాయాన్ని సంపాదించుకోండి.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-900 to-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>ఏజెంట్ రిజిస్ట్రేషన్ కోసం వాట్సాప్ చేయండి</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  )
}
export { AgentCTA }
