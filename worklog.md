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

---
Task ID: 3
Agent: Main Agent
Task: Permanently fix News/Blog hero image bleed — remove AnimatePresence, strict conditional rendering

Work Log:
- Diagnosed root cause: AnimatePresence mode="wait" with exit={{ opacity: 0 }} keeps HomeView (and its hero image) in the DOM during the fade-out transition, causing the hero image to remain visible when switching to News view
- COMPLETELY REMOVED AnimatePresence from page.tsx — no more transition animations on the main content area
- COMPLETELY REMOVED all motion.div wrappers from renderView() — views are now rendered as plain React components
- Implemented STRICT conditional rendering: a plain switch statement where only ONE view component exists in the DOM at any time
- When currentView === 'news', HomeView is COMPLETELY DESTROYED (not hidden, not faded) — its hero image CANNOT exist in the DOM
- Constrained NewsView featured article image from h-48 sm:h-64 to max-h-[250px] h-48 sm:h-[250px] — never exceeds 250px
- Fixed NewsView skeleton loader from transparent bg-white/40 backdrop-blur-xl to solid bg-white border border-gray-100
- Verified lint passes and dev server compiles cleanly

Stage Summary:
- BUG FIXED: HomeView hero image can NEVER bleed into News view because HomeView is completely destroyed on navigation
- No AnimatePresence, no exit animations, no transition delays — instant view swap
- NewsView featured image capped at max-h-[250px]
- HeroSection still capped at max-h-[300px] as safety net
- Login modal still has solid white card with dark overlay (from previous fix)

---
Task ID: 4
Agent: Main Agent
Task: Implement complete Coupon Code System

Work Log:
- Created `src/hooks/use-coupon-store.ts` — Hydration-safe coupon store using useSyncExternalStore + LocalStorage. Manages Coupon CRUD, apply/remove coupon, discount calculation, auto-code generation. Persists coupons and applied coupon state in LocalStorage.
- Created `src/components/coupon-management.tsx` — Full admin coupon management UI with: Create Coupon Form (auto-generate code, discount type dropdown %/₹, discount value, min purchase, expiry date picker, max usage limit, active/inactive toggle, description), Coupons List Table (code with copy button, discount, expiry, usage progress bar, status toggle, edit/delete actions), Search/filter, Edit Dialog, Delete Confirmation Dialog.
- Created `src/components/apply-coupon.tsx` — User-facing ApplyCoupon component (text input + Apply button, case-insensitive, success/error toasts, applied coupon display with remove button) and CouponDiscountSummary component (pricing breakdown with coupon discount).
- Integrated "Coupons" tab into Admin View (`src/components/admin-view.tsx`) — Added Ticket icon import, CouponManagement import, new TabsTrigger "Coupons" after "Games" tab, new TabsContent with CouponManagement component.
- Integrated ApplyCoupon into PricingSection (`src/components/home/pricing-section.tsx`) — Added coupon input above plan cards, checkout modal with CouponDiscountSummary for selected plan, price display shows discounted price with green strikethrough when coupon is applied.
- Updated SpinWheel (`src/components/spin-wheel.tsx`) — Added coupon segments ("10% Off", "25% Off"), when user wins a coupon it auto-generates a unique code via addCoupon(), auto-copies to clipboard, shows coupon code with copy button and "Apply on Checkout" CTA button, coupon valid for 7 days with 1 usage limit.
- All lint checks pass, dev server compiles cleanly.

Stage Summary:
- Complete Coupon Code System implemented with 6 new/modified files
- Admin can create, edit, delete, toggle coupon status from Admin Panel
- Users can apply coupons at checkout with real-time discount calculation
- Spin & Win integration auto-generates and copies coupon codes
- All data persisted in LocalStorage (coupon list + applied coupon state)
- Case-insensitive coupon input, expiry/usage limit validation

---
Task ID: 1
Agent: Main Agent
Task: Fix infinite loop in use-coupon-store.ts and pricing-section.tsx

Work Log:
- Read use-coupon-store.ts and identified root cause: useSyncExternalStore's getSnapshot functions (readCouponsFromStorage, readAppliedCouponFromStorage) called JSON.parse on every invocation, returning new object/array references each time. React requires getSnapshot to return referentially stable values when data hasn't changed.
- Read pricing-section.tsx and all other consumers (apply-coupon.tsx, coupon-management.tsx, spin-wheel.tsx)
- Rewrote use-coupon-store.ts with:
  - Module-level snapshot caches (_couponsRawString/_couponsParsed, _appliedRawString/_appliedParsed) that compare the raw localStorage string and only re-parse when it changes
  - Stable module-level subscribe functions (subscribeCoupons, subscribeAppliedCoupon) using custom events (choutuppal:coupons-changed, choutuppal:applied-coupon-changed) for same-tab notifications + 'storage' event for cross-tab
  - Stable server snapshots using a module-level _EMPTY_COUPONS constant
  - Cache invalidation in writeCouponsToStorage/writeAppliedCouponToStorage (sets _rawString to undefined before dispatching events)
  - Actions (addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, applyCoupon) read directly from localStorage instead of the cache to always get latest data
- Rewrote pricing-section.tsx with:
  - Replaced getDiscountedTotal callback from hook with useMemo-based discount calculations
  - Added discountAmount and planDiscounts memoized computations
  - Local getDiscountedPrice() function uses the memoized planDiscounts Map
  - Checkout dialog uses pre-computed checkoutDiscountedPrice instead of calling getDiscountedTotal inline
- Lint passes with no errors
- Dev server compiles successfully with no errors

Stage Summary:
- Infinite loop root cause: useSyncExternalStore getSnapshot returning new references on every call via JSON.parse
- Fix: Module-level caching that compares raw localStorage strings and returns cached parsed results when unchanged
- All 5 consuming components verified compatible with the rewritten hook
- Custom events replace synthetic StorageEvents for more reliable same-tab notifications
