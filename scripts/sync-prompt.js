const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const promptPath = path.join(rootDir, 'prompt.txt');
const outputPath = path.join(rootDir, 'src', 'services', 'promptText.ts');

const content = fs.readFileSync(promptPath, 'utf8');

const code = `// Auto-generated from prompt.txt — DO NOT EDIT DIRECTLY.
// Edit prompt.txt at project root and run 'node scripts/sync-prompt.js'.

export const ARIN_SYSTEM_PROMPT = ${JSON.stringify(content)};
`;

fs.writeFileSync(outputPath, code, 'utf8');
console.log(`[sync-prompt] Synced prompt.txt -> src/services/promptText.ts (${content.length} chars)`);
