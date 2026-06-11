const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(authCode\.length === 6\) \{\s*timer = setTimeout\(\(\) => \{\s*verifyAuth\(\);\s*\}, 1000\);\s*\} else \{\s*verifyAuth\(\);\s*\}/g;

const replacement = `if (authCode.length === 6) {
      verifyAuth();
    } else if (authCode.length === 4) {
      // do not auto-verify on 4 anymore since we have 6 inputs
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated auth verification trigger.");
