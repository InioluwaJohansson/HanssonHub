const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /hs\.on\("ActionCreated", \(data\) => console\.log\("ActionCreated", data\)\);/, 
  `hs.on("ActionCreated", (data) => setActions(prev => [...prev, { id: data.actionId, actionName: data.actionName, actionDescription: data.description, actionActive: false, actionId: '', getActionStepDtos: [] }]));`
);

code = code.replace(
  /hs\.on\("ActionUpdated", \(data\) => console\.log\("ActionUpdated", data\)\);/, 
  `hs.on("ActionUpdated", (data) => setActions(prev => prev.map(a => a.id === data.actionId ? { ...a, actionName: data.actionName, actionDescription: data.description } : a)));`
);

code = code.replace(
  /hs\.on\("ActionActivationChanged", \(data\) => console\.log\("ActionActivationChanged", data\)\);/, 
  `hs.on("ActionActivationChanged", (data) => setActions(prev => prev.map(a => a.id === data.actionId ? { ...a, actionActive: data.isActive } : a)));`
);

code = code.replace(
  /hs\.on\("ActionDeleted", \(data\) => console\.log\("ActionDeleted", data\)\);/, 
  `hs.on("ActionDeleted", (data) => setActions(prev => prev.filter(a => a.id !== data.actionId)));`
);

code = code.replace(
  /hs\.on\("ActionStepAdded", \(data\) => console\.log\("ActionStepAdded", data\)\);/, 
  `hs.on("ActionStepAdded", (data) => { if(data.data) setActions(prev => prev.map(a => a.id === data.actionId ? data.data : a)); });`
);

code = code.replace(
  /hs\.on\("ActionStepUpdated", \(data\) => console\.log\("ActionStepUpdated", data\)\);/, 
  `hs.on("ActionStepUpdated", (data) => { if(data.data) setActions(prev => prev.map(a => a.id === data.actionId ? data.data : a)); });`
);

code = code.replace(
  /hs\.on\("ActionStepDeleted", \(data\) => console\.log\("ActionStepDeleted", data\)\);/, 
  `hs.on("ActionStepDeleted", (data) => setActions(prev => prev.map(a => a.id === data.actionId ? { ...a, getActionStepDtos: a.getActionStepDtos.filter(s => s.id !== data.actionStepId) } : a)));`
);

fs.writeFileSync('src/App.tsx', code);
