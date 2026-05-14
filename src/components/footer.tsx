'use client'

import { MapPin, Phone, Mail, Heart, Globe } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function Footer() {
  const { selectedCityName, currentCity, themePrimary, themeSecondary, navigateTo } = useAppStore()

  const brandName = currentCity.brandName || 'Choutuppal App'
  const primary = themePrimary || '#4169E1'
  const secondary = themeSecondary || '#D4AF37'

  return (
    <footer className="hidden md:block border-t border-gray-100 bg-white mt-auto shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {currentCity.logoUrl ? (
                <img src={currentCity.logoUrl} alt={brandName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  <span className="text-white font-bold text-sm">{brandName.charAt(0)}</span>
                </div>
              )}
              <span
                className="text-lg font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})` }}
              >
                {brandName}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your super app for {selectedCityName}. Discover businesses, news, services, and
              everything local — all in one place.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              A scalable multi-city platform — white-label ready for 100+ cities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li
                className="hover:text-gray-800 transition-colors cursor-pointer"
                style={{ '--hover-color': secondary } as React.CSSProperties}
                onClick={() => navigateTo('explore')}
              >
                Explore Businesses
              </li>
              <li
                className="hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => navigateTo('news')}
              >
                Local News
              </li>
              <li
                className="hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => navigateTo('blog')}
              >
                Blog
              </li>
              <li
                className="hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => navigateTo('dashboard')}
              >
                List Your Business
              </li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Available Cities</h3>
            <p className="text-sm text-gray-500 mb-2">
              We&apos;re expanding! Currently available in:
            </p>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li className="flex items-center gap-1.5">
                <Globe className="size-3" style={{ color: primary }} />
                <span className="font-medium" style={{ color: primary }}>Choutuppal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="size-3 text-gray-300" />
                Hyderabad
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="size-3 text-gray-300" />
                Warangal
              </li>
              <li className="text-xs text-gray-400 mt-2 italic">
                + More cities coming soon...
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <MapPin className="size-3.5 mt-0.5 shrink-0" style={{ color: secondary }} />
                <span>Choutuppal, Yadadri, Telangana-508252</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" style={{ color: secondary }} />
                <a href="tel:9912353705" className="hover:text-gray-800 transition-colors">
                  +91 99123 53705
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0" style={{ color: secondary }} />
                hello@choutuppal.app
              </li>
              <li className="text-xs text-gray-400 mt-1">
                Managed by Mosin Md
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            Made with <Heart className="size-3 text-red-400" /> in Telangana
          </p>
        </div>
      </div>
    </footer>
  )
}
