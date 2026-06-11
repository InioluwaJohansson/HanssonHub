const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleRefreshOld = `const p8 = apiFetch('/External/GetAllExternals', { method: 'POST' }).then((res: any) => { if (res && res.data) setExternals(res.data); });
        await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8]);`;

const handleRefreshNew = `const p8 = apiFetch('/External/GetAllExternals', { method: 'POST' }).then((res: any) => { if (res && res.data) setExternals(res.data); });
        const p9 = apiFetch('/Hardware/GetAllHardwares', { method: 'GET' }).then((res: any) => { if (res && res.data) setHardwares(res.data); });
        const p10 = apiFetch('/Person/GetAllPersons', { method: 'POST' }).then((res: any) => { if (res && res.data) setAllUsers(res.data); });
        const p11 = apiFetch('/ContactCategory/GetAllContactCategories', { method: 'POST' }).then((res: any) => { if (res && res.data) setContactCategories(res.data); });
        const p12 = apiFetch('/Contact/GetAllContacts', { method: 'POST', body: '' }).then((res: any) => { if (res && res.data) setContacts(res.data); });
        await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]);`;

code = code.replace(handleRefreshOld, handleRefreshNew);

// In handleRefresh's if statement, it should allow all views!
const conditionOld = `if (activeView.startsWith('facility-') || activeView.startsWith('room-') || activeView === 'dashboard') {`;
const conditionNew = `if (true) { // fetch all for full snapshot`;
code = code.replace(conditionOld, conditionNew);

fs.writeFileSync('src/App.tsx', code);
