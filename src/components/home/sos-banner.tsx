'use client'

import { motion } from 'framer-motion'
import { Phone, Truck, Shield, Droplets } from 'lucide-react'
import { GlassCard } from '@/components/glass-card'

const SOS_CONTACTS = [
  {
    name: 'Ambulance',
    number: '108',
    icon: Truck,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
  },
  {
    name: 'Police',
    number: '100',
    icon: Shield,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  {
    name: 'Blood Bank',
    number: '104',
    icon: Droplets,
    color: 'bg-red-700',
    hoverColor: 'hover:bg-red-800',
  },
]

export function SosBanner() {
  return (
    <section className="px-4 py-3">
      <GlassCard className="!p-4 border-red-200/40 bg-gradient-to-r from-red-50/60 to-white/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"
            >
              <Phone className="size-4 text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-red-700">Emergency SOS</h3>
              <p className="text-[10px] text-red-500/80">అత్యవసర సహాయం</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {SOS_CONTACTS.map((contact, index) => (
              <motion.a
                key={contact.number}
                href={`tel:${contact.number}`}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${contact.color} ${contact.hoverColor} text-white text-xs font-semibold shadow-sm transition-colors`}
              >
                <contact.icon className="size-3.5" />
                <span>{contact.number}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  )
}
