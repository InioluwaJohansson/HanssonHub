const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix room.id strict equality issue where one is string and other is number
code = code.replace(/r\.id === roomId/g, 'r.id.toString() === roomId.toString()');
code = code.replace(/r\.id === viewingRoom\.id/g, 'r.id.toString() === viewingRoom.id.toString()');
code = code.replace(/r\.id === userRoomId/g, 'r.id.toString() === userRoomId.toString()');

// Similarly for sections
code = code.replace(/s\.id === viewingSection\.id/g, 's.id.toString() === viewingSection.id.toString()');

// and for other facility mapping finds
code = code.replace(/device\.roomId === userRoomId/g, 'device.roomId?.toString() === userRoomId?.toString()');
code = code.replace(/d\.room === userRoomId/g, 'd.room?.toString() === userRoomId?.toString()');

fs.writeFileSync('src/App.tsx', code);
