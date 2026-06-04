const fs = require('fs');
const path = require('path');

const order = [
  'MusicLibrary',
  'VideoCategory',
  'SiteSetting',
  'SpinPrize',
  'Announcement',
  'BannerAd',
  'Listing',
  'RealEstateListing',
  'Lead',
  'Review',
  'CoinTransaction',
  'Subscription',
  'Story',
  'News',
  'Blog',
  'AdminRequest',
  'Profile',
  'Post',
  'Comment',
  'Like',
  'Follow',
  'Short',
  'VideoPlaylist',
  'LongVideo',
  'Transaction',
  'PayoutRequest'
];

let sqlContent = '-- Remaining seed data restore\n\n';

for (const table of order) {
  const filePath = path.join(__dirname, `seed_${table}.sql`);
  if (fs.existsSync(filePath)) {
    sqlContent += `-- Table: ${table}\n`;
    sqlContent += fs.readFileSync(filePath, 'utf-8');
    sqlContent += '\n\n';
  } else {
    console.log(`Warning: seed_${table}.sql not found`);
  }
}

fs.writeFileSync(path.join(__dirname, 'remaining_seed.sql'), sqlContent, 'utf-8');
console.log('Merged remaining seed SQL written to remaining_seed.sql');
