const fs = require('fs');
let code = fs.readFileSync('src/components/DeviceCard.tsx', 'utf8');

// The class name is missing "border"
code = code.replace(/"group relative overflow-hidden transition-all duration-300 hover:shadow-md",/g, '"group relative overflow-hidden transition-all duration-300 hover:shadow-md border",');

// Wait let's make it more generic in case I miss
code = code.replace(/className=\{cn\(\s*"group relative overflow-hidden transition-all duration-300 hover:shadow-md",/g, 'className={cn(\n          "group relative border overflow-hidden transition-all duration-300 hover:shadow-md",');

fs.writeFileSync('src/components/DeviceCard.tsx', code);
