const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Select\s+value=\{[^}]+\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  if (match[0].includes('roomId') || match[0].includes('sectionId') || match[0].includes('personId')) {
    const loc = content.substring(0, match.index).split('\n').length;
    console.log(`Line ${loc}: ${match[0]}`);
  }
}
