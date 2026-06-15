const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add refresh state
code = code.replace(/const \[activeView, setActiveView\] = React\.useState<NavView>\('dashboard'\);/, 
  "const [activeView, setActiveView] = React.useState<NavView>('dashboard');\n  const [refreshState, setRefreshState] = React.useState<'idle'|'loading'|'success'|'error'>('idle');\n  const [refreshProgress, setRefreshProgress] = React.useState(0);");

// Update handleRefresh
const handleRefreshMatch = code.match(/const handleRefresh = async \(\) => \{[\s\S]*?toast\.success\("All data refreshed"\);\s*\} catch\(err\) \{\s*console\.error\(err\);\s*\}\s*\};/);
if (handleRefreshMatch) {
  const newRefresh = `const handleRefresh = async () => {
    try {
        setRefreshState('loading');
        setRefreshProgress(70);
        const p1 = apiFetch('/Room/GetAllRooms', { method: 'POST' }).then((res: any) => { if (res && res.data) setRooms(res.data.map((r: any) => ({ ...r, name: r.roomName || r.name, section: r.sectionName || r.section || '', icon: r.icon || 'Sofa' }))); });
        const p2 = apiFetch('/Section/GetAllSections', { method: 'POST' }).then((res: any) => { if (res && res.data) setSections(res.data); });
        const p3 = apiFetch('/Appliance/GetAllAppliances', { method: 'POST' }).then((res: any) => { if (res && res.data) { setAppliances(res.data); syncDevicesFromFetchedType('appliance', res.data); } });
        const p4 = apiFetch('/Light/GetAllLights', { method: 'POST' }).then((res: any) => { if (res && res.data) { setLights(res.data); syncDevicesFromFetchedType('light', res.data); } });
        const p5 = apiFetch('/Camera/GetAllCameras', { method: 'POST' }).then((res: any) => { if (res && res.data) { setCameras(res.data); syncDevicesFromFetchedType('camera', res.data); } });
        const p6 = apiFetch('/Door/GetAllDoors', { method: 'POST' }).then((res: any) => { if (res && res.data) { setDoors(res.data); syncDevicesFromFetchedType('door', res.data); } });
        const p7 = apiFetch('/Window/GetAllWindows', { method: 'POST' }).then((res: any) => { if (res && res.data) { setWindows(res.data); syncDevicesFromFetchedType('window', res.data); } });
        const p8 = apiFetch('/External/GetAllExternals', { method: 'POST' }).then((res: any) => { if (res && res.data) setExternals(res.data); });
        const p9 = apiFetch('/Hardware/GetAllHardwares', { method: 'GET' }).then((res: any) => { if (res && res.data) setHardwares(res.data); });
        const p10 = apiFetch('/Person/GetAllPersons', { method: 'POST' }).then((res: any) => { if (res && res.data) setAllUsers(res.data); });
        const p11 = apiFetch('/ContactCategory/GetAllContactCategories', { method: 'POST' }).then((res: any) => { if (res && res.data) setContactCategories(res.data); });
        const p12 = apiFetch('/Contact/GetAllContacts', { method: 'POST', body: '' }).then((res: any) => { if (res && res.data) setContacts(res.data); });
        await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]);
        setRefreshProgress(100);
        setRefreshState('success');
        setTimeout(() => setRefreshState('idle'), 1000);
    } catch(err) {
      console.error(err);
      setRefreshProgress(100);
      setRefreshState('error');
      setTimeout(() => setRefreshState('idle'), 1500);
    }
  };`;
  code = code.replace(handleRefreshMatch[0], newRefresh);
}

// Add the progress bar JSX inside main top
const mainRegex = /<main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">/;
const newMain = `<main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        <div 
          className={cn(
            "absolute top-0 left-0 h-[2px] z-50 transition-all duration-300 ease-out",
            refreshState === 'idle' ? "opacity-0 w-0" : "opacity-100",
            refreshState === 'loading' ? "bg-black w-[70%]" : 
            (refreshState === 'success' ? "bg-green-500 w-full" : 
            (refreshState === 'error' ? "bg-yellow-500 w-full" : ""))
          )}
        />`;
code = code.replace(mainRegex, newMain);

// Also we should update to use ScrollArea's native touch behavior or move PullToRefresh outside of ScrollArea.
// It's better to replace `<ScrollArea className="flex-1 min-h-0">` with standard overflow auto if we use pulltorefresh, but let's test if we can just move it.
// PullToRefresh supports a specific layout.
code = code.replace(/<ScrollArea className="flex-1 min-h-0">\s*<div className="p-8 pb-12">/g, '<div className="flex-1 min-h-0 overflow-y-auto"><div className="p-8 pb-12 min-h-full">');
code = code.replace(/<\/PullToRefresh>\s*<\/div>\s*<\/ScrollArea>/g, '</PullToRefresh></div></div>');

fs.writeFileSync('src/App.tsx', code);
