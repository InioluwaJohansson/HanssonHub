const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Select[\s\S]*?<\/Select>/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const block = match[0];
  if (block.includes('roomId') || block.includes('sectionId') || block.includes('personId')) {
    const loc = content.substring(0, match.index).split('\n').length;
    console.log(`Line ${loc}:`);
    console.log(block.substring(0, 200).replace(/\n/g, ' '));
    console.log('---');
  }
}
