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
