const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix syncDevices object creations
code = code.replace(/name: item\.applianceName,/g, 'name: item.applianceName || item.name || "Unknown Appliance",');
code = code.replace(/name: item\.lightName,/g, 'name: item.lightName || item.name || "Unknown Light",');
code = code.replace(/name: item\.cameraName,/g, 'name: item.cameraName || item.name || "Unknown Camera",');
code = code.replace(/name: item\.doorName,/g, 'name: item.doorName || item.name || "Unknown Door",');
code = code.replace(/name: item\.windowName,/g, 'name: item.windowName || item.name || "Unknown Window",');

// Also room details: currentRoomDto mapping:
code = code.replace(/\{currentRoomDto\.createdByName \|\| 'System'\}/g, '{currentRoomDto.createdByName || currentRoomDto.createdBy || \'System\'}');
code = code.replace(/\{currentRoomDto\.peronName \|\| 'System'\}/g, '{currentRoomDto.personName || currentRoomDto.peronName || \'System\'}');

fs.writeFileSync('src/App.tsx', code);
