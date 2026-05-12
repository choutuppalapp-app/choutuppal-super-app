import { create } from 'zustand'

export type ViewType = 'home' | 'explore' | 'news' | 'listing' | 'dashboard' | 'admin' | 'search'

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
}

interface AppState {
  // Navigation
  currentView: ViewType
  selectedListingSlug: string | null
  setSelectedListing: (slug: string | null) => void
  navigateTo: (view: ViewType) => void

  // City
  selectedCity: string
  selectedCityName: string
  setCity: (slug: string, name: string) => void

  // User (synced from auth context)
  currentUser: CurrentUser | null
  setCurrentUser: (user: CurrentUser | null) => void

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

  // Notification
  notifications: Notification[]
  addNotification: (message: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'home',
  selectedListingSlug: null,
  setSelectedListing: (slug) => set({ selectedListingSlug: slug, showBottomNav: !slug }),
  navigateTo: (view) => set({ currentView: view, showBottomNav: view !== 'listing' }),

  // City
  selectedCity: 'choutuppal',
  selectedCityName: 'Choutuppal',
  setCity: (slug, name) => set({ selectedCity: slug, selectedCityName: name }),

  // User — will be set by AuthProvider
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

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
