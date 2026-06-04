'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, AlertTriangle, X, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

const EMERGENCY_CONTACTS = [
  {
    name: 'Ambulance',
    number: '108',
    icon: '🚑',
    color: 'bg-red-500',
    description: 'Emergency Medical Services',
  },
  {
    name: 'Police',
    number: '100',
    icon: '🚔',
    color: 'bg-blue-600',
    description: 'Police Helpline',
  },
  {
    name: 'Blood Bank',
    number: '104',
    icon: '🩸',
    color: 'bg-red-700',
    description: 'Blood Bank & Health Helpline',
  },
  {
    name: 'Women Helpline',
    number: '181',
    icon: '👩',
    color: 'bg-purple-600',
    description: 'Women Safety Helpline',
  },
]

export function SosButton() {
  const [isOpen, setIsOpen] = useState(false)
  // Use individual selectors to prevent re-rendering on unrelated store changes
  const siteSettings = useAppStore((s) => s.siteSettings)

  const whatsappNumber = siteSettings.whatsappSupportNumber || '919912353705'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20Choutuppal%20Team`

  return (
    <>
      {/* Floating WhatsApp Button - Mobile */}
      <motion.a
        whileTap={{ scale: 0.9 }}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[128px] right-4 z-40 md:hidden w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="size-6" />
      </motion.a>

      {/* Floating WhatsApp Button - Desktop */}
      <motion.a
        whileTap={{ scale: 0.9 }}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed bottom-6 right-24 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg items-center justify-center hover:shadow-xl transition-all"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="size-6" />
      </motion.a>

      {/* Floating SOS Button - Mobile */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[72px] right-4 z-40 md:hidden w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white shadow-lg flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(212, 175, 55, 0.4)',
            '0 0 0 12px rgba(212, 175, 55, 0)',
            '0 0 0 0 rgba(212, 175, 55, 0)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="size-6" />
      </motion.button>

      {/* Floating SOS Button - Desktop */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white shadow-lg items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(212, 175, 55, 0.4)',
            '0 0 0 12px rgba(212, 175, 55, 0)',
            '0 0 0 0 rgba(212, 175, 55, 0)',
          ],
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="size-6" />
      </motion.button>

      {/* SOS Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              Emergency SOS
            </DialogTitle>
            <DialogDescription>
              Tap to call emergency services immediately
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {EMERGENCY_CONTACTS.map((contact, index) => (
              <motion.a
                key={contact.number}
                href={`tel:${contact.number}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white/40 hover:bg-white/80 transition-all cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full ${contact.color} text-white flex items-center justify-center text-lg shadow-sm`}
                >
                  {contact.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">
                    {contact.name}
                  </p>
                  <p className="text-xs text-gray-500">{contact.description}</p>
                </div>
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  <Phone className="size-4" />
                  <span className="font-bold text-sm">{contact.number}</span>
                </div>
              </motion.a>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-2">
            Calls are directed to your phone&apos;s dialer
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
