const fs = require('fs');
const path = require('path');

const logPath = path.join('C:', 'Users', 'Citizen2', '.gemini', 'antigravity', 'brain', '836ca2d9-6a49-4896-a5e0-e8ee7e6dbb78', '.system_generated', 'logs', 'transcript.jsonl');

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('password') || line.toLowerCase().includes('postgresql://')) {
      try {
        const parsed = JSON.parse(line);
        console.log(`Line ${idx} (Step ${parsed.step_index}, Type: ${parsed.type}):`);
        console.log(line.substring(0, 1000));
        console.log('--------------------------------------------------');
      } catch (e) {
        console.log(`Line ${idx} (raw search match):`);
        console.log(line.substring(0, 500));
        console.log('--------------------------------------------------');
      }
    }
  });
} else {
  console.log('Log file not found');
}
