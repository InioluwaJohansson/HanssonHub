const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add isViewExternalOpen state
code = code.replace(
  /const \[selectedExternal, setSelectedExternal\] = React\.useState<GetExternalDto \| null>\(null\);/,
  "const [selectedExternal, setSelectedExternal] = React.useState<GetExternalDto | null>(null);\n  const [isViewExternalOpen, setIsViewExternalOpen] = React.useState(false);"
);

// Add modal for view external right before Edit External Device Modal
const viewExternalModal = `
      {/* View External Modal */}
      <Dialog open={isViewExternalOpen} onOpenChange={setIsViewExternalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radio className="h-6 w-6 text-primary" />
              View External
            </DialogTitle>
          </DialogHeader>
          {selectedExternal && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <h3 className="font-semibold">{selectedExternal.externalsName}</h3>
                   <div className="text-xs text-muted-foreground">ID: {selectedExternal.externalsId}</div>
                 </div>
                 <Badge variant={selectedExternal.isTriggered ? 'destructive' : 'secondary'}>
                    {selectedExternal.isTriggered ? 'TRIGGERED' : 'NORMAL'}
                 </Badge>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg space-y-1 text-sm">
                 <span className="text-muted-foreground font-medium">Mapped Automate Triggers:</span>
                 <div className="flex gap-1.5 flex-wrap mt-1">
                   {selectedExternal.actionIds && selectedExternal.actionIds.length > 0 ? (
                     selectedExternal.actionIds.map(aid => {
                       const sceneName = scenes.find(s => s.id === aid.toString())?.name || \`ACT-\${aid}\`;
                       return (
                         <Badge key={aid} variant="outline" className="font-mono text-[10px]">{sceneName}</Badge>
                       );
                     })
                   ) : (
                     <span className="text-muted-foreground italic">No triggers registered</span>
                   )}
                 </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t pt-4">
            <Button 
               variant="outline"
               onClick={() => {
                 if (selectedExternal) {
                   setExternalForm(selectedExternal);
                   setIsViewExternalOpen(false);
                   setIsEditExternalOpen(true);
                 }
               }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit External
            </Button>
            <Button 
              variant={selectedExternal?.isTriggered ? 'destructive' : 'default'}
              onClick={() => {
                 if (selectedExternal) {
                   requestAuth(() => {
                      setExternals(prev => prev.map(item => item.id === selectedExternal.id ? { ...item, isTriggered: !item.isTriggered } : item));
                      setSelectedExternal(prev => prev ? {...prev, isTriggered: !prev.isTriggered} : prev);
                      setLogs(prev => [
                        {
                          id: Math.random().toString(),
                          timestamp: new Date().toISOString(),
                          action: \`\${selectedExternal.externalsName} simulation trigger set to \${!selectedExternal.isTriggered}\`,
                          userName: userProfile.getPersonDetailsDto.firstName,
                          userAvatar: userProfile.getPersonDetailsDto.imageUrl
                        },
                        ...prev
                      ]);
                   });
                 }
              }}
            >
               <Radio className="h-3 w-3 mr-1" />
               {selectedExternal?.isTriggered ? 'Reset Signal' : 'Test Trigger'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
`
code = code.replace(
  /{[\s]*\/\* Edit External Device Modal \*\//,
  viewExternalModal + "\n      {/* Edit External Device Modal */"
);

// update external cards
code = code.replace(
  /<Card key=\{ext\.id\} className="p-4 flex flex-col gap-4 border-2 hover:border-primary\/30 transition-colors shadow-sm bg-white">/g,
  '<Card key={ext.id} className="p-4 flex flex-col gap-4 border-2 hover:border-primary/30 transition-colors cursor-pointer shadow-sm bg-white" onClick={() => { setSelectedExternal(ext); setIsViewExternalOpen(true); }}>'
);
// replace the buttons
code = code.replace(
  /<div className="mt-auto pt-2 flex gap-2">[\s\S]*?Test Trigger'\}[\s\S]*?<\/Button>\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/App.tsx', code);
