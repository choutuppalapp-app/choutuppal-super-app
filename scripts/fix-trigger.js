const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fixTrigger() {
  await client.connect();
  try {
    const query = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public."User" (
    id, "fullName", phone, email, role, "coinsBalance", "subscriptionTier", "createdAt", "updatedAt"
  )
  VALUES (
    new.id::text,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User ' || substring(new.id::text from 1 for 4)),
    NULLIF(coalesce(new.phone, new.raw_user_meta_data->>'phone', ''), ''),
    new.email,
    'user',
    10, -- default coin balance welcome bonus
    'free',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public."Profile" (
    id, "userId", bio, "isPublicFigure", "isVerified", "createdAt", "updatedAt"
  )
  VALUES (
    'profile-' || new.id::text,
    new.id::text,
    '',
    false,
    false,
    now(),
    now()
  )
  ON CONFLICT ("userId") DO NOTHING;

  RETURN new;
END;
$function$
    `;
    await client.query(query);
    console.log('Trigger function updated successfully!');
  } catch (error) {
    console.error('Error updating trigger function:', error);
  } finally {
    await client.end();
  }
}

fixTrigger();
