export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
        },
      }
    )
    
    let session: any = null;
    let authUser: any = null;
    const authHeader = request?.headers?.get('authorization') || request?.headers?.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user) {
        authUser = user;
        session = { user };
      }
    }
    
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession()
      session = sessionData?.session;
    }

    if (!session) {
      console.error('Session failed to parse in API: ' + (request?.url || '/api/settings')); return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }


    const users = await db.user.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { listings: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
        },
      }
    )
    
    let session: any = null;
    let authUser: any = null;
    const authHeader = request?.headers?.get('authorization') || request?.headers?.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user) {
        authUser = user;
        session = { user };
      }
    }
    
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession()
      session = sessionData?.session;
    }

    if (!session) {
      console.error('Session failed to parse in API: ' + (request?.url || '/api/settings')); return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }


    const body = await request.json()
    const { userId, action, newRole } = body

    if (!userId || !action) return NextResponse.json({ error: 'userId and action required' }, { status: 400 })

    if (action === 'changeRole') {
      await db.user.update({
        where: { id: userId },
        data: { role: newRole },
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
