const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/res\.\(data\.id \?\? data\.Id\)/g, '(res.data.id ?? res.data.Id)');

fs.writeFileSync('src/App.tsx', code);
