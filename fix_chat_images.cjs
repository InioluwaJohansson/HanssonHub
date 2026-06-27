const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const listTarget = `                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-100",
                            activeChatId === chat.id ? "bg-primary/10" : "bg-slate-50"
                          )}>
                            {chat.imageUrl ? (
                              <img src={chat.imageUrl || undefined} alt={chat.name} className="h-full w-full object-cover" />
                            ) : (
                              chat.isGroup ? <Users className="h-6 w-6 text-slate-400" /> : <UserIcon className="h-6 w-6 text-slate-400" />
                            )}
                          </div>`;

const listReplacement = `                          <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-100 text-lg font-bold text-slate-600",
                            activeChatId === chat.id ? "bg-primary/10" : "bg-slate-50"
                          )}>
                            {(() => {
                              const otherParticipant = !chat.isGroup ? chat.participants.find(p => p.personId !== userProfile.id) : null;
                              const displayImageUrl = chat.isGroup ? chat.imageUrl : (otherParticipant?.profileImageUrl || chat.imageUrl);
                              const displayInitial = chat.name ? chat.name.charAt(0).toUpperCase() : (otherParticipant?.fullName ? otherParticipant.fullName.charAt(0).toUpperCase() : 'U');
                              
                              if (displayImageUrl) {
                                return <img src={displayImageUrl.startsWith('http') ? displayImageUrl : \`\${baseUrl}/storage/\${displayImageUrl}\`} alt={chat.name} className="h-full w-full object-cover" />;
                              }
                              return chat.isGroup ? <Users className="h-6 w-6 text-slate-400" /> : <span>{displayInitial}</span>;
                            })()}
                          </div>`;

code = code.replace(listTarget, listReplacement);

const headerTarget = `                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner overflow-hidden border border-slate-200">
                            {chat.imageUrl ? (
                              <img src={chat.imageUrl || undefined} alt={chat.name} className="h-full w-full object-cover" />
                            ) : (
                              chat.isGroup ? <Users className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />
                            )}
                          </div>`;

const headerReplacement = `                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner overflow-hidden border border-slate-200 text-lg font-bold">
                            {(() => {
                              const otherParticipant = !chat.isGroup ? chat.participants.find(p => p.personId !== userProfile.id) : null;
                              const displayImageUrl = chat.isGroup ? chat.imageUrl : (otherParticipant?.profileImageUrl || chat.imageUrl);
                              const displayInitial = chat.name ? chat.name.charAt(0).toUpperCase() : (otherParticipant?.fullName ? otherParticipant.fullName.charAt(0).toUpperCase() : 'U');
                              
                              if (displayImageUrl) {
                                return <img src={displayImageUrl.startsWith('http') ? displayImageUrl : \`\${baseUrl}/storage/\${displayImageUrl}\`} alt={chat.name} className="h-full w-full object-cover" />;
                              }
                              return chat.isGroup ? <Users className="h-5 w-5" /> : <span>{displayInitial}</span>;
                            })()}
                          </div>`;

code = code.replace(headerTarget, headerReplacement);

fs.writeFileSync('src/App.tsx', code);
