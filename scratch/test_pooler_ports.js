const { Client } = require('pg');

const host = 'aws-0-ap-south-1.pooler.supabase.com';
const projectRef = 'brtltlwxmouuwmtgjuox';
const username = `postgres.${projectRef}`;
const passwords = ['postgres', 'brtltlwxmouuwmtgjuox', 'password'];

async function test(port, password) {
  const connectionString = `postgresql://${username}:${password}@${host}:${port}/postgres`;
  console.log(`Testing port ${port} with password ${password}...`);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log(`SUCCESS on port ${port}!`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed on port ${port}: ${err.message}`);
    return false;
  }
}

async function run() {
  for (const port of [5432, 6543]) {
    for (const pw of passwords) {
      await test(port, pw);
    }
  }
}

run();
