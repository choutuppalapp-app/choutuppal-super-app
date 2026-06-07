-- ════════════════════════════════════════════════════════════════
-- Mana Cities — Seed Demo Accounts
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ════════════════════════════════════════════════════════════════

-- Step 1: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  coins_balance INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  avatar_url TEXT,
  managed_city_id TEXT,
  agent_city_id TEXT,
  is_agent_approved BOOLEAN DEFAULT false,
  total_earnings NUMERIC DEFAULT 0,
  pending_payout NUMERIC DEFAULT 0,
  upi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policies (idempotent — won't fail if already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow insert for authenticated'
  ) THEN
    CREATE POLICY "Allow insert for authenticated" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- ════════════════════════════════════════════════════════════════
-- Step 4: Create the 4 demo user accounts
-- ════════════════════════════════════════════════════════════════

-- 1. Super Admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'superadmin@manacities.in',
  crypt('Admin@123', gen_salt('bf')),
  now(), now(), now(), ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, coins_balance, subscription_tier)
SELECT id, 'Mosin Md', 'superadmin@manacities.in', 'super_admin', 5000, 'premium'
FROM auth.users WHERE email = 'superadmin@manacities.in'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin', full_name = 'Mosin Md';

-- 2. City Admin
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'cityadmin@manacities.in',
  crypt('Admin@123', gen_salt('bf')),
  now(), now(), now(), ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, coins_balance, subscription_tier, managed_city_id)
SELECT id, 'Venkat Rao', 'cityadmin@manacities.in', 'city_admin', 0, 'premium', 'choutuppal'
FROM auth.users WHERE email = 'cityadmin@manacities.in'
ON CONFLICT (id) DO UPDATE SET role = 'city_admin', full_name = 'Venkat Rao', managed_city_id = 'choutuppal';

-- 3. Agent
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'agent@manacities.in',
  crypt('Agent@123', gen_salt('bf')),
  now(), now(), now(), ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, coins_balance, subscription_tier, agent_city_id, is_agent_approved)
SELECT id, 'Rajesh Agent', 'agent@manacities.in', 'agent', 200, 'free', 'choutuppal', true
FROM auth.users WHERE email = 'agent@manacities.in'
ON CONFLICT (id) DO UPDATE SET role = 'agent', full_name = 'Rajesh Agent', agent_city_id = 'choutuppal', is_agent_approved = true;

-- 4. Regular User
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'user@manacities.in',
  crypt('User@123', gen_salt('bf')),
  now(), now(), now(), ''
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, coins_balance, subscription_tier)
SELECT id, 'Guest User', 'user@manacities.in', 'user', 50, 'free'
FROM auth.users WHERE email = 'user@manacities.in'
ON CONFLICT (id) DO UPDATE SET role = 'user', full_name = 'Guest User';
