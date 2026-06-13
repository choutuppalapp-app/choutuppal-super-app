const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.user.findUnique({ where: { phone: '919999999991' } });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Clear today's transaction so we can spin
    await prisma.coinTransaction.deleteMany({
      where: { userId: user.id, reason: { contains: 'Spin' } }
    });
    
    const res = await fetch('https://choutuppal.in/api/spin', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }) 
    });
    console.log('[Spin API] HTTP ' + res.status);
    const text = await res.text();
    console.log('Data: ' + text);
  } catch(e) {
    console.log('[Spin API] Failed: ' + e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
