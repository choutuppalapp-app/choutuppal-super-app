---
Task ID: 1
Agent: Main Agent
Task: Build Ultimate Super Admin Control Panel with Feature Toggles (Kill Switches)

Work Log:
- Read and analyzed existing codebase structure (store, auth-context, super-admin-settings, header, mobile-bottom-nav, city page)
- Confirmed previous Framer Motion errors were already fixed in categories-section, featured-listings, real-estate-section
- Confirmed ProfileView dynamic import was already fixed with simple import() and export default
- Created `/src/hooks/use-app-config.tsx` — React Context + Hook for feature toggle state management with LocalStorage persistence (`manaAppConfig` key), custom event `manaAppConfigChanged` for same-tab reactivity, cross-tab storage event listener, SSR-safe hook (returns defaults when context unavailable)
- Created `/src/components/maintenance-page.tsx` — Full-screen "Site Under Maintenance" overlay with animated gear, auto-refresh countdown, manual retry button, Super Admin link
- Rewrote `/src/components/super-admin-settings.tsx` — Added "Feature Controls" tab with 9 toggle switches, removed ALL Framer Motion (`motion.div`, `motion.p`, `motion.tr`, `AnimatePresence`), replaced with standard HTML + Tailwind transitions. New tabs: Domain, Cities, Payments, Feature Controls
- Updated `/src/app/city/[cityName]/page.tsx` — Integrated useAppConfig into HomeView (conditionally renders CategoriesSection, FeaturedListings, RealEstateSection, NewsSection, FeaturedProfiles, DailySpinSection based on config), integrated into CityPage renderView switch (disabled views redirect to HomeView), added Maintenance Mode check (shows MaintenancePage for non-Super-Admin users)
- Updated `/src/components/mobile-bottom-nav.tsx` — Integrated useAppConfig, conditionally hides Listings tab, Real Estate tab, Post FAB, and Post sheet items based on config
- Updated `/src/components/header.tsx` — Integrated useAppConfig, conditionally hides Blog, News, Explore nav items in both desktop nav and hamburger drawer based on config
- Updated `/src/app/layout.tsx` — Added AppConfigProvider wrapping PWAInstallProvider and all app content
- Fixed SSR error: useAppConfig hook now returns safe defaults instead of throwing when context is undefined during server rendering
- Lint passes clean, page loads with HTTP 200

Stage Summary:
- Feature toggle system fully implemented with 9 kill switches: enablePayments, enableShorts, enableListings, enableRealEstate, enableLeaderProfiles, enableSpinAndWin, enableBlog, enablePushNotifications, maintenanceMode
- All toggles stored in LocalStorage as `manaAppConfig` JSON object with real-time cross-component reactivity
- Super Admin "Feature Controls" tab has beautiful toggle switches with Green/Gray states, descriptions, danger zone for maintenance mode, save/discard/reset buttons, and current status summary
- Maintenance Mode shows full-screen overlay to non-admin users, Super Admins bypass it
- When features are OFF, corresponding UI elements completely disappear from home page, bottom nav, header nav, and view routing
- ZERO Framer Motion remaining in super-admin-settings.tsx (removed all `motion.*` and `AnimatePresence`)
