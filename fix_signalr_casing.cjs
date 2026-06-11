const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/data\.id/g, '(data.id ?? data.Id)');
code = code.replace(/data\.actionId/g, '(data.actionId ?? data.ActionId)');
code = code.replace(/data\.actionName/g, '(data.actionName ?? data.ActionName)');
code = code.replace(/data\.description/g, '(data.description ?? data.Description)');
code = code.replace(/data\.isActive/g, '(data.isActive ?? data.IsActive)');
code = code.replace(/data\.isOpen/g, '(data.isOpen ?? data.IsOpen)');
code = code.replace(/data\.isLocked/g, '(data.isLocked ?? data.IsLocked)');
code = code.replace(/data\.brightnessLevel/g, '(data.brightnessLevel ?? data.BrightnessLevel)');
code = code.replace(/data\.data/g, '(data.data ?? data.Data)');
code = code.replace(/data\.actionStepId/g, '(data.actionStepId ?? data.ActionStepId)');

// Revert double replacements if any
code = code.replace(/\(\(data\.id \?\? data\.Id\) \?\? data\.Id\)/g, '(data.id ?? data.Id)');
// ...

fs.writeFileSync('src/App.tsx', code);
