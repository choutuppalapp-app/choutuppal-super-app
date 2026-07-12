'use client'

import { ShieldCheck, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AgentCTA() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard?tab=agent')
  }

  return (
    <section className="px-4 py-4 w-full">
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-sm text-gray-900 leading-snug">
              ఏజెంట్ అవ్వండి (Become an Agent)
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
            చౌటుప్పల్ యాప్ ఏజెంట్ గా మారండి - మీ ఊరిలో వ్యాపారాలను యాడ్ చేస్తూ కమీషన్ సంపాదించండి.
          </p>
        </div>

        <button
          onClick={handleClick}
          className="bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold py-2.5 px-5 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5 text-xs whitespace-nowrap self-start md:self-center"
        >
          ఏజెంట్ గా నమోదు చేసుకోండి
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  )
}
export { AgentCTA }
