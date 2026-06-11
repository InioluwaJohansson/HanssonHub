const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace {rooms.filter(...).map(room => ( ... ))}
code = code.replace(
  /\{rooms\.filter\([^)]+\)\.map\(room => \(\s*<SelectItem key=\{room\.id\} value=\{room\.id(?:\.toString\(\))?\}>\{room\.name\}<\/SelectItem>\s*\)\)\}/g,
  "{(appNamesDetailList?.roomIdNames || []).map(room => (<SelectItem key={room.id} value={room.id.toString()}>{room.name}</SelectItem>))}"
);

code = code.replace(
  /\{\(rooms \|\| \[\]\)\.map\(room => \(\s*<SelectItem key=\{room\.id\} value=\{room\.id(?:\.toString\(\))?\}>\{room\.name\}<\/SelectItem>\s*\)\)\}/g,
  "{(appNamesDetailList?.roomIdNames || []).map(room => (<SelectItem key={room.id} value={room.id.toString()}>{room.name}</SelectItem>))}"
);

code = code.replace(
  /\{sections\.map\(section => \(\s*<SelectItem key=\{section\.id\} value=\{section\.id(?:\.toString\(\))?\}>\{section\.name\}<\/SelectItem>\s*\)\)\}/g,
  "{(appNamesDetailList?.sectionIdNames || []).map(section => (<SelectItem key={section.id} value={section.id.toString()}>{section.name}</SelectItem>))}"
);

code = code.replace(
  /\{\(sections \|\| \[\]\)\.map\(section => \(\s*<SelectItem key=\{section\.id\} value=\{section\.id(?:\.toString\(\))?\}>\{section\.name\}<\/SelectItem>\s*\)\)\}/g,
  "{(appNamesDetailList?.sectionIdNames || []).map(section => (<SelectItem key={section.id} value={section.id.toString()}>{section.name}</SelectItem>))}"
);

code = code.replace(
  /\{\(allUsers \|\| \[\]\)\.map\(u => \(\s*<SelectItem key=\{u\.id\} value=\{u\.id(?:\.toString\(\))?\}>\s*\{u\.getPersonDetailsDto\?.firstName \|\| ''\} \{u\.getPersonDetailsDto\?.lastName \|\| ''\}\s*<\/SelectItem>\s*\)\)\}/g,
  "{(appNamesDetailList?.personIdNames || []).map(u => (<SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>))}"
);

fs.writeFileSync('src/App.tsx', code);
