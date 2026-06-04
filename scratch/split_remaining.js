const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'remaining_seed.sql');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
let chunkIndex = 1;
let currentChunkLines = [];
let currentChunkSize = 0;
const targetSize = 20000; // ~20KB

for (const line of lines) {
  currentChunkLines.push(line);
  currentChunkSize += Buffer.byteLength(line, 'utf8') + 1; // +1 for newline

  // Split when reaching the target size, but only at a table boundary or empty line
  if (currentChunkSize >= targetSize && (line.startsWith('-- Table:') || line.trim() === '')) {
    fs.writeFileSync(path.join(__dirname, `remaining_part${chunkIndex}.sql`), currentChunkLines.join('\n'), 'utf-8');
    console.log(`Saved remaining_part${chunkIndex}.sql: ${currentChunkSize} bytes, ${currentChunkLines.length} lines`);
    chunkIndex++;
    currentChunkLines = [];
    currentChunkSize = 0;
  }
}

if (currentChunkLines.length > 0) {
  fs.writeFileSync(path.join(__dirname, `remaining_part${chunkIndex}.sql`), currentChunkLines.join('\n'), 'utf-8');
  console.log(`Saved remaining_part${chunkIndex}.sql: ${currentChunkSize} bytes, ${currentChunkLines.length} lines`);
}
