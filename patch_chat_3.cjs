const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '"w-full p-3.5 flex items-center gap-4 rounded-2xl transition-all border border-slate-100 bg-white hover:bg-slate-50 text-left shadow-sm group"',
  '"w-full p-3.5 flex items-center gap-4 rounded-2xl transition-all border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 text-left shadow-sm group"'
);

code = code.replace(
  '"h-12 w-12 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-100 shrink-0 relative shadow-inner"',
  '"h-12 w-12 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-slate-100 dark:bg-zinc-900 shrink-0 relative shadow-inner"'
);

code = code.replace(
  '"font-bold text-sm text-slate-800 truncate"',
  '"font-bold text-sm text-slate-800 dark:text-zinc-100 truncate"'
);

code = code.replace(
  '"text-slate-300"',
  '"text-slate-300 dark:text-zinc-600"'
);

code = code.replace(
  '"text-slate-400 font-semibold"',
  '"text-slate-400 dark:text-zinc-400 font-semibold"'
);

code = code.replace(
  '"h-5 w-5 text-slate-400"',
  '"h-5 w-5 text-slate-400 dark:text-zinc-500"'
);

fs.writeFileSync('src/App.tsx', code);
