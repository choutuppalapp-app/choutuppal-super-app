import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
      where: {},
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        subscriptionTier: true,
        coinsBalance: true,
        createdAt: true,
        city: { select: { name: true } },
        managedCity: { select: { id: true, name: true } },
        agentCityId: true,
        isAgentApproved: true,
        upiId: true,
        bankDetails: true,
        totalEarnings: true,
        pendingPayout: true,
        agentCity: { select: { id: true, name: true } },
        location: { select: { id: true, state: true, district: true, city: true } },
        _count: { select: { listings: true, leads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    
  console.log('Returned array length:', users.length)
}

main()
  .catch(e => { console.error('Prisma Error:', e.message); })
  .finally(async () => {
    await prisma.$disconnect()
  })
