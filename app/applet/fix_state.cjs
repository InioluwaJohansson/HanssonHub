const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/const \[isDevConsoleOpen, setIsDevConsoleOpen\] = React\.useState\(true\);\n/g, '');
code = code.replace(/const \[dtoLogs, setDtoLogs\].*\n/g, '');
code = code.replace(/const \[simulatedInboundText, setSimulatedInboundText\].*\n/g, '');
code = code.replace(/const \[simulatedInboundType, setSimulatedInboundType\].*\n/g, '');
fs.writeFileSync('src/App.tsx', code);
