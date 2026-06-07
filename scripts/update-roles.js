const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function updateRoles() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to DB for updating roles');

    await client.query(`UPDATE public."User" SET role = 'SUPER_ADMIN' WHERE email = 'superadmin@manacities.in'`);
    await client.query(`UPDATE public."User" SET role = 'CITY_ADMIN' WHERE email = 'cityadmin@manacities.in'`);
    await client.query(`UPDATE public."User" SET role = 'AGENT' WHERE email = 'agent@manacities.in'`);
    
    console.log('Roles updated successfully');
  } catch (err) {
    console.error('Error during role update:', err);
  } finally {
    await client.end();
  }
}

updateRoles();
