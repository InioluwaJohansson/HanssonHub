const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                                  <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.01, 0.2) }}
                                    drag="x"
                                    dragConstraints={{ left: -50, right: 50 }}
                                    onDragEnd={(_, info) => {
                                      if (Math.abs(info.offset.x) > 40) {
                                        setReplyingTo(msg);
                                      }
                                    }}
                                    key={(msg.id ?? msg.Id) || idx} 
                                    className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}
                                  >
                                    <div className={cn(
                                      "group/msg relative max-w-[85%] lg:max-w-[70%] xl:max-w-[60%] p-2 rounded-xl shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] transition-all",
                                      isMe ? "bg-[#d9fdd3] rounded-tr-none ml-12" : "bg-white rounded-tl-none mr-12"
                                    )}>`;

const replacement = `                                  <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.01, 0.2) }}
                                    drag="x"
                                    dragConstraints={{ left: -50, right: 50 }}
                                    onDragEnd={(_, info) => {
                                      if (Math.abs(info.offset.x) > 40) {
                                        setReplyingTo(msg);
                                      }
                                    }}
                                    key={(msg.id ?? msg.Id) || idx} 
                                    className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start", selectedMessageId === msg.id ? "z-50 relative" : "")}
                                  >
                                    <div 
                                      className={cn(
                                        "group/msg relative max-w-[85%] lg:max-w-[70%] xl:max-w-[60%] p-2 rounded-xl shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] transition-all",
                                        isMe ? "bg-[#d9fdd3] rounded-tr-none ml-12" : "bg-white rounded-tl-none mr-12",
                                        selectedMessageId === msg.id ? "shadow-2xl scale-[1.02]" : ""
                                      )}
                                      onTouchStart={() => {
                                        longPressTimeout.current = setTimeout(() => {
                                          setSelectedMessageId(msg.id);
                                        }, 600);
                                      }}
                                      onTouchEnd={() => clearTimeout(longPressTimeout.current)}
                                      onTouchMove={() => clearTimeout(longPressTimeout.current)}
                                      onMouseDown={() => {
                                        longPressTimeout.current = setTimeout(() => {
                                          setSelectedMessageId(msg.id);
                                        }, 600);
                                      }}
                                      onMouseUp={() => clearTimeout(longPressTimeout.current)}
                                      onMouseLeave={() => clearTimeout(longPressTimeout.current)}
                                    >
                                      {selectedMessageId === msg.id && (
                                        <div className={cn(
                                          "absolute top-full mt-2 w-56 bg-[#f0f0f0]/95 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden shadow-2xl z-[70] border border-white/40",
                                          isMe ? "right-0" : "left-0"
                                        )}>
                                          <button className="flex items-center justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors text-[15px] text-slate-800" onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); setSelectedMessageId(null); }}>
                                            <span>Reply</span> <Reply className="h-5 w-5 opacity-70" />
                                          </button>
                                          <button className="flex items-center justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors text-[15px] text-slate-800" onClick={(e) => { e.stopPropagation(); setSelectedMessageId(null); }}>
                                            <span>Forward</span> <Forward className="h-5 w-5 opacity-70" />
                                          </button>
                                          <button className="flex items-center justify-between p-3 border-b border-black/5 hover:bg-black/5 transition-colors text-[15px] text-slate-800" onClick={(e) => { 
                                            e.stopPropagation();
                                            if(msg.content) navigator.clipboard.writeText(msg.content); 
                                            setSelectedMessageId(null); 
                                          }}>
                                            <span>Copy</span> <Copy className="h-5 w-5 opacity-70" />
                                          </button>
                                          {isMe && (
                                            <button className="flex items-center justify-between p-3 hover:bg-red-500/10 transition-colors text-[15px] text-red-500 font-medium" onClick={(e) => { e.stopPropagation(); setMessageToDelete(msg); setSelectedMessageId(null); }}>
                                              <span>Delete</span> <Trash2 className="h-5 w-5" />
                                            </button>
                                          )}
                                        </div>
                                      )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
