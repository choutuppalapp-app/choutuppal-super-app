import * as fs from 'fs'
import * as path from 'path'

const dumpPath = path.join(__dirname, 'db_dump.json')
const sqlPath = path.join(__dirname, 'restore_data.sql')

if (!fs.existsSync(dumpPath)) {
  console.error(`Dump file not found at ${dumpPath}`)
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'))

const modelToTable: Record<string, string> = {
  location: 'Location',
  city: 'City',
  user: 'User',
  platformSetting: 'PlatformSetting',
  musicLibrary: 'MusicLibrary',
  videoCategory: 'VideoCategory',
  siteSetting: 'SiteSetting',
  spinPrize: 'SpinPrize',
  announcement: 'Announcement',
  bannerAd: 'BannerAd',
  listing: 'Listing',
  realEstateListing: 'RealEstateListing',
  lead: 'Lead',
  review: 'Review',
  coinTransaction: 'CoinTransaction',
  subscription: 'Subscription',
  story: 'Story',
  news: 'News',
  pushSubscription: 'PushSubscription',
  blog: 'Blog',
  adminRequest: 'AdminRequest',
  profile: 'Profile',
  post: 'Post',
  comment: 'Comment',
  like: 'Like',
  follow: 'Follow',
  verificationRequest: 'VerificationRequest',
  short: 'Short',
  shortLike: 'ShortLike',
  shortComment: 'ShortComment',
  videoPlaylist: 'VideoPlaylist',
  longVideo: 'LongVideo',
  videoProgress: 'VideoProgress',
  transaction: 'Transaction',
  payoutRequest: 'PayoutRequest'
}

// Order of insertion to respect foreign keys
const order = [
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

let sqlContent = '-- Automated seed data restore for Supabase (PostgreSQL)\n\n'

// Disable triggers to prevent recursion or conflict on insert
sqlContent += 'ALTER TABLE public."User" DISABLE TRIGGER on_auth_user_created;\n\n'

for (const model of order) {
  const records = data[model] || []
  const tableName = modelToTable[model]
  if (!tableName || records.length === 0) continue

  sqlContent += `-- Data for ${tableName} (${records.length} rows)\n`

  for (const record of records) {
    const keys = Object.keys(record)
    const columns = keys.map(k => `"${k}"`).join(', ')
    const values = keys.map(key => {
      const val = record[key]
      if (val === null || val === undefined) {
        return 'NULL'
      }
      if (typeof val === 'boolean') {
        return val ? 'TRUE' : 'FALSE'
      }
      if (typeof val === 'number') {
        return val.toString()
      }
      if (typeof val === 'object') {
        const strVal = JSON.stringify(val).replace(/'/g, "''")
        return `'${strVal}'`
      }
      if (typeof val === 'string') {
        // Check if string looks like an ISO date
        if (key === 'createdAt' || key === 'updatedAt' || key === 'startDate' || key === 'endDate' || key === 'expiresAt') {
          return `'${val}'::timestamp`
        }
        return `'${val.replace(/'/g, "''")}'`
      }
      return `'${val.toString().replace(/'/g, "''")}'`
    }).join(', ')

    sqlContent += `INSERT INTO public."${tableName}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`
  }
  sqlContent += '\n'
}

// Re-enable triggers
sqlContent += 'ALTER TABLE public."User" ENABLE TRIGGER on_auth_user_created;\n'

fs.writeFileSync(sqlPath, sqlContent, 'utf-8')
console.log(`Generated SQL file at ${sqlPath}`)
