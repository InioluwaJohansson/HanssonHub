const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newMain = `<main className="flex flex-1 flex-col min-h-0 overflow-hidden relative">
        <div 
          className={cn(
            "absolute top-0 left-0 h-[2px] z-50 transition-all duration-300 ease-out",
            refreshState === 'idle' ? "opacity-0 w-0" : "opacity-100",
            refreshState === 'loading' ? "bg-black w-[70%]" : 
            (refreshState === 'success' ? "bg-green-500 w-full" : 
            (refreshState === 'error' ? "bg-yellow-500 w-full" : ""))
          )}
        />`;

code = code.replace(/<main className="flex flex-1 flex-col min-h-0 overflow-hidden">/, newMain);

fs.writeFileSync('src/App.tsx', code);
