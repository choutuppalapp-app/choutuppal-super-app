const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['superadmin@manacities.in', 'cityadmin@manacities.in', 'agent@manacities.in', 'user@manacities.in'] } }
  });
  console.log('DB RESULT:');
  users.forEach(u => console.log(`Email: ${u.email}, Role: ${u.role}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
