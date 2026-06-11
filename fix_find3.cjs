const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/chat\.participants\.find/g, '(chat?.participants || []).find');
code = code.replace(/allUsers\.find/g, '(allUsers || []).find');
code = code.replace(/chat\.participants\.some/g, '(chat?.participants || []).some');

fs.writeFileSync('src/App.tsx', code);
