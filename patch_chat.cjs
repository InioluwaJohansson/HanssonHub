const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '"flex flex-col items-center text-center p-4 rounded-2xl border transition-all bg-white shadow-sm relative gap-2 cursor-pointer w-full",',
  '"flex flex-col items-center text-center p-4 rounded-2xl border transition-all bg-white dark:bg-zinc-950 shadow-sm relative gap-2 cursor-pointer w-full",'
);

code = code.replace(
  '"cursor-default border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/10" : "hover:border-emerald-200 hover:bg-slate-50/50",',
  '"cursor-default border-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/25 ring-2 ring-emerald-500/10 dark:ring-emerald-500/20" : "hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50",'
);

code = code.replace(
  '(!isMe && isSelected) ? "border-emerald-500 bg-emerald-50/25 ring-2 ring-emerald-500/10" : (!isMe ? "border-slate-100" : "")',
  '(!isMe && isSelected) ? "border-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/25 ring-2 ring-emerald-500/10 dark:ring-emerald-500/20" : (!isMe ? "border-slate-100 dark:border-zinc-800" : "")'
);

code = code.replace(
  '"border-slate-300 bg-white"',
  '"border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"'
);

code = code.replace(
  '"h-14 w-14 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-100 relative shadow-inner"',
  '"h-14 w-14 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-slate-100 dark:bg-zinc-900 relative shadow-inner"'
);

fs.writeFileSync('src/App.tsx', code);
