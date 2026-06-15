const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// --- 1. Put mapSection helper before App component ---
const appDeclStr = 'export default function App() {';
const mapSectionHelper = `const mapSection = (s: any): Section => {
  if (!s) return s;
  const idStr = (s.sectionId ?? s.id ?? '').toString();
  return {
    ...s,
    id: idStr,
    name: s.sectionName || s.name || '',
    type: s.sectionType || s.type || 'general',
    isHidden: !!(s.isHidden || s.IsHidden),
    sectionId: s.sectionId ?? s.id,
    sectionName: s.sectionName || s.name,
  } as Section;
};

`;

if (!code.includes('const mapSection =')) {
  code = code.replace(appDeclStr, mapSectionHelper + appDeclStr);
  console.log('Added mapSection helper before App component');
}

// --- 2. Normalize and Map /Section/GetAllSections calls ---

// First: Initial load of sections
const p1_target = `      apiFetch('/Section/GetAllSections', { method: 'POST' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) { setSections(res.data); } else { setSections([]); } })
        .catch(() => setSections([]));`;

const p1_replacement = `      apiFetch('/Section/GetAllSections', { method: 'POST' })
        .then((res: any) => { if (res && res.data && Array.isArray(res.data)) { setSections(res.data.map(mapSection)); } else { setSections([]); } })
        .catch(() => setSections([]));`;

code = code.replace(p1_target, p1_replacement);

// Second: View sections page load
const p2_target = `        apiFetch('/Section/GetAllSections', { method: 'POST' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setSections(res.data); else setSections([]); })`;

const p2_replacement = `        apiFetch('/Section/GetAllSections', { method: 'POST' })
          .then((res: any) => { if (res && res.data && Array.isArray(res.data)) setSections(res.data.map(mapSection)); else setSections([]); })`;

code = code.replace(p2_target, p2_replacement);

// Third: handleRefresh sections fetch
const p3_target = `        const p2 = apiFetch('/Section/GetAllSections', { method: 'POST' }).then((res: any) => { if (res && res.data) setSections(res.data); });`;
const p3_replacement = `        const p2 = apiFetch('/Section/GetAllSections', { method: 'POST' }).then((res: any) => { if (res && res.data) setSections(res.data.map(mapSection)); });`;

code = code.replace(p3_target, p3_replacement);


// --- 3. Normalizing HandleAddSection ---
const addSection_target = `        if (response && response.data) {
          setSections((prev: any) => [...prev, response.data]);
        } else {`;

const addSection_replacement = `        if (response && response.data) {
          setSections((prev: any) => [...prev, mapSection(response.data)]);
        } else {`;

code = code.replace(addSection_target, addSection_replacement);


// --- 4. Normalizing HandleSaveSection ---
const saveSection_target = `                    setSections((prev: any) => prev.map((s: any) => s.id === editingSection.id ? { ...s, name: editingSection.name!, type: editingSection.type, isHidden: editingSection.isHidden } : s));`;
const saveSection_replacement = `                    setSections((prev: any) => prev.map((s: any) => s.id.toString() === editingSection.id.toString() ? mapSection({ ...s, name: editingSection.name!, type: editingSection.type, isHidden: editingSection.isHidden }) : s));`;

code = code.replace(saveSection_target, saveSection_replacement);


// --- 5. Normalizing SignalR Sections listeners ---
const srSections_target = `    hs.on("SectionCreated", (data) => setSections(prev => [...prev, data]));
    hs.on("SectionUpdated", (data) => setSections(prev => prev.map(s => s.id === (data.id ?? data.Id) ? data : s)));
    hs.on("SectionDeleted", (id) => setSections(prev => prev.filter(s => s.id !== (id.id || id))));`;

const srSections_replacement = `    hs.on("SectionCreated", (data) => setSections(prev => [...prev, mapSection(data)]));
    hs.on("SectionUpdated", (data) => setSections(prev => prev.map(s => s.id.toString() === (data.sectionId ?? data.id ?? data.Id ?? '').toString() ? mapSection(data) : s)));
    hs.on("SectionDeleted", (id) => {
      const deletedId = typeof id === 'object' ? (id.sectionId ?? id.id ?? id.Id) : id;
      setSections(prev => prev.filter(s => s.id.toString() !== (deletedId ?? '').toString()));
    });`;

code = code.replace(srSections_target, srSections_replacement);


// --- 6. Normalize setRooms to robustly resolve Section Name via section ID ---

// Replace places doing: section: r.sectionName || r.section || ''
// Let's do string replaces for rooms mapping
code = code.split('section: r.sectionName || r.section || \'\'').join("section: r.sectionId?.toString() || r.sectionName || r.section || ''");
code = code.split('section: data.sectionName || data.section || \'\'').join("section: data.sectionId?.toString() || data.sectionName || data.section || ''");
code = code.split('section: room.sectionName || room.section || \'\'').join("section: room.sectionId?.toString() || room.sectionName || room.section || ''");


// --- 7. Remove requestAuth from handleToggle ---
const handleToggle_target = `    const handleToggle = (id: string) => {
    requestAuth(async () => {
      let d = devices.find(x => x.id === id);
      if (!d) return;

      try {
        if (d.type === 'door') {
          if (d.status === 'locked') {
            await apiFetch(\`/Door/UnlockDoor?id=\${d.id}\`, { method: 'PUT' });
          } else {
            await apiFetch(\`/Door/LockDoor?id=\${d.id}\`, { method: 'PUT' });
          }
        } else if (d.type === 'light') {
          const nextActive = d.status === 'off';
          const lightDto = (lights || []).find(l => l.id.toString() === d.id.toString());
          await apiFetch('/Light/UpdateLight', { 
            method: 'PUT', 
            body: { 
              id: parseInt(d.id), 
              isActive: nextActive, 
              lightName: lightDto?.lightName || d.name,
              brightnessLevel: d.value ?? lightDto?.brightnessLevel ?? 100,
              roomId: lightDto?.roomId,
              sectionId: lightDto?.sectionId
            } 
          });
        } else if (d.type === 'appliance') {
          const nextActive = (d.status === 'off' || d.status === 'inactive');
          const appDto = (appliances || []).find(a => a.id.toString() === d.id.toString());
          await apiFetch('/Appliance/UpdateAppliance', { 
            method: 'PUT', 
            body: { 
              id: parseInt(d.id), 
              isActive: nextActive, 
              applianceName: appDto?.applianceName || d.name,
              applianceType: appDto?.applianceType ? (appNamesDetailList.applianceType.find(t => t.name === (appDto as any).applianceType)?.id || 1) : 1,
              roomId: appDto?.roomId,
              sectionId: appDto?.sectionId
            } 
          });
        } else if (d.type === 'camera') {
          const nextActive = d.status === 'inactive';
          const camDto = (cameras || []).find(c => c.id.toString() === d.id.toString());
          await apiFetch('/Camera/UpdateCamera', { 
            method: 'PUT', 
            body: { 
              id: parseInt(d.id), 
              isActive: nextActive, 
              cameraName: camDto?.cameraName || d.name,
              ipAddress: (camDto as any)?.ipAddress || "127.0.0.1",
              username: (camDto as any)?.username || "admin",
              streamPath: (camDto as any)?.streamPath || "/",
              port: (camDto as any)?.port || 80
            } 
          });
        }
        
        toast.success(\`Device toggled successfully\`);
      } catch (err: any) {
        console.error("Failed to toggle device remotely", err);
        toast.error(\`Remote toggle failed: \${err.message}\`);
        return; // Don't update local state if remote fails
      }

      setDevices(prev => prev.map(d => {
        if (d.id !== id) return d;
        
        let newStatus = d.status;
        if (d.type === 'light') {
          newStatus = d.status === 'on' ? 'off' : 'on';
        } else if (d.type === 'appliance') {
          newStatus = (d.status === 'on' || d.status === 'active') ? 'off' : 'on';
        } else if (d.type === 'door' || d.type === 'window') {
          newStatus = d.status === 'locked' ? 'unlocked' : 'locked';
        } else if (d.type === 'camera') {
          newStatus = d.status === 'active' ? 'inactive' : 'active';
        }
        
        return { ...d, status: newStatus as any };
      }));
    });
  };`;

const handleToggle_replacement = `    const handleToggle = async (id: string) => {
      let d = devices.find(x => x.id === id);
      if (!d) return;

      try {
        if (d.type === 'door') {
          if (d.status === 'locked') {
            await apiFetch(\`/Door/UnlockDoor?id=\${d.id}\`, { method: 'PUT' });
          } else {
            await apiFetch(\`/Door/LockDoor?id=\${d.id}\`, { method: 'PUT' });
          }
        } else if (d.type === 'light') {
          const nextActive = d.status === 'off';
          const lightDto = (lights || []).find(l => l.id.toString() === d.id.toString());
          await apiFetch('/Light/UpdateLight', { 
            method: 'PUT', 
            body: { 
              id: parseInt(d.id), 
              isActive: nextActive, 
              lightName: lightDto?.lightName || d.name,
              brightnessLevel: d.value ?? lightDto?.brightnessLevel ?? 100,
              roomId: lightDto?.roomId,
              sectionId: lightDto?.sectionId
            } 
          });
        } else if (d.type === 'appliance') {
          const nextActive = (d.status === 'off' || d.status === 'inactive');
          const appDto = (appliances || []).find(a => a.id.toString() === d.id.toString());
          await apiFetch('/Appliance/UpdateAppliance', { 
            method: 'PUT', 
            body: { 
              id: parseInt(d.id), 
              isActive: nextActive, 
              applianceName: appDto?.applianceName || d.name,
              applianceType: appDto?.applianceType ? (appNamesDetailList.applianceType.find(t => t.name === (appDto as any).applianceType)?.id || 1) : 1,
              roomId: appDto?.roomId,
              sectionId: appDto?.sectionId
            } 
          });
        } else if (d.type === 'camera') {
          const nextActive = d.status === 'inactive';
          const camDto = (cameras || []).find(c => c.id.toString() === d.id.toString());
          await apiFetch('/Camera/UpdateCamera', { 
            method: 'PUT', 
            body: { 
              id: parseInt(d.id), 
              isActive: nextActive, 
              cameraName: camDto?.cameraName || d.name,
              ipAddress: (camDto as any)?.ipAddress || "127.0.0.1",
              username: (camDto as any)?.username || "admin",
              streamPath: (camDto as any)?.streamPath || "/",
              port: (camDto as any)?.port || 80
            } 
          });
        }
        
        toast.success(\`Device toggled successfully\`);
      } catch (err: any) {
        console.error("Failed to toggle device remotely", err);
        toast.error(\`Remote toggle failed: \${err.message}\`);
        return; // Don't update local state if remote fails
      }

      setDevices(prev => prev.map(d => {
        if (d.id !== id) return d;
        
        let newStatus = d.status;
        if (d.type === 'light') {
          newStatus = d.status === 'on' ? 'off' : 'on';
        } else if (d.type === 'appliance') {
          newStatus = (d.status === 'on' || d.status === 'active') ? 'off' : 'on';
        } else if (d.type === 'door' || d.type === 'window') {
          newStatus = d.status === 'locked' ? 'unlocked' : 'locked';
        } else if (d.type === 'camera') {
          newStatus = d.status === 'active' ? 'inactive' : 'active';
        }
        
        return { ...d, status: newStatus as any };
      }));
    };`;

code = code.replace(handleToggle_target, handleToggle_replacement);


// --- 8. Remove requestAuth from External toggle Switch ---
const externalToggle_target = `                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Switch 
                          checked={ext.isActive} 
                          onCheckedChange={(checked) => {
                            requestAuth(async () => {
                              try {
                                const dto = {
                                  id: ext.id,
                                  externalName: ext.externalName,
                                  isActive: checked,
                                  isTriggered: ext.isTriggered,
                                  actionIds: ext.actionIds || [],
                                  roomId: ext.roomId,
                                  sectionId: ext.sectionId
                                };
                                await apiFetch('/External/UpdateExternal', { method: 'PUT', body: JSON.stringify(dto) });
                                setExternals(prev => prev.map(e => e.id === ext.id ? { ...e, isActive: checked } : e));
                                addLogEntry('Hardware Security', \`\${ext.externalName} functional state set to \${checked ? 'enabled' : 'disabled'}\`);
                                toast.success(\`External device updated successfully\`);
                              } catch(err: any) {
                                toast.error(\`Failed to update external: \${err.message}\`);
                              }
                            });
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>`;

const externalToggle_replacement = `                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Switch 
                          checked={ext.isActive} 
                          onCheckedChange={async (checked) => {
                            try {
                              const dto = {
                                  id: ext.id,
                                  externalName: ext.externalName,
                                  isActive: checked,
                                  isTriggered: ext.isTriggered,
                                  actionIds: ext.actionIds || [],
                                  roomId: ext.roomId,
                                  sectionId: ext.sectionId
                              };
                              await apiFetch('/External/UpdateExternal', { method: 'PUT', body: JSON.stringify(dto) });
                              setExternals(prev => prev.map(e => e.id === ext.id ? { ...e, isActive: checked } : e));
                              addLogEntry('Hardware Security', \`\${ext.externalName} functional state set to \${checked ? 'enabled' : 'disabled'}\`);
                              toast.success(\`External device updated successfully\`);
                            } catch(err: any) {
                              toast.error(\`Failed to update external: \${err.message}\`);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>`;

code = code.replace(externalToggle_target, externalToggle_replacement);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('App.tsx modifications written successfully');
