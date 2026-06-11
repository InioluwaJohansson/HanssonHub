const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure handleRefresh is defined.
// If it already exists, this might be redundant, but let's check or just add it if missing.
// I'll look for `const toggleRoomLock` and insert before it.

const handleRefreshDef = `
  const handleRefresh = async () => {
    try {
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
        toast.success("All data refreshed");
    } catch(err) {
      console.error(err);
    }
  };
`;

if (!code.includes('const handleRefresh =')) {
    code = code.replace(/  const toggleRoomLock = \(roomId: string \| number\) => \{/g, `${handleRefreshDef}\n  const toggleRoomLock = (roomId: string | number) => {`);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed handleRefresh definition.");
