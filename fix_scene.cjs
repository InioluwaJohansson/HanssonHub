const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/scene\.\(actions \|\| \[\]\)\.find/g, '(scene.actions || []).find');

fs.writeFileSync('src/App.tsx', code);
