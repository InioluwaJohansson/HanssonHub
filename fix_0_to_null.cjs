const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/roomId\s*:\s*([^?]+)\s*\?\s*(parseInt\([^)]+\))\s*:\s*0/g, "roomId: $1 && $1 !== 'none' ? $2 : null");
code = code.replace(/sectionId\s*:\s*([^?]+)\s*\?\s*(parseInt\([^)]+\))\s*:\s*0/g, "sectionId: $1 && $1 !== 'none' ? $2 : null");
code = code.replace(/personId\s*:\s*([^?]+)\s*\?\s*(parseInt\([^)]+\))\s*:\s*0/g, "personId: $1 && $1 !== 'none' ? $2 : null");

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced 0 with null");
