import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting data dump from SQLite...')
  const data: Record<string, any[]> = {}

  // List of tables to dump in dependency order (independents first)
  const models = [
    'location',
    'city',
    'user',
    'platformSetting',
    'musicLibrary',
    'videoCategory',
    'siteSetting',
    'spinPrize',
    'announcement',
    'bannerAd',
    'listing',
    'realEstateListing',
    'lead',
    'review',
    'coinTransaction',
    'subscription',
    'story',
    'news',
    'pushSubscription',
    'blog',
    'adminRequest',
    'profile',
    'post',
    'comment',
    'like',
    'follow',
    'verificationRequest',
    'short',
    'shortLike',
    'shortComment',
    'videoPlaylist',
    'longVideo',
    'videoProgress',
    'transaction',
    'payoutRequest'
  ]

  for (const model of models) {
    try {
      const dbModel = (prisma as any)[model]
      if (dbModel) {
        console.log(`Dumping model: ${model}...`)
        const records = await dbModel.findMany()
        data[model] = records
        console.log(`Successfully dumped ${records.length} records for ${model}`)
      } else {
        console.warn(`Model ${model} not found on Prisma Client`)
      }
    } catch (error) {
      console.error(`Error dumping model ${model}:`, error)
    }
  }

  const dumpPath = path.join(__dirname, 'db_dump.json')
  fs.writeFileSync(dumpPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`Data dump complete! Saved to ${dumpPath}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
