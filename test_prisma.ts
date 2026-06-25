import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const data = {
    appLogoUrl: 'test.png',
    faviconUrl: 'test.png',
    pwaIconUrl: 'test.png'
  }
  
  const brandingData = {
    appName: data.appName,
    tagline: data.tagline,
    logoUrl: data.appLogoUrl || data.logoUrl,
    primaryColorHex: data.primaryColorHex,
    whatsappNumber: data.whatsappNumber,
    email: data.email,
    address: data.address,
  }
  Object.keys(brandingData).forEach(key => brandingData[key] === undefined && delete brandingData[key]);

  console.log('Processed BrandingData:', brandingData)

  const existing = await prisma.appBranding.findFirst()
  let branding;
  if (existing) {
    branding = await prisma.appBranding.update({
      where: { id: existing.id },
      data: brandingData
    })
  } else {
    branding = await prisma.appBranding.create({
      data: brandingData as any
    })
  }
  
  console.log('Success!', branding)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
