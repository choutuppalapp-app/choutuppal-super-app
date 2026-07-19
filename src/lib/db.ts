import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL environment variable is missing!')
}

console.log("Initializing Prisma Client with updated DB credentials...");

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors and warnings, not every query (which floods the console)
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
