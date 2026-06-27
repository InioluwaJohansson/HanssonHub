const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
`                  {selectedMessageId && (
                    <div 
                      className="absolute inset-0 bg-white/30 backdrop-blur-[4px] z-40 transition-all duration-300"
                      onClick={() => setSelectedMessageId(null)}
                    />
                  )}
                  
                  <ScrollArea className="h-full w-full chat-scroll-viewport">
                    <div className="p-6 md:px-12 xl:px-24 relative z-10 flex flex-col min-h-full">`,
`                  <ScrollArea className="h-full w-full chat-scroll-viewport">
                    <div className="p-6 md:px-12 xl:px-24 relative z-10 flex flex-col min-h-full">
                      {selectedMessageId && (
                        <div 
                          className="absolute inset-0 -m-32 bg-white/30 backdrop-blur-[4px] z-40 transition-all duration-300"
                          onClick={() => setSelectedMessageId(null)}
                        />
                      )}`
);

fs.writeFileSync('src/App.tsx', code);
