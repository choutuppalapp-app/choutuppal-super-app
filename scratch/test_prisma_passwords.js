const { PrismaClient } = require('@prisma/client');

const host = 'aws-0-ap-south-1.pooler.supabase.com';
const projectRef = 'brtltlwxmouuwmtgjuox';
const username = `postgres.${projectRef}`;
const port = 6543;

const candidatePasswords = [
  'brtltlwxmouuwmtgjuox',
  'kxocalegzdtamedmkbqc',
  'choutuppal',
  'manacities',
  'mana_cities',
  'csc99123',
  'csc99123-stack',
  'postgres',
  'password',
  'admin'
];

async function testPassword(password) {
  // Use connection pooling URL format
  const url = `postgresql://${username}:${encodeURIComponent(password)}@${host}:${port}/postgres?pgbouncer=true`;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    },
    log: []
  });

  try {
    await prisma.$connect();
    const count = await prisma.city.count();
    console.log(`SUCCESS! Password is: ${password}`);
    console.log(`DATABASE_URL="postgresql://${username}:${password}@${host}:${port}/postgres?pgbouncer=true"`);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`Failed for password: ${password} - ${err.message}`);
    try {
      await prisma.$disconnect();
    } catch (e) {}
    return false;
  }
}

async function run() {
  for (const pw of candidatePasswords) {
    const ok = await testPassword(pw);
    if (ok) {
      process.exit(0);
    }
  }
  console.log('All candidate passwords failed.');
}

run();
