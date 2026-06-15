const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add border to various cards to ensure they are visible
// Externals
code = code.replace(/<Card key=\{ext\.id\} className="p-6 flex flex-col gap-4 transition-all cursor-pointer bg-card shadow-sm"/g, '<Card key={ext.id} className="p-6 flex flex-col gap-4 border transition-all cursor-pointer bg-card shadow-sm"');
// Rooms in Sections
code = code.replace(/<Card\s+key=\{room\.id\}\s+className="cursor-pointer hover:bg-accent transition-colors group relative"/g, '<Card key={room.id} className="border cursor-pointer hover:bg-accent transition-colors group relative"');
// All Rooms
code = code.replace(/<Card\s+key=\{room\.id\}\s+className="cursor-pointer overflow-hidden transition-all hover:shadow-md group relative"/g, '<Card key={room.id} className="border cursor-pointer overflow-hidden transition-all hover:shadow-md group relative"');

// 2. Fix Externals toggle to call API
const externalToggleOld = `onCheckedChange={(checked) => {
                            setExternals(prev => prev.map(e => e.id === ext.id ? { ...e, isActive: checked } : e));
                            addLogEntry('Hardware Security', \`\${ext.externalName} functional state set to \${checked ? 'enabled' : 'disabled'}\`);
                          }}`;

const externalToggleNew = `onCheckedChange={(checked) => {
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
                          }}`;

code = code.replace(externalToggleOld, externalToggleNew);

fs.writeFileSync('src/App.tsx', code);
