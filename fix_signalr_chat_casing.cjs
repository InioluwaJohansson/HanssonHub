const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/msg\.id/g, '(msg.id ?? msg.Id)');
code = code.replace(/msg\.senderId/g, '(msg.senderId ?? msg.SenderId)');
code = code.replace(/\(\(msg\.id \?\? msg\.Id\) \?\? msg\.Id\)/g, '(msg.id ?? msg.Id)');

fs.writeFileSync('src/App.tsx', code);
