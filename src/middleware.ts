import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ─── Smart City Routing Middleware ─────────────────────────
 *
 * Supports TWO routing modes:
 *
 * 1. Path-based (DEFAULT): /city/choutuppal
 *    - Works everywhere (localhost, Vercel preview, sandbox)
 *    - No custom domain needed
 *
 * 2. Subdomain-based (when activated): choutuppal.mana.in
 *    - Requires wildcard DNS (*.mana.in → Vercel)
 *    - Toggled from Admin Panel via routing config cookie
 *
 * The middleware reads routing config from a cookie to decide
 * which mode to use. Falls back to path-based if no config.
 */

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'admin', 'mail', 'ftp', 'smtp', 'pop', 'imap',
  'blog', 'docs', 'app', 'staging', 'dev', 'test', 'cdn',
  'assets', 'static', 'media', 'uploads', 'demo',
])

const DEFAULT_CITY_SLUG = 'choutuppal'

function extractSubdomain(hostname: string, baseDomain: string): string | null {
  if (!hostname) return null
  const host = hostname.split(':')[0].toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1') return null
  if (host.endsWith('.localhost')) {
    const sub = host.replace('.localhost', '')
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) return sub
    return null
  }
  if (host.endsWith(`.${baseDomain}`)) {
    const sub = host.replace(`.${baseDomain}`, '')
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return null
    return sub
  }
  return null
}

function getRoutingConfigFromCookie(request: NextRequest): {
  baseDomain: string
  subdomainRoutingEnabled: boolean
} {
  try {
    const cookie = request.cookies.get('mana_routing_config')
    if (cookie) {
      const parsed = JSON.parse(cookie.value)
      return {
        baseDomain: parsed.baseDomain || 'mana.in',
        subdomainRoutingEnabled: parsed.routingMode === 'subdomain' && parsed.isCustomDomainActive === true,
      }
    }
  } catch { /* corrupted cookie */ }
  return { baseDomain: 'mana.in', subdomainRoutingEnabled: false }
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname
  const hostname = request.headers.get('host') || ''

  // ─── Skip API routes, static files, PWA assets ─────────
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt' ||
    pathname.includes('.') // static file extensions
  ) {
    return NextResponse.next()
  }

  // ─── Read routing config ──────────────────────────────
  const config = getRoutingConfigFromCookie(request)

  // ─── Subdomain routing mode ───────────────────────────
  const subdomain = extractSubdomain(hostname, config.baseDomain)

  if (subdomain && config.subdomainRoutingEnabled) {
    // Set header so the app knows which city to show
    const response = NextResponse.next()
    response.headers.set('x-city-slug', subdomain)
    response.headers.set('x-routing-mode', 'subdomain')
    return response
  }

  // ─── Root domain with subdomain routing → redirect to default city subdomain
  if (
    config.subdomainRoutingEnabled &&
    !subdomain &&
    !hostname.startsWith('localhost') &&
    !hostname.startsWith('127.0.0.1') &&
    hostname.includes(config.baseDomain)
  ) {
    const redirectUrl = new URL(request.url)
    redirectUrl.hostname = `${DEFAULT_CITY_SLUG}.${config.baseDomain}`
    return NextResponse.redirect(redirectUrl)
  }

  // ─── Path-based routing mode (DEFAULT) ─────────────────

  // Root "/" → Let page.tsx handle it (leader profile page)
  if (pathname === '/' || pathname === '') {
    return NextResponse.next()
  }

  // City route "/city/[slug]" → Set header and pass through
  const cityMatch = pathname.match(/^\/city\/([^/]+)/)
  if (cityMatch) {
    const citySlug = cityMatch[1]
    const response = NextResponse.next()
    response.headers.set('x-city-slug', citySlug)
    response.headers.set('x-routing-mode', 'path')
    return response
  }

  // ─── All other routes → pass through ──────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files, Next.js internals, and PWA assets
    '/((?!_next/static|_next/image|favicon\\.ico|og-image\\.png|logo\\.png|robots\\.txt|sitemap\\.xml|sw\\.js|workbox-.*\\.js|manifest\\.json|icons/).*)',
  ],
}
