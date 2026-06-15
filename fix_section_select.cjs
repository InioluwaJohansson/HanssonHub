const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/value=\{section\.id\}/g, "value={section.id.toString()}");
code = code.replace(/value=\{room\.id\}/g, "value={room.id.toString()}");

// Also check the user says "ensure updates are applied correctly to all facility pages and to all pages(logs, all users etc) so as to keep the app updated in realtime."
// I added signalR listeners for facility pages, but not `PersonCreated`, `LogCreated`, etc?
// Is there a signalR event for Log/User?
// Let's add them to the wrapper just in case.

const hsWrapperMatch = code.match(/const hs = \{[\s\S]*?off: \(event\) => hsWrapper.off\(event\)\n\s*\};/);
if (hsWrapperMatch) {
  const listenersToAppend = `
    // Extra Realtime listeners
    hs.on("LogCreated", (data) => setLogs(prev => [data, ...prev]));
    hs.on("PersonCreated", (data) => setAllUsers(prev => [...prev, data]));
    hs.on("PersonUpdated", (data) => setAllUsers(prev => prev.map(p => p.id === (data.id ?? data.Id) ? data : p)));
    hs.on("RoomCreated", (data) => setRooms(prev => [...prev, { ...data, name: data.roomName || data.name, section: data.sectionName || data.section || '' }]));
    hs.on("RoomUpdated", (data) => setRooms(prev => prev.map(r => r.id === (data.id ?? data.Id) ? { ...data, name: data.roomName || data.name, section: data.sectionName || data.section || '' } : r)));
    hs.on("RoomDeleted", (data) => setRooms(prev => prev.filter(r => r.id !== (data.id ?? data.Id))));
    hs.on("SectionCreated", (data) => setSections(prev => [...prev, data]));
    hs.on("SectionUpdated", (data) => setSections(prev => prev.map(s => s.id === (data.id ?? data.Id) ? data : s)));
    hs.on("SectionDeleted", (data) => setSections(prev => prev.filter(s => s.id !== (data.id ?? data.Id))));
    hs.on("WindowCreated", (data) => setWindows(prev => [...prev, data]));
    hs.on("WindowUpdated", (data) => setWindows(prev => prev.map(w => w.id === (data.id ?? data.Id) ? data : w)));
    hs.on("WindowDeleted", (data) => setWindows(prev => prev.filter(w => w.id !== (data.id ?? data.Id))));
    hs.on("DoorCreated", (data) => setDoors(prev => [...prev, data]));
    hs.on("DoorUpdated", (data) => setDoors(prev => prev.map(d => d.id === (data.id ?? data.Id) ? data : d)));
    hs.on("DoorDeleted", (data) => setDoors(prev => prev.filter(d => d.id !== (data.id ?? data.Id))));
    hs.on("LightCreated", (data) => setLights(prev => [...prev, data]));
    hs.on("LightUpdated", (data) => setLights(prev => prev.map(l => l.id === (data.id ?? data.Id) ? data : l)));
    hs.on("LightDeleted", (data) => setLights(prev => prev.filter(l => l.id !== (data.id ?? data.Id))));
    hs.on("ApplianceCreated", (data) => setAppliances(prev => [...prev, data]));
    hs.on("ApplianceUpdated", (data) => setAppliances(prev => prev.map(a => a.id === (data.id ?? data.Id) ? data : a)));
    hs.on("ApplianceDeleted", (data) => setAppliances(prev => prev.filter(a => a.id !== (data.id ?? data.Id))));
    hs.on("SystemLogAdded", (data) => setLogs(prev => [data, ...prev])); // common variation
`;
  // Replace just before `// Action Events` or whatever is next
  code = code.split('// Action Events').join(listenersToAppend + '\n    // Action Events');
}

fs.writeFileSync('src/App.tsx', code);
