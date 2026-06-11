const fs = require('fs');
let clientCode = fs.readFileSync('src/api/client.ts', 'utf8');

clientCode = clientCode.replace(
  /if \(!window\.location\.pathname\.includes\('login'\)\) \{\n         window\.location\.reload\(\);\n      \}/,
  `window.dispatchEvent(new CustomEvent('auth-expired'));`
);
fs.writeFileSync('src/api/client.ts', clientCode);
