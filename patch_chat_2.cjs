const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '"font-bold text-sm text-slate-800 truncate px-1"',
  '"font-bold text-sm text-slate-800 dark:text-zinc-100 truncate px-1"'
);

code = code.replace(
  '"text-slate-400 font-semibold flex items-center gap-1"',
  '"text-slate-400 dark:text-zinc-400 font-semibold flex items-center gap-1"'
);

code = code.replace(
  '"h-1.5 w-1.5 bg-slate-300 rounded-full"',
  '"h-1.5 w-1.5 bg-slate-300 dark:bg-zinc-600 rounded-full"'
);

code = code.replace(
  '"text-slate-400 font-normal mt-0.5 text-[9px] uppercase tracking-wider"',
  '"text-slate-400 dark:text-zinc-500 font-normal mt-0.5 text-[9px] uppercase tracking-wider"'
);

code = code.replace(
  '"px-4 py-2.5 bg-white border-b shrink-0"',
  '"px-4 py-2.5 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 shrink-0"'
);

code = code.replace(
  '"pl-10 pr-10 h-10 bg-transparent hover:bg-transparent border-0 border-b border-slate-200 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-slate-400/70 transition-all w-full"',
  '"pl-10 pr-10 h-10 bg-transparent hover:bg-transparent border-0 border-b border-slate-200 dark:border-zinc-800 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-slate-400/70 dark:placeholder:text-zinc-500 transition-all w-full dark:text-zinc-100"'
);

code = code.replace(
  '"absolute right-3.5 h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"',
  '"absolute right-3.5 h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors"'
);

fs.writeFileSync('src/App.tsx', code);
