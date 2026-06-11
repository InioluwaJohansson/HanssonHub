const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(token && id && userName && roleName\) \{/,
  `if (token && token !== "undefined" && token !== "null" && id && userName && roleName) {`
);

fs.writeFileSync('src/App.tsx', code);
