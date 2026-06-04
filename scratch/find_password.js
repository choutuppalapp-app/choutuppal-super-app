const fs = require('fs');
const path = require('path');

const logPath = path.join('C:', 'Users', 'Citizen2', '.gemini', 'antigravity', 'brain', '836ca2d9-6a49-4896-a5e0-e8ee7e6dbb78', '.system_generated', 'logs', 'transcript.jsonl');

if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf-8');
  const lines = content.split('\n');
  for (let i = 265; i < 282; i++) {
    if (lines[i]) {
      const parsed = JSON.parse(lines[i]);
      console.log(`Step ${parsed.step_index} (${parsed.type}):`);
      if (parsed.tool_calls) {
        console.log('Tool Calls:', JSON.stringify(parsed.tool_calls, null, 2));
      }
      if (parsed.content) {
        console.log('Content:', parsed.content.substring(0, 300));
      }
      console.log('-------------------');
    }
  }
} else {
  console.log('Log file not found');
}
