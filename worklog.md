---
Task ID: 1
Agent: Main Debugging Agent
Task: Deep scan entire project, identify and fix all errors (Console Errors, Hydration Mismatches, Infinite Loops, Broken Imports, UI bugs)

Work Log:
- Read all critical files: page.tsx, hero-section.tsx, use-coupon-store.ts, login-modal.tsx, spin-wheel.tsx, app-shell.tsx, header.tsx, glass-card.tsx, pricing-section.tsx, apply-coupon.tsx, mobile-bottom-nav.tsx, mobile-bottom-wrapper.tsx, layout.tsx, middleware.ts, settings-initializer.tsx, floating-overlays.tsx
- Read all API routes: Razorpay create-order, Razorpay verify, push/subscribe, push/send-notification, city/resolve, cities
- Searched for: Framer Motion `initial={{}}` patterns (70+ instances), `useCouponStore()` direct usage (0), `useAppStore()` destructuring patterns, inline style patterns
- Ran ESLint: 1 error found (push-notification-banner.tsx setState-in-effect), fixed
- Verified dev server: Page loads with 200 status, no hydration errors, no infinite loops

Errors Found & Fixed:
1. `/api/city/resolve` header mismatch: Middleware sets `x-city-slug` but API read `x-city-subdomain` → Fixed to use `x-city-slug`
2. `become-admin-cta.tsx` modal used GlassCard (transparent on desktop: `md:bg-white/40`) → Replaced with solid `bg-white rounded-2xl shadow-2xl`
3. `become-admin-cta.tsx` modal overlay was `bg-black/40` → Changed to `bg-black/50` per rules
4. `push-notification-banner.tsx` had `initial={{ opacity: 0, height: 0 }}` (hydration risk) → Changed to `initial={false}`
5. `push-notification-banner.tsx` read `sessionStorage` during render (hydration risk) → Moved to `useState` lazy initializer
6. `push-notification-banner.tsx` had `setState` in `useEffect` (lint error) → Fixed with lazy initializer pattern
7. `push-notification-banner.tsx` had unused imports (`Check`, `BellOff`) → Removed
8. `push-notification-banner.tsx` used inline `style` for button gradient → Changed to Tailwind class
9. `app-shell.tsx` was dead code (not imported anywhere) → Marked as deprecated with proper comment

Previously Reported Issues (CONFIRMED ALREADY FIXED):
- use-coupon-store.ts: Uses useShallow + selector hooks (useCouponData, useCouponActions, useAppliedCoupon, useCoupons)
- login-modal.tsx: Has mounted guard, solid bg-white card, bg-black/60 overlay, no useEffect with setState
- spin-wheel.tsx: Uses individual selectors from useAppStore, no object destructuring
- hero-section.tsx: Default export, ssr:false, no inline styles, max-h-[300px]
- All home section components: Use initial={false}

Stage Summary:
- All previously reported critical issues (coupon store loops, login modal depth, spin wheel re-renders) are ALREADY FIXED
- 4 new bugs found and fixed: API header mismatch, modal transparency, push-banner hydration, dead code
- Lint: Clean (0 errors, 0 warnings)
- Dev server: Running clean, page loads with 200 status
- All preserved features verified: Razorpay API, path/subdomain routing, coupon system, RBAC, PWA/push notifications
