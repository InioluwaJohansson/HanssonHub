const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Select\s+value=\{[^}]+(roomId|sectionId|personId)[^}]+\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const context = content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 100));
  console.log('Found:', match[0]);
  console.log('Context:', context);
  console.log('---');
}
