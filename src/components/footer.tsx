'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Heart } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function Footer() {
  const { selectedCityName } = useAppStore()

  return (
    <footer className="hidden md:block bg-white/40 backdrop-blur-2xl border-t border-white/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[#4169E1] to-[#D4AF37] bg-clip-text text-transparent">
                Choutuppal 2.0
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your super app for {selectedCityName}. Discover businesses, news, services, and
              everything local — all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">Contact</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">Advertise</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">List Your Business</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-[#D4AF37]" />
                {selectedCityName}, Telangana
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-[#D4AF37]" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-[#D4AF37]" />
                hello@choutuppal.app
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-white/30 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Choutuppal 2.0. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart className="size-3 text-red-400" /> in Telangana
          </p>
        </div>
      </div>
    </footer>
  )
}
