const fs = require('fs');
let code = fs.readFileSync('src/lib/signalR.ts', 'utf8');

code = code.replace(/HomeSecurityHub/, 'homeSecurityHub');
code = code.replace(/HomeSecurityChatHub/, 'chatHub');

fs.writeFileSync('src/lib/signalR.ts', code);
