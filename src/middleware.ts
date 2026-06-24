import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Only protect /api/admin routes
  if (!request.nextUrl.pathname.startsWith('/api/admin')) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 })
  }

  // Unfortunately, Supabase auth.getUser() does not return our custom `role` from the public.User table.
  // We need to fetch the role from our custom API or check it securely. 
  // Wait, we can fetch it via standard fetch or query the DB, but middleware can't use Prisma!
  // Prisma doesn't run in Edge runtime.
  
  // Actually, Supabase JWT sometimes contains app_metadata.role if configured.
  // If not, we can just fetch the user profile via Supabase Data API (REST).
  const { data: profile } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'city_admin' && profile.role !== 'agent')) {
    return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
  }

  return response
}

export const config = {
  matcher: [
    '/api/admin/:path*',
  ],
}
