const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace room? parseInt(room) : 0 with undefined.
const replacements = [
  { p: /roomId:\s*newDevice\.room(?:Id)?\s*\?\s*parseInt\(newDevice\.room(?:Id)?\)\s*:\s*0/g, r: "roomId: (newDevice.room && newDevice.room !== 'none') ? parseInt(newDevice.room) : null" },
  { p: /sectionId:\s*newDevice\.section(?:Id)?\s*\?\s*parseInt\(newDevice\.section(?:Id)?\)\s*:\s*0/g, r: "sectionId: (newDevice.section && newDevice.section !== 'none') ? parseInt(newDevice.section) : null" },
  { p: /personId:\s*newDevice\.personId\s*\?\s*parseInt\(newDevice\.personId\)\s*:\s*0/g, r: "personId: (newDevice.personId && newDevice.personId !== 'none') ? parseInt(newDevice.personId) : null" },
  
  { p: /roomId:\s*editingDevice\.room(?:Id)?\s*\?\s*parseInt\(editingDevice\.room(?:Id)?\)\s*:\s*0/g, r: "roomId: (editingDevice.room && editingDevice.room !== 'none') ? parseInt(editingDevice.room) : null" },
  { p: /sectionId:\s*editingDevice\.section(?:Id)?\s*\?\s*parseInt\(editingDevice\.section(?:Id)?\)\s*:\s*0/g, r: "sectionId: (editingDevice.section && editingDevice.section !== 'none') ? parseInt(editingDevice.section) : null" },
  { p: /personId:\s*editingDevice\.personId\s*\?\s*parseInt\(editingDevice\.personId\)\s*:\s*0/g, r: "personId: (editingDevice.personId && editingDevice.personId !== 'none') ? parseInt(editingDevice.personId) : null" }
];

replacements.forEach(rep => {
  code = code.replace(rep.p, rep.r);
});

// also for update device the existing properties might be mapped. 
// let's just inspect where else roomId is assigned to 0!
fs.writeFileSync('src/App.tsx.modified', code);
