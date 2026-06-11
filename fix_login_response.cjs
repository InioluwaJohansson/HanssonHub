const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace(
  /if \(result\.status\) \{/g,
  `if (result.success || result.status || result.token) {`
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
