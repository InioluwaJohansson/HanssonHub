const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const insertPos = code.indexOf('<Dialog open={isEditGroupOpen}');

const newDialog = `      <Dialog open={isViewGroupOpen} onOpenChange={setIsViewGroupOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[9px] border border-black shadow-2xl bg-white">
          <DialogHeader className="p-6 pb-2 mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold text-slate-900 mb-[3px]">
                  Group Details
                </DialogTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-500 hover:text-primary rounded-full"
                onClick={() => {
                  setIsViewGroupOpen(false);
                  setIsEditGroupOpen(true);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="pl-7 text-[13px] leading-tight">
              View information about this group chat.
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-6 bg-white max-h-[400px] overflow-y-auto pt-0">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                {newGroupImageUrl ? (
                  <img src={newGroupImageUrl} alt="Group" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-8 w-8 text-slate-300" />
                )}
              </div>
              <div className="w-full space-y-3 text-center">
                <h3 className="text-xl font-bold text-slate-900">{newGroupName}</h3>
                {newGroupDescription && (
                  <p className="text-sm text-slate-500">{newGroupDescription}</p>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-b">
             <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Participants</Label>
             <Badge variant="secondary" className="rounded-full">{selectedParticipants.length + 1}</Badge>
          </div>
          <ScrollArea className="h-[200px] bg-white">
            <div className="p-4 space-y-4">
              {allUsers.filter(u => selectedParticipants.includes(u.id) || u.id === userProfile.id).map((user) => (
                <div key={user.id} className="w-full p-2 flex items-center gap-4 rounded-xl">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-100 shrink-0">
                    <img src={user.getPersonDetailsDto.imageUrl || undefined} alt={user.getPersonDetailsDto.firstName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-sm text-slate-800">
                      {user.id === userProfile.id ? "You" : \`\${user.getPersonDetailsDto.firstName} \${user.getPersonDetailsDto.lastName}\`}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                      {user.getUserDto.roleName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-slate-50">
             <Button 
               variant="outline"
               className="w-full text-destructive border-destructive hover:bg-destructive/10 transition-colors" 
               onClick={() => {
                 setIsViewGroupOpen(false);
                 setIsDeleteChatModalOpen(true);
               }}
             >
               <Trash2 className="mr-2 h-4 w-4" />
               Delete Chat
             </Button>
          </div>
        </DialogContent>
      </Dialog>\n\n`;

code = code.substring(0, insertPos) + newDialog + code.substring(insertPos);
fs.writeFileSync('src/App.tsx', code);
