const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/roomId:\s*externalForm\.roomId[^:]+:\s*0,/g, "roomId: (externalForm.roomId && externalForm.roomId !== 'none') ? parseInt(externalForm.roomId.toString()) : null,");
code = code.replace(/sectionId:\s*externalForm\.sectionId[^:]+:\s*0,/g, "sectionId: (externalForm.sectionId && externalForm.sectionId !== 'none') ? parseInt(externalForm.sectionId.toString()) : null,");
code = code.replace(/personId:\s*externalForm\.personId[^:]+:\s*0,/g, "personId: (externalForm.personId && externalForm.personId !== 'none') ? parseInt(externalForm.personId.toString()) : null,");

fs.writeFileSync('src/App.tsx', code);
