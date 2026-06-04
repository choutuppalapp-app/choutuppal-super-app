const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'restore_data.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

const lines = content.split('\n');
let currentTable = null;
let queries = {};

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  if (trimmed.startsWith('-- Automated') || trimmed.startsWith('ALTER TABLE')) continue;

  if (trimmed.startsWith('-- Data for')) {
    currentTable = trimmed.substring(12).split(' ')[0];
    queries[currentTable] = [];
    continue;
  }

  if (currentTable && trimmed.startsWith('INSERT INTO')) {
    queries[currentTable].push(trimmed);
  }
}

// Write each table's queries to a separate file or display summary
for (const table of Object.keys(queries)) {
  console.log(`${table}: ${queries[table].length} queries`);
  fs.writeFileSync(path.join(__dirname, `seed_${table}.sql`), queries[table].join('\n'), 'utf-8');
}
