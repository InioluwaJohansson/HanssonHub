const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');
lines.forEach((line, i) => {
  if (line.includes('apiFetch(') || line.includes('apiFetch (')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
