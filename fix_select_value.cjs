const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace `value={newRoom.section}` to `value={newRoom.section || 'none'}`
code = code.replace(/<Select\s+value=\{newRoom\.section\}\s+onValueChange/g, "<Select value={newRoom.section || 'none'} onValueChange");
code = code.replace(/<Select\s+value=\{editingRoom\.section\}\s+onValueChange/g, "<Select value={editingRoom.section || 'none'} onValueChange");

// For device
code = code.replace(/<Select\s+value=\{newDevice\.section\}\s+onValueChange/g, "<Select value={newDevice.section || 'none'} onValueChange");
code = code.replace(/<Select\s+value=\{editingDevice\.section\}\s+onValueChange/g, "<Select value={editingDevice.section || 'none'} onValueChange");

// For Chat Group Section
code = code.replace(/<Select\s+value=\{newGroupSection\}\s+onValueChange/g, "<Select value={newGroupSection || 'none'} onValueChange");

// Same for room
code = code.replace(/<Select\s+value=\{newDevice\.room\}\s+onValueChange/g, "<Select value={newDevice.room || 'none'} onValueChange");
code = code.replace(/<Select\s+value=\{editingDevice\.room\}\s+onValueChange/g, "<Select value={editingDevice.room || 'none'} onValueChange");
code = code.replace(/<Select\s+value=\{newGroupRoom\}\s+onValueChange/g, "<Select value={newGroupRoom || 'none'} onValueChange");

fs.writeFileSync('src/App.tsx', code);
