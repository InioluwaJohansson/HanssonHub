const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// remove lines 1480 to 1494
const lines = code.split('\n');
const newLines = [...lines.slice(0, 1479), ...lines.slice(1495)];
fs.writeFileSync('src/App.tsx', newLines.join('\n'));
