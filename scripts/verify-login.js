const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLogins() {
  const users = [
    { email: 'superadmin@manacities.in', password: 'Admin@123' },
    { email: 'cityadmin@manacities.in', password: 'Admin@123' },
    { email: 'agent@manacities.in', password: 'Agent@123' },
    { email: 'user@manacities.in', password: 'User@123' }
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.password
    });
    if (error) {
      console.error(`❌ Failed to login ${u.email}:`, error.message);
    } else {
      console.log(`✅ Successfully logged in ${u.email} (ID: ${data.user.id})`);
    }
  }
}

verifyLogins();
