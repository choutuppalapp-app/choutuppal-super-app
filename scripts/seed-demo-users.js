const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usersToCreate = [
  { 
    email: 'superadmin@manacities.in', 
    password: 'Admin@123', 
    role: 'super_admin',
    full_name: 'Mosin Md',
    phone: '1111111111',
    coins_balance: 5000,
    subscription_tier: 'premium'
  },
  { 
    email: 'cityadmin@manacities.in', 
    password: 'Admin@123', 
    role: 'city_admin',
    full_name: 'Venkat Rao',
    phone: '2222222222',
    managed_city_id: 'choutuppal'
  },
  { 
    email: 'agent@manacities.in', 
    password: 'Agent@123', 
    role: 'agent',
    full_name: 'Rajesh Agent',
    phone: '3333333333',
    agent_city_id: 'choutuppal',
    is_agent_approved: true
  },
  { 
    email: 'user@manacities.in', 
    password: 'User@123', 
    role: 'user',
    phone: '4444444444',
    full_name: 'Guest User'
  }
];

async function seedUsers() {
  console.log('Starting user seeding process...');

  // Get all users first to avoid "Database error creating new user" if they were inserted via raw SQL
  const { data: existingUsersData, error: fetchError } = await supabase.auth.admin.listUsers();
  if (fetchError) {
      console.error('Failed to fetch existing users:', fetchError.message);
      return;
  }
  
  const existingUsers = existingUsersData.users || [];

  for (const user of usersToCreate) {
    try {
      console.log(`\nProcessing user: ${user.email}`);
      
      const existingUser = existingUsers.find(u => u.email === user.email);
      let userId;

      if (existingUser) {
          console.log(`User ${user.email} already exists. Updating password and confirming email.`);
          userId = existingUser.id;
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
              password: user.password,
              email_confirm: true
          });
          if (updateError) {
              console.error(`Failed to update existing user ${user.email}:`, updateError.message);
              continue;
          }
      } else {
          // Create new user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { phone: user.phone, full_name: user.full_name }
          });

          if (authError) {
            console.error(`Error creating user ${user.email}:`, authError.message);
            continue;
          }
          userId = authData.user.id;
          console.log(`Successfully created user: ${user.email} with ID: ${userId}`);
      }

      if(!userId) {
           console.error(`Failed to resolve user ID for ${user.email}. Skipping profile creation.`);
           continue;
      }

      // 2. Create or update profile in public.profiles
      const profileData = {
        id: userId,
        email: user.email,
        role: user.role,
        full_name: user.full_name || null,
        coins_balance: user.coins_balance || 0,
        subscription_tier: user.subscription_tier || 'free',
        managed_city_id: user.managed_city_id || null,
        agent_city_id: user.agent_city_id || null,
        is_agent_approved: user.is_agent_approved || false
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error(`Error upserting profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`Successfully upserted profile for ${user.email} with role: ${user.role}`);
      }

    } catch (err) {
      console.error(`Unexpected error processing ${user.email}:`, err);
    }
  }

  console.log('\nSeeding process completed.');
}

seedUsers();
