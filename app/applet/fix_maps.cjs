const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const identifiers = [
  'appliances', 'cameras', 'lights', 'windows', 'doors', 'externals', 'allUsers', 'contactCategories', 
  'actions', 'rooms', 'sections', 'filteredUserRooms', 'roomExternals', 'filteredActions', 'filteredHardwares', 
  'filteredExternals', 'filteredDevices', 'appNamesDetailList\\.applianceType', 'recordingsList', 
  'chats', 'chat\\.participants', 'currentMessages', 'fingerprintImages', 'chatPopups', 'devices',
  'displayedLogs', 'filteredContacts', 'newAddresses', 'newContacts', 'uploadPreviewFiles',
  'selectedHardware\\.applianceIdNames', 'selectedHardware\\.cameraIdNames', 'selectedHardware\\.doorIdNames',
  'selectedHardware\\.externalIdNames', 'selectedHardware\\.lightIdNames', 'selectedHardware\\.windowIdNames',
  'selectedExternal\\.actionIds', 'chatMessages'
];

identifiers.forEach(id => {
  const regex = new RegExp(`\\b${id}\\.map\\(`, 'g');
  code = code.replace(regex, `(${id.replace(/\\./g, '.')} || []).map(`);
});

// also fix specific unhandled empty string src attribute for avatar.
code = code.replace(
  /const avatar = details\?\.imageUrl \|\| 'https:\/\/picsum\.photos\/seed\/system\/100\/100';\s*return \(\s*<div\s+key=\{log\.id\}\s+className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-accent\/40 active:bg-accent\/60 transition-colors cursor-pointer"\s+onClick=\{\(\) => \{\s*setSelectedLog\(log\);\s*setIsViewLogOpen\(true\);\s*\}\}\s*>\s*<div className="flex items-center gap-4 min-w-0">\s*<div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-primary\/10">\s*<img src=\{avatar\} alt=\{userFullName\} className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" \/>/g,
  `const avatar = details?.imageUrl || 'https://picsum.photos/seed/system/100/100';

                return (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-accent/40 active:bg-accent/60 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedLog(log);
                      setIsViewLogOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-primary/10">
                        {avatar ? (
                          <img src={avatar} alt={userFullName} className="h-full w-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                        ) : null}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed map calls.");
