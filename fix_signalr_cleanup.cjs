const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the initSignalR useEffect block
const startTag = 'initSignalR((hs) => {';
const endTag = '});\n  }, [devices, activeView]);'; // This might differ slightly depending on the previous edits

// Let's find the whole initSignalR call
const initRegex = /React\.useEffect\(\(\) => \{(\s*)const hs = initSignalR\(\(hs\) => \{([\s\S]*?)\}\);/g;
const match = code.match(initRegex);

if (match) {
  const consolidatedListeners = `
    const updateSyncDevice = (type: string, id: any, data: any, op: 'add' | 'update' | 'delete') => {
      setDevices(prev => {
        if (op === 'delete') return prev.filter(d => d.type === type && d.id !== id.toString());
        
        // Mappers
        const mapDevice = (item: any): any => {
          const common = {
            id: item.id.toString(),
            name: item.name || item.cameraName || item.lightName || item.applianceName || item.windowName || item.doorName || "Unknown",
            room: item.roomId?.toString() || '',
            section: item.sectionId?.toString() || '',
          };
          
          if (type === 'light') return { ...common, type: 'light', status: item.isActive ? 'on' : 'off', value: item.brightnessLevel || 0 };
          if (type === 'camera') return { ...common, type: 'camera', status: item.isActive ? 'active' : 'inactive' };
          if (type === 'appliance') return { ...common, type: 'appliance', status: item.isActive ? 'on' : 'inactive' };
          if (type === 'door') {
             let st = 'unlocked';
             if (item.isOpen && item.isLocked) st = 'open-locked';
             else if (item.isOpen) st = 'open';
             else if (item.isLocked) st = 'locked';
             return { ...common, type: 'door', status: st, doorType: item.doorType };
          }
          if (type === 'window') {
             let st = 'locked';
             if (item.isOpen) st = 'open';
             else if (!item.isLocked) st = 'unlocked';
             return { ...common, type: 'window', status: st };
          }
          return { ...common, type };
        };

        if (op === 'add') {
          if (prev.some(d => d.id === id.toString() && d.type === type)) return prev;
          return [...prev, mapDevice(data)];
        }
        
        if (op === 'update') {
          return prev.map(d => (d.id === id.toString() && d.type === type) ? mapDevice(data) : d);
        }
        
        return prev;
      });
    };

    // --- Device Listeners ---
    ['Light', 'Appliance', 'Camera', 'Door', 'Window'].forEach(t => {
      const type = t.toLowerCase();
      hs.on(\`\${t}Created\`, (data) => {
        const setter = ({ 'Light': setLights, 'Appliance': setAppliances, 'Camera': setCameras, 'Door': setDoors, 'Window': setWindows }[t]);
        setter(prev => [...prev, data]);
        updateSyncDevice(type, (data.id ?? data.Id), data, 'add');
      });
      hs.on(\`\${t}Updated\`, (data) => {
        const setter = ({ 'Light': setLights, 'Appliance': setAppliances, 'Camera': setCameras, 'Door': setDoors, 'Window': setWindows }[t]);
        setter(prev => prev.map(x => x.id === (data.id ?? data.Id) ? data : x));
        updateSyncDevice(type, (data.id ?? data.Id), data, 'update');
      });
      hs.on(\`\${t}Deleted\`, (data) => {
        const setter = ({ 'Light': setLights, 'Appliance': setAppliances, 'Camera': setCameras, 'Door': setDoors, 'Window': setWindows }[t]);
        const id = typeof data === 'object' ? (data.id ?? data.Id) : data;
        setter(prev => prev.filter(x => x.id !== id));
        updateSyncDevice(type, id, {}, 'delete');
      });
      hs.on(\`\${t}Triggered\`, (data) => {
         toast.info(\`\${t} event triggered: \${data.message || ''}\`);
         const id = (data.id ?? data.Id);
         if(id) updateSyncDevice(type, id, data, 'update');
      });
    });

    // --- System Listeners ---
    hs.on("LogCreated", (data) => setLogs(prev => [data, ...prev]));
    hs.on("SystemLogAdded", (data) => setLogs(prev => [data, ...prev]));
    
    hs.on("PersonCreated", (data) => setAllUsers(prev => [...prev, data]));
    hs.on("PersonUpdated", (data) => setAllUsers(prev => prev.map(p => p.id === (data.id ?? data.Id) ? data : p)));
    hs.on("PersonStatusChanged", (data) => setAllUsers(prev => prev.map(u => u.id === (data.id ?? data.Id) ? { ...u, disabled: data.disabled } : u)));
    
    hs.on("RoomCreated", (data) => setRooms(prev => [...prev, { ...data, name: data.roomName || data.name, section: data.sectionName || data.section || '' }]));
    hs.on("RoomUpdated", (data) => setRooms(prev => prev.map(r => r.id === (data.id ?? data.Id) ? { ...data, name: data.roomName || data.name, section: data.sectionName || data.section || '' } : r)));
    hs.on("RoomDeleted", (id) => setRooms(prev => prev.filter(r => r.id !== (id.id || id))));
    
    hs.on("SectionCreated", (data) => setSections(prev => [...prev, data]));
    hs.on("SectionUpdated", (data) => setSections(prev => prev.map(s => s.id === (data.id ?? data.Id) ? data : s)));
    hs.on("SectionDeleted", (id) => setSections(prev => prev.filter(s => s.id !== (id.id || id))));
    
    hs.on("ExternalCreated", (data) => setExternals(prev => [...prev, data]));
    hs.on("ExternalUpdated", (data) => setExternals(prev => prev.map(e => e.id === (data.id ?? data.Id) ? data : e)));
    hs.on("ExternalDeleted", (id) => setExternals(prev => prev.filter(e => e.id !== (id.id || id))));
    
    hs.on("HardwareCreated", (data) => setHardwares(prev => [...prev, data]));
    hs.on("HardwareUpdated", (data) => setHardwares(prev => prev.map(h => h.id === (data.id ?? data.Id) ? data : h)));
    
    hs.on("ActionCreated", (data) => setActions(prev => [...prev, data]));
    hs.on("ActionUpdated", (data) => setActions(prev => prev.map(a => a.id === (data.actionId ?? data.id) ? data : a)));
    hs.on("ActionDeleted", (id) => setActions(prev => prev.filter(a => a.id !== (id.id || id))));
    
    hs.on("GetAppNamesDetails", (data) => setAppNamesDetailList(data));
`;

  // We need to replace ALL blocks that look like this to one clean block
  code = code.replace(initRegex, `React.useEffect(() => {
    const hs = initSignalR((hs) => {
${consolidatedListeners}
    });`);
}

fs.writeFileSync('src/App.tsx', code);
