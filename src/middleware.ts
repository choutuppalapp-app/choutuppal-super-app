import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Minimal middleware — Next.js 16 deprecates the "middleware" convention
 * in favor of "proxy", but until we migrate, this file provides
 * lightweight route awareness only.
 *
 * Full auth protection is handled by:
 * - Server-side: API route checks (see /api/admin/*)
 * - Client-side: AuthProvider context
 */
export function middleware(_request: NextRequest) {
  // No blocking logic — all routes pass through
  // Admin API protection is handled at the route level
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only match admin API routes (minimal scope to reduce deprecation warnings)
    '/api/admin/:path*',
  ],
}
