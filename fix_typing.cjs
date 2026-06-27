const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                        <Input 
                          placeholder="Type a message" 
                          className="py-6 px-4 rounded-none border-none bg-inherit focus-visible:ring-0 shadow-none text-[16px] placeholder:text-[#667781] text-black"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />`;

const replacement = `                        <Input 
                          placeholder="Type a message" 
                          className="py-6 px-4 rounded-none border-none bg-inherit focus-visible:ring-0 shadow-none text-[16px] placeholder:text-[#667781] text-black"
                          value={chatInput}
                          onChange={(e) => {
                            setChatInput(e.target.value);
                            const now = Date.now();
                            if (now - (window as any).lastTypingSentTime > 5000 || !(window as any).lastTypingSentTime) {
                              (window as any).lastTypingSentTime = now;
                              apiFetch(\`/Message/TypingIndicator?chatId=\${activeChatId}\`, { method: 'POST' }).catch(() => {});
                            }
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
