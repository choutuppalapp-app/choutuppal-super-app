---
Task ID: 1
Agent: Main Agent
Task: Create Super Admin Settings Page with domain/subdomain management

Work Log:
- Read existing project structure: page.tsx, store.ts, city-routing.ts, subdomain.ts, header.tsx, glass-card.tsx, admin-view.tsx, UI components
- Created `src/hooks/use-domain-routing.ts` — Custom hook using useSyncExternalStore for hydration-safe localStorage reads. Provides baseDomain, isCustomDomainActive, subdomainMappings CRUD, getCityUrl routing helper
- Created `src/components/super-admin-settings.tsx` — Complete SuperAdminSettings component with DNS Setup Guide, Base Domain Configuration (input + toggle + save), Subdomain Management (CRUD with auto-generate prefix), Routing Status Banner, Edit Dialog, Delete Confirmation Dialog
- Updated `src/lib/store.ts` — Added 'super-admin' to ViewType union
- Updated `src/app/city/[cityName]/page.tsx` — Added SuperAdminSettings dynamic import with loading placeholder, ProtectedSuperAdmin component (requires super_admin role), 'super-admin' case in renderView, 'super-admin' document title. Also fixed HomeView hydration error: changed `space-y-0 md:space-y-0` to static `space-y-4 md:space-y-8`. Added loading placeholder for ManaShortsFeed dynamic import.
- Updated `src/components/header.tsx` — Added Crown icon import, superAdminOnly property to NAV_LINKS type, 'super-admin' nav link entry, superAdminOnly filter in both desktop and mobile nav sections, isSuperAdmin derived variable
- Ran ESLint — no errors
- Verified dev server compiles cleanly

Stage Summary:
- Super Admin Settings Page fully implemented with all 4 requested features
- HomeView hydration error fixed (static spacing classes)
- ManaShortsFeed loading placeholder added
- Navigation accessible to super_admin role only
- All data persisted in LocalStorage
- Lint passes cleanly

---
Task ID: 2
Agent: Main Agent
Task: Complete rewrite of Layout, Modal, and View Routing to fix 3 critical bugs

Work Log:
- Audited all key files: store.ts, page.tsx, desktop-sidebar.tsx, login-modal.tsx, hero-section.tsx, header.tsx, mobile-bottom-nav.tsx, glass-card.tsx, auth-context.tsx, layout.tsx
- Identified BUG 1 root cause: LoginModal used GlassCard which applies `md:bg-white/40` (60% transparent on desktop). Input fields used `bg-white/50 border-white/40`.
- Identified BUG 2 root cause: AnimatePresence in page.tsx didn't have explicit `key` props on view components, preventing proper unmount/mount cycle when switching views.
- Identified BUG 3 root cause: HeroSection had `py-12 sm:py-16 md:py-20` with no height constraint, causing hero to take full screen.
- COMPLETELY REWROTE login-modal.tsx: Removed GlassCard entirely. Now uses solid `bg-white rounded-2xl shadow-2xl` card with `bg-black/60 backdrop-blur-sm` full-screen overlay. All inputs use `bg-white border-gray-200 text-gray-800`. No transparency anywhere.
- COMPLETELY REWROTE hero-section.tsx: Added `max-h-[300px]` and `overflow-hidden` to section. Reduced padding to `py-8 sm:py-10`. Smaller text sizes. Content fits within 300px cap.
- COMPLETELY REWROTE page.tsx view router: Each view case now returns a `<motion.div key={currentView}>` wrapper with unique key, ensuring React/Framer Motion properly unmounts previous view. HomeView is ONLY rendered when currentView === 'home'. When switching to 'news', ONLY NewsView exists in DOM.
- Fixed header.tsx: Changed `bg-white/80 backdrop-blur-lg` to solid `bg-white` for completely opaque header.
- Verified lint passes cleanly and dev server compiles without errors.

Stage Summary:
- BUG 1 FIXED: Login modal now has solid white card + dark overlay, zero transparency
- BUG 2 FIXED: View routing uses unique keys on AnimatePresence children, ensuring complete view swap
- BUG 3 FIXED: Hero section capped at max-h-[300px] with overflow-hidden
- Header is now fully opaque (bg-white)
- All 3 rewrites are complete rewrites, not patches
