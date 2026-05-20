const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Card key=\{ext\.id\} className="p-6 flex flex-col gap-4 border hover:border-primary\/50 transition-all bg-card shadow-sm">/g,
  '<Card key={ext.id} className="p-6 flex flex-col gap-4 border hover:border-primary/50 transition-all cursor-pointer bg-card shadow-sm" onClick={() => { setSelectedExternal(ext); setIsViewExternalOpen(true); }}>'
);

fs.writeFileSync('src/App.tsx', code);
