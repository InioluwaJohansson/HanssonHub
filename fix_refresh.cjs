const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import
code = code.replace(/import \{ motion, AnimatePresence \} from 'motion\/react';/g, "import { motion, AnimatePresence } from 'motion/react';\nimport PullToRefresh from 'react-simple-pull-to-refresh';");

// Add handleRefresh
const handleRefreshStr = `
  const handleRefresh = async () => {
    try {
      if (activeView.startsWith('facility-') || activeView.startsWith('room-') || activeView === 'dashboard') {
        const p1 = apiFetch('/Room/GetAllRooms', { method: 'POST' }).then((res: any) => { if (res && res.data) setRooms(res.data.map((r: any) => ({ ...r, name: r.roomName || r.name, section: r.sectionName || r.section || '', icon: r.icon || 'Sofa' }))); });
        const p2 = apiFetch('/Section/GetAllSections', { method: 'POST' }).then((res: any) => { if (res && res.data) setSections(res.data); });
        const p3 = apiFetch('/Appliance/GetAllAppliances', { method: 'POST' }).then((res: any) => { if (res && res.data) { setAppliances(res.data); syncDevicesFromFetchedType('appliance', res.data); } });
        const p4 = apiFetch('/Light/GetAllLights', { method: 'POST' }).then((res: any) => { if (res && res.data) { setLights(res.data); syncDevicesFromFetchedType('light', res.data); } });
        const p5 = apiFetch('/Camera/GetAllCameras', { method: 'POST' }).then((res: any) => { if (res && res.data) { setCameras(res.data); syncDevicesFromFetchedType('camera', res.data); } });
        const p6 = apiFetch('/Door/GetAllDoors', { method: 'POST' }).then((res: any) => { if (res && res.data) { setDoors(res.data); syncDevicesFromFetchedType('door', res.data); } });
        const p7 = apiFetch('/Window/GetAllWindows', { method: 'POST' }).then((res: any) => { if (res && res.data) { setWindows(res.data); syncDevicesFromFetchedType('window', res.data); } });
        const p8 = apiFetch('/External/GetAllExternals', { method: 'POST' }).then((res: any) => { if (res && res.data) setExternals(res.data); });
        await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8]);
        toast.success("Facilities data refreshed");
      }
    } catch(err) {
      console.error(err);
    }
  };
`;

code = code.replace(/const toggleRoomLock = \(roomId: string \| number\) => \{/g, handleRefreshStr + '\n  const toggleRoomLock = (roomId: string | number) => {');

// Replace {renderView()}
const renderViewOld = `<AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>`;

const renderViewNew = `<PullToRefresh onRefresh={handleRefresh} pullingContent={<div className="text-center p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" /> Pull to refresh</div>} refreshingContent={<div className="text-center p-4 text-xs font-bold text-primary uppercase tracking-widest"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" /> Refreshing...</div>}>
              <div className="min-h-full">
                <AnimatePresence mode="wait">
                  {renderView()}
                </AnimatePresence>
              </div>
            </PullToRefresh>`;

code = code.replace(renderViewOld, renderViewNew);

fs.writeFileSync('src/App.tsx', code);
