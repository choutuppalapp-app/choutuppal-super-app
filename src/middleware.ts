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
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

    let user: any = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { data: userData } = await supabase.auth.getUser(token);
    user = userData?.user;
  }
  
  if (!user) {
    const { data: fallbackData } = await supabase.auth.getUser();
    user = fallbackData?.user;
  }

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
