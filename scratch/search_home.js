const fs = require('fs');
const path = require('path');

const rootDir = 'C:/Users/Citizen2';
const target = 'brtltlwxmouuwmtgjuox';

function searchDir(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        // Skip system/heavy dirs
        if (file.startsWith('.') && file !== '.gemini') continue;
        if (['AppData', 'Local Settings', 'Cookies', 'SendTo', 'Templates', 'Recent', 'My Documents', 'Application Data', 'PrintHood', 'NetHood'].includes(file)) continue;
        searchDir(fullPath);
      } else {
        // Only check readable text files under 1MB
        if (stat.size < 1000000 && /\.(txt|json|yml|yaml|md|ini|bat|sh|js|ts|env|conf|config)$/i.test(file)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(target)) {
              console.log(`Found match in: ${fullPath}`);
              // Print surrounding lines
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                if (line.includes(target)) {
                  console.log(`  Line ${idx + 1}: ${line.trim().substring(0, 150)}`);
                }
              });
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}
}

searchDir(rootDir);
console.log('Search finished.');
