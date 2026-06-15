const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will add a helper to sync individual device changes in signalR into `devices`
const helper = `  const hs = {
      on: (event, callback) => hsWrapper.on(event, (data) => { console.log('SignalR Event:', event, data); callback(data); }),
      off: (event) => hsWrapper.off(event)
    };

    const updateSyncDevice = (type: string, id: string | number, data: any, op: 'update' | 'add' | 'delete') => {
      setDevices(prev => {
        if (op === 'delete') {
          return prev.filter(d => d.id.toString() !== id.toString());
        }
        if (op === 'add') {
          let st = 'off';
          if (type === 'door' || type === 'window') st = (data.isOpen || data.IsOpen) ? 'open' : (data.isLocked || data.IsLocked ? 'locked' : 'unlocked');
          else st = (data.isActive || data.IsActive) ? 'on' : 'off';
          return [...prev, {
            id: id.toString(),
            name: data.applianceName || data.lightName || data.cameraName || data.doorName || data.windowName || data.name || 'Unknown',
            type,
            status: st,
            room: data.roomId?.toString() || '',
            section: data.sectionId?.toString() || '',
            value: type === 'light' ? (data.brightnessLevel || 0) : undefined
          } as Device];
        }
        // update
        return prev.map(d => {
          if (d.id.toString() !== id.toString()) return d;
          let st = d.status;
          if (data.hasOwnProperty('isActive') || data.hasOwnProperty('IsActive')) {
            st = (data.isActive ?? data.IsActive) ? 'on' : 'off';
          }
          if (data.hasOwnProperty('isOpen') || data.hasOwnProperty('IsOpen')) {
            st = (data.isOpen ?? data.IsOpen) ? 'open' : (data.isLocked ?? data.IsLocked ? 'locked' : 'unlocked');
          }
          return {
            ...d,
            name: data.applianceName || data.lightName || data.cameraName || data.doorName || data.windowName || data.name || d.name,
            status: st,
            room: data.roomId?.toString() || d.room,
            section: data.sectionId?.toString() || d.section,
            value: type === 'light' ? (data.brightnessLevel ?? data.BrightnessLevel ?? d.value) : d.value
          };
        });
      });
    };`;

code = code.replace(/const hs = \{[\s\S]*?off: \(event\) => hsWrapper\.off\(event\)\n\s*\};/, helper);

// Update Triggered Events
const trigTbl = {
  Appliance: 'appliance',
  Camera: 'camera',
  Light: 'light',
  Door: 'door',
  Window: 'window'
};

for (const [k, v] of Object.entries(trigTbl)) {
  code = code.replace(new RegExp(`hs\\.on\\("${k}Triggered", \\(data\\) => \\{\\n\\s*set${k}s\\(prev => prev\\.map\\(.*?\\)\\);\\n\\s*\\}\\);`, 'm'), 
    `hs.on("${k}Triggered", (data) => {\n        set${k}s(prev => prev.map(x => x.id === (data.id ?? data.Id) ? { ...x, ...data } : x));\n        updateSyncDevice('${v}', (data.id ?? data.Id), data, 'update');\n    });`);

  code = code.replace(new RegExp(`hs\\.on\\("${k}Created", \\(data\\) => set${k}s\\(prev => \\[\.\.\.prev, data\\]\\)\\);`),
    `hs.on("${k}Created", (data) => { set${k}s(prev => [...prev, data]); updateSyncDevice('${v}', (data.id ?? data.Id), data, 'add'); });`);

  code = code.replace(new RegExp(`hs\\.on\\("${k}Updated", \\(data\\) => set${k}s\\(prev => prev\\.map\\([a-z] => [a-z]\\.id === \\(data\\.id \\?\\? data\\.Id\\) \\? data : [a-z]\\)\\)\\);`),
    `hs.on("${k}Updated", (data) => { set${k}s(prev => prev.map(x => x.id === (data.id ?? data.Id) ? data : x)); updateSyncDevice('${v}', (data.id ?? data.Id), data, 'update'); });`);

  code = code.replace(new RegExp(`hs\\.on\\("${k}Deleted", \\(data\\) => set${k}s\\(prev => prev\\.filter\\([a-z] => [a-z]\\.id !== \\(data\\.id \\?\\? data\\.Id\\)\\)\\)\\);`),
    `hs.on("${k}Deleted", (data) => { set${k}s(prev => prev.filter(x => x.id !== (data.id ?? data.Id))); updateSyncDevice('${v}', (data.id ?? data.Id), data, 'delete'); });`);
}

fs.writeFileSync('src/App.tsx', code);
