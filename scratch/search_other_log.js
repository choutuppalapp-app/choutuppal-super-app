const fs = require('fs');
const path = require('path');

const logPath = path.join('C:', 'Users', 'Citizen2', '.gemini', 'antigravity', 'brain', '4a2d1948-bf93-43a7-a549-7bed14de5b38', '.system_generated', 'logs', 'transcript.jsonl');

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('password') || line.toLowerCase().includes('create_project') || line.toLowerCase().includes('db_pass') || line.toLowerCase().includes('postgresql://')) {
      try {
        const parsed = JSON.parse(line);
        console.log(`Line ${idx} (Step ${parsed.step_index}, Type: ${parsed.type}):`);
        console.log(JSON.stringify(parsed.tool_calls || parsed.content, null, 2).substring(0, 1000));
        console.log('--------------------------------------------------');
      } catch (e) {
        console.log(`Line ${idx} (raw):`);
        console.log(line.substring(0, 500));
        console.log('--------------------------------------------------');
      }
    }
  });
} else {
  console.log('Log file not found');
}
