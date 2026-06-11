const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /"h-14 w-12 text-center text-2xl font-mono border-2 transition-all rounded-lg bg-white"/g,
  '"h-10 w-8 sm:w-10 text-center text-lg sm:text-xl font-mono border-2 transition-all rounded-lg bg-white"'
);

fs.writeFileSync('src/App.tsx', code);
