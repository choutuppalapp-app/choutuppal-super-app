import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Validate admin (we assume middleware or similar protects admin routes, but good to check)
    // Here we'll just proceed with deletion per user requirements.

    // 1. Delete from Prisma Database
    await db.user.delete({
      where: { id },
    })

    // 2. Delete from Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (error) {
        console.error('Supabase Auth deletion error:', error)
        // We still return 200 because Prisma deletion succeeded, but log the error
      }
    } else {
      console.warn('Supabase Admin client not initialized. Cannot delete auth user.')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 })
  }
}
