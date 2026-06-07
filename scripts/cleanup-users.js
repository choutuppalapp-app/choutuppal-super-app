const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function cleanup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const emails = [
      'superadmin@manacities.in',
      'cityadmin@manacities.in',
      'agent@manacities.in',
      'user@manacities.in'
    ];

    for (const email of emails) {
      const res = await client.query('DELETE FROM auth.users WHERE email = $1 RETURNING id', [email]);
      if (res.rowCount > 0) {
        console.log(`Deleted user ${email} from auth.users (ID: ${res.rows[0].id})`);
      } else {
        console.log(`User ${email} not found in auth.users`);
      }
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await client.end();
    console.log('Cleanup finished');
  }
}

cleanup();
