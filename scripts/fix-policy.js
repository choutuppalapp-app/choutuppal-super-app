const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fixPolicy() {
  await client.connect();
  try {
    await client.query('DROP POLICY IF EXISTS "select_user" ON public."User"');
    await client.query(`CREATE POLICY "select_user" ON public."User" FOR SELECT USING (id = (auth.uid())::text OR email = (auth.jwt() ->> 'email'))`);
    console.log('Policy updated successfully!');
  } catch (error) {
    console.error('Error updating policy:', error);
  } finally {
    await client.end();
  }
}

fixPolicy();
