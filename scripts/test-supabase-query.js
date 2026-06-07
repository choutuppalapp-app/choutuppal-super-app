const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testQuery() {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('email', 'superadmin@manacities.in')
    .single();

  console.log("Error:", error);
  console.log("Data:", data);
}

testQuery();
