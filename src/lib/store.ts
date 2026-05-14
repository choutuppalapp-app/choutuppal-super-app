import { create } from 'zustand'

export type ViewType = 'home' | 'explore' | 'news' | 'listing' | 'dashboard' | 'admin' | 'search' | 'blog' | 'blog-detail' | 'community' | 'profile'

interface Notification {
  id: string
  message: string
  time: string
}

interface CurrentUser {
  id: string
  fullName: string
  role: string
  coinsBalance: number
  subscriptionTier: string
  managedCityId?: string | null
  agentCityId?: string | null
  isAgentApproved?: boolean
  totalEarnings?: number
  pendingPayout?: number
  upiId?: string | null
}

export interface SiteSettings {
  id: string
  logoUrl: string | null
  affiliateBaseUrl: string | null
  heroHeadline: string | null
  heroDescription: string | null
  heroImageUrl: string | null
  primaryColor: string
  accentColor: string
  metaTitle: string | null
  metaDescription: string | null
  ogImageUrl: string | null
  whatsappSupportNumber: string
  whatsappCommunityLink: string
  whatsappChannelLink: string
  contactName: string
  contactAddress: string
  contactPhone: string
}

export interface CityData {
  id: string
  name: string
  slug: string
  state: string
  brandName: string
  logoUrl: string | null
  heroImageUrl: string | null
  primaryColor: string
  secondaryColor: string
  latitude: number
  longitude: number
}

// Default settings used before API fetch completes
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: '',
  logoUrl: '/logo.png',
  affiliateBaseUrl: 'https://choutuppal.com',
  heroHeadline: 'Discover Choutuppal — Your Town, One App',
  heroDescription: 'Find the best local businesses, services, real estate, news, and more — all in one super app built for Choutuppal.',
  heroImageUrl: null,
  primaryColor: '#D4AF37',
  accentColor: '#4169E1',
  metaTitle: null,
  metaDescription: null,
  ogImageUrl: null,
  whatsappSupportNumber: '919912353705',
  whatsappCommunityLink: '',
  whatsappChannelLink: '',
  contactName: 'Mosin Md',
  contactAddress: 'Choutuppal, Yadadri, Telangana-508252',
  contactPhone: '9912353705',
}

const DEFAULT_CITY: CityData = {
  id: '',
  name: 'Choutuppal',
  slug: 'choutuppal',
  state: 'Telangana',
  brandName: 'Choutuppal App',
  logoUrl: null,
  heroImageUrl: null,
  primaryColor: '#4169E1',
  secondaryColor: '#D4AF37',
  latitude: 17.2985,
  longitude: 78.9256,
}

interface AppState {
  // Navigation
  currentView: ViewType
  selectedListingSlug: string | null
  selectedBlogSlug: string | null
  setSelectedListing: (slug: string | null) => void
  setSelectedBlogSlug: (slug: string | null) => void
  navigateTo: (view: ViewType) => void

  // City (Multi-Tenancy)
  selectedCity: string
  selectedCityName: string
  currentCity: CityData
  availableCities: CityData[]
  locationDetected: boolean
  locationLoading: boolean
  setCity: (slug: string, name: string) => void
  setCityData: (city: CityData) => void
  setAvailableCities: (cities: CityData[]) => void
  detectLocation: () => void

  // User (synced from auth context)
  currentUser: CurrentUser | null
  setCurrentUser: (user: CurrentUser | null) => void

  // Site Settings (fetched once from API)
  siteSettings: SiteSettings
  setSiteSettings: (settings: SiteSettings) => void
  fetchSiteSettings: () => Promise<void>

  // Agent Role
  agentRole: string | null

  // Platform Settings
  platformSettings: Record<string, string>
  fetchPlatformSettings: () => Promise<void>

  // Dynamic Theme Colors (from current city)
  themePrimary: string
  themeSecondary: string
  applyCityTheme: (city: CityData) => void

  // UI State
  showBottomNav: boolean
  setShowBottomNav: (show: boolean) => void
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showSpinWheel: boolean
  setShowSpinWheel: (show: boolean) => void
  showLeadForm: boolean
  setShowLeadForm: (show: boolean) => void
  leadFormListingId: string | null
  setLeadFormListingId: (id: string | null) => void

  // Admin state
  adminTab: string
  setAdminTab: (tab: string) => void

  // Dashboard state
  dashboardTab: string
  setDashboardTab: (tab: string) => void

  // Social Network state
  selectedProfileUserId: string | null
  setSelectedProfileUserId: (userId: string | null) => void
  communityTab: 'feed' | 'leaders'
  setCommunityTab: (tab: 'feed' | 'leaders') => void

  // Notification
  notifications: Notification[]
  addNotification: (message: string) => void
  clearNotifications: () => void
}

// Haversine distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'home',
  selectedListingSlug: null,
  selectedBlogSlug: null,
  setSelectedListing: (slug) => set({ selectedListingSlug: slug, showBottomNav: !slug }),
  setSelectedBlogSlug: (slug) => set({ selectedBlogSlug: slug }),
  navigateTo: (view) => set({ currentView: view, showBottomNav: view !== 'listing' }),

  // City (Multi-Tenancy)
  selectedCity: 'choutuppal',
  selectedCityName: 'Choutuppal',
  currentCity: DEFAULT_CITY,
  availableCities: [],
  locationDetected: false,
  locationLoading: false,
  setCity: (slug, name) => {
    const cities = get().availableCities
    const city = cities.find(c => c.slug === slug)
    if (city) {
      set({
        selectedCity: slug,
        selectedCityName: name,
        currentCity: city,
      })
      get().applyCityTheme(city)
    } else {
      set({ selectedCity: slug, selectedCityName: name })
    }
  },
  setCityData: (city) => set({ currentCity: city }),
  setAvailableCities: (cities) => set({ availableCities: cities }),
  detectLocation: () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    set({ locationLoading: true })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const cities = get().availableCities
        // Find closest city within 100km
        let closestCity: CityData | null = null
        let minDist = Infinity
        for (const city of cities) {
          const dist = getDistanceKm(latitude, longitude, city.latitude, city.longitude)
          if (dist < minDist) {
            minDist = dist
            closestCity = city
          }
        }
        if (closestCity && minDist <= 100) {
          get().setCity(closestCity.slug, closestCity.name)
        }
        set({ locationDetected: true, locationLoading: false })
      },
      () => {
        // Location denied — default to Choutuppal
        set({ locationDetected: true, locationLoading: false })
      },
      { timeout: 10000, enableHighAccuracy: false }
    )
  },

  // User — will be set by AuthProvider
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Site Settings
  siteSettings: DEFAULT_SITE_SETTINGS,
  setSiteSettings: (settings) => set({ siteSettings: settings }),
  fetchSiteSettings: async () => {
    // Don't re-fetch if we already have settings with an ID
    if (get().siteSettings.id) return
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (!data.error) {
          set({ siteSettings: data })
        }
      }
    } catch {
      // Use defaults — non-critical
    }
  },

  // Agent Role
  agentRole: null,

  // Platform Settings
  platformSettings: {},
  fetchPlatformSettings: async () => {
    try {
      const res = await fetch('/api/platform-settings')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object' && !data.error) {
          set({ platformSettings: data })
        }
      }
    } catch {
      // Non-critical
    }
  },

  // Dynamic Theme Colors
  themePrimary: '#4169E1',
  themeSecondary: '#D4AF37',
  applyCityTheme: (city) => {
    set({
      themePrimary: city.primaryColor,
      themeSecondary: city.secondaryColor,
    })
    // Apply CSS custom properties for dynamic theming
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--theme-primary', city.primaryColor)
      document.documentElement.style.setProperty('--theme-secondary', city.secondaryColor)
    }
  },

  // UI State
  showBottomNav: true,
  setShowBottomNav: (show) => set({ showBottomNav: show }),
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  showSpinWheel: false,
  setShowSpinWheel: (show) => set({ showSpinWheel: show }),
  showLeadForm: false,
  setShowLeadForm: (show) => set({ showLeadForm: show }),
  leadFormListingId: null,
  setLeadFormListingId: (id) => set({ leadFormListingId: id }),

  // Admin state
  adminTab: 'overview',
  setAdminTab: (tab) => set({ adminTab: tab }),

  // Dashboard state
  dashboardTab: 'overview',
  setDashboardTab: (tab) => set({ dashboardTab: tab }),

  // Social Network state
  selectedProfileUserId: null,
  setSelectedProfileUserId: (userId) => set({ selectedProfileUserId: userId }),
  communityTab: 'feed',
  setCommunityTab: (tab) => set({ communityTab: tab }),

  // Notification
  notifications: [],
  addNotification: (message) =>
    set((state) => ({
      notifications: [
        {
          id: Date.now().toString(),
          message,
          time: 'Just now',
        },
        ...state.notifications,
      ].slice(0, 20),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))
