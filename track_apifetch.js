const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
let currentEffect = -1;
lines.forEach((line, i) => {
  if (line.includes('React.useEffect(')) {
    currentEffect = i + 1;
  }
  if (line.includes('apiFetch(')) {
    console.log(`apiFetch at ${i + 1}, closest effect at ${currentEffect}`);
  }
});
