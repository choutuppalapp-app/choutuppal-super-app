'use client'

import { HelpCircle } from 'lucide-react'

export default function WhiteLabelCTA() {
  return (
    <section className="px-4 py-4 w-full">
      <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </span>
          <h3 className="font-extrabold text-sm text-gray-900 leading-snug">
            వైట్ లేబుల్ యాప్స్ (White Label Apps)
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed max-w-sm whitespace-pre-line">
            ఇలాంటి యాప్ మీ ఊరికి కూడా కావాలా?<br />
            మీ స్వంత బ్రాండింగ్తో సూపర్ యాప్ను<br />
            ప్రారంభించండి.
          </p>
        </div>

        <a
          href="https://wa.me/918790083706"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5 text-xs"
        >
          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.156 5.159.001 11.505.001c3.078.001 5.97 1.202 8.138 3.372c2.169 2.169 3.37 5.061 3.37 8.139c-.002 6.344-5.158 11.5-11.505 11.5c-2.001-.001-3.973-.521-5.724-1.512L0 24zm6.59-4.846c1.6.95 3.198 1.451 4.854 1.452c5.297 0 9.605-4.307 9.607-9.607c.001-2.568-1.002-4.984-2.825-6.808C16.407 2.368 13.993 1.363 11.5 1.363c-5.296 0-9.604 4.307-9.606 9.608c-.001 1.737.464 3.432 1.346 4.933l-.97 3.541l3.633-.953zm11.758-6.196c-.296-.148-1.755-.867-2.027-.966c-.273-.099-.471-.148-.67.149c-.198.297-.768.966-.941 1.164c-.173.198-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.297-.347.446-.521c.151-.174.2-.298.3-.496c.099-.198.05-.372-.025-.521c-.075-.148-.67-1.611-.918-2.206c-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          WhatsApp: 8790083706
        </a>
      </div>
    </section>
  )
}
export { WhiteLabelCTA }
