import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- DB AUDIT START ---')
  const userCount = await prisma.user.count()
  console.log('User Count:', userCount)
  if (userCount > 0) {
    const users = await prisma.user.findMany({ take: 2 })
    console.log('Sample Users:', users)
  }

  const siteSettingsCount = await prisma.siteSetting.count()
  console.log('SiteSetting Count:', siteSettingsCount)
  if (siteSettingsCount > 0) {
    const siteSettings = await prisma.siteSetting.findFirst()
    console.log('SiteSetting:', siteSettings)
  }

  const appBrandingCount = await prisma.appBranding.count()
  console.log('AppBranding Count:', appBrandingCount)
  if (appBrandingCount > 0) {
    const appBranding = await prisma.appBranding.findFirst()
    console.log('AppBranding:', appBranding)
  }
  
  console.log('--- DB AUDIT END ---')
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
