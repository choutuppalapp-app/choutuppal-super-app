import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function DELETE(req: Request, { params }: { params: { id: string } | Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Delete Supabase Auth first
    await supabaseAdmin.auth.admin.deleteUser(id);

    // Delete associated records in transaction
    await db.$transaction([
      db.listing.deleteMany({ where: { userId: id } }),
      db.realEstateListing.deleteMany({ where: { userId: id } }),
      db.story.deleteMany({ where: { userId: id } }),
      db.post.deleteMany({ where: { authorId: id } }),
      db.news.deleteMany({ where: { authorId: id } }),
      db.blog.deleteMany({ where: { authorId: id } }),
      db.bannerAd.deleteMany({ where: { userId: id } }),
      db.review.deleteMany({ where: { userId: id } }),
      db.user.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete User Error:', err);
    return NextResponse.json({ error: 'Cannot delete user because they have protected associated records, or another database error occurred.' }, { status: 400 });
  }
}
