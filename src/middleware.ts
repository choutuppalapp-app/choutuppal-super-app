import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * ─── Subdomain-Based Multi-Tenancy Middleware ──────────────────
 *
 * This middleware handles:
 * 1. Subdomain routing: choutuppal.mana.in → loads that city's data
 * 2. Localhost dev support: ?city=choutuppal query parameter
 * 3. Root domain (mana.in) → serves default/landing page
 * 4. Invalid subdomain → redirects to root domain
 *
 * Architecture:
 * - The middleware sets custom headers (x-city-subdomain, x-city-id)
 *   that downstream API routes and server components can read.
 * - It does NOT do DB lookups (middleware should be fast).
 * - DB lookup happens in getCityFromHostname() helper on the server side.
 *
 * DEPLOYMENT (Vercel):
 * - Add wildcard domain: *.mana.in
 * - DNS: CNAME * → cname.vercel-dns.com
 */

// Reserved subdomains that are NOT city subdomains
const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'admin', 'mail', 'ftp', 'smtp', 'pop', 'imap',
  'blog', 'docs', 'app', 'staging', 'dev', 'test', 'cdn',
  'assets', 'static', 'media', 'uploads', 'demo',
])

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || 'mana.in'

function extractSubdomain(hostname: string): string | null {
  if (!hostname) return null

  const host = hostname.split(':')[0].toLowerCase()

  // Localhost: no subdomain support (use query param)
  if (host === 'localhost' || host === '127.0.0.1') {
    return null
  }

  // *.localhost pattern for local subdomain testing
  if (host.endsWith('.localhost')) {
    const sub = host.replace('.localhost', '')
    if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
      return sub
    }
    return null
  }

  // Production: *.mana.in pattern
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.replace(`.${ROOT_DOMAIN}`, '')
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) {
      return null
    }
    return sub
  }

  return null
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // ─── Step 1: Extract subdomain from hostname ─────────────
  const subdomain = extractSubdomain(hostname)

  // ─── Step 2: Localhost dev support — ?city= query param ──
  if (!subdomain && (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1'))) {
    const cityParam = url.searchParams.get('city')
    if (cityParam) {
      // Set headers so downstream can read the city
      const response = NextResponse.next()
      response.headers.set('x-city-subdomain', cityParam)
      return response
    }
    // Default on localhost: set choutuppal as default city
    const response = NextResponse.next()
    response.headers.set('x-city-subdomain', 'choutuppal')
    return response
  }

  // ─── Step 3: Root domain (mana.in or www.mana.in) ───────
  if (!subdomain) {
    // Root domain → serve the app with default city
    const response = NextResponse.next()
    response.headers.set('x-city-subdomain', 'choutuppal')
    return response
  }

  // ─── Step 4: Valid city subdomain ────────────────────────
  // Set the subdomain header so API routes can use it
  const response = NextResponse.next()
  response.headers.set('x-city-subdomain', subdomain)
  return response

  // NOTE: We do NOT redirect invalid subdomains here because
  // we don't have DB access in middleware. Invalid subdomains
  // will be handled by the getCityFromHostname() helper in
  // the API routes and page components, which can redirect
  // to the root domain if the subdomain doesn't exist in the DB.
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon\\.ico|og-image\\.png|logo\\.png|robots\\.txt|sitemap\\.xml|sw\\.js|workbox-.*\\.js).*)',
  ],
}
