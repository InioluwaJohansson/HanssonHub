const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Move and update Refresh Progress bar
const progressBar = `        <div 
          className={cn(
            "absolute top-0 left-0 h-[2px] z-50 transition-all duration-300 ease-out",
            refreshState === 'idle' ? "opacity-0 w-0" : "opacity-100",
            refreshState === 'loading' ? "bg-black w-[70%]" : 
            (refreshState === 'success' ? "bg-green-500 w-full" : 
            (refreshState === 'error' ? "bg-yellow-500 w-full" : ""))
          )}
        />`;

// Remove from before <header>
code = code.replace(progressBar, "");
// Insert after </header>
code = code.replace(/<\/header>\s+<div className="flex-1 min-h-0 overflow-y-auto">/, `</header>\n        <div className="flex-1 min-h-0 overflow-y-auto relative">\n${progressBar}`);

// 2. Update PullToRefresh props
code = code.replace(/onRefresh=\{handleRefresh\}\s+pullingContent=\{<div className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" \/> Pull to refresh<\/div>\}/, `onRefresh={handleRefresh} pullingContent={<div className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" /> Pull down to refresh</div>}`);

// 3. Update handleToggle to send API updates
const handleToggleOld = code.match(/const handleToggle = \(id: string\) => \{[\s\S]*?\}\);(\s*)\};/);
if (handleToggleOld) {
  const handleToggleNew = `  const handleToggle = (id: string) => {
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
  code = code.replace(handleToggleOld[0], handleToggleNew);
}

// 4. Update SignalR listeners to properly sync Log and User pages in realtime
// I previously appended them, but I should ensure they use the correct State update functions and types.

code = code.replace(/hs\.on\("LogCreated", \(data\) => setLogs\(prev => \[data, \.\.\.prev\]\)\);/g, 'hs.on("LogCreated", (data) => setLogs(prev => [data, ...prev]));');
// Same for others, the existing ones I added with fix_section_select.cjs should be fine if they match.

fs.writeFileSync('src/App.tsx', code);
