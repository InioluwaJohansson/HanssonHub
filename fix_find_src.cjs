const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/appNamesDetailList(?:(?:\?.sectionIds)|(?:\.sectionIds))\?\.find/g, 'sections.find');
code = code.replace(/appNamesDetailList(?:(?:\?.roomIds)|(?:\.roomIds))\?\.find/g, 'rooms.find');
code = code.replace(/appNamesDetailList\.sectionIds\.find/g, 'sections.find');
code = code.replace(/appNamesDetailList\.roomIds\.find/g, 'rooms.find');

// Also safely handle other finds:
code = code.replace(/\brooms\.find/g, '(rooms || []).find');
code = code.replace(/\bsections\.find/g, '(sections || []).find');
code = code.replace(/\bappliances\.find/g, '(appliances || []).find');
code = code.replace(/\bcameras\.find/g, '(cameras || []).find');
code = code.replace(/\bdoors\.find/g, '(doors || []).find');
code = code.replace(/\bexternals\.find/g, '(externals || []).find');
code = code.replace(/\blights\.find/g, '(lights || []).find');
code = code.replace(/\bwindows\.find/g, '(windows || []).find');
code = code.replace(/\bactions\.find/g, '(actions || []).find');
code = code.replace(/\bscenes\.find/g, '(scenes || []).find');
code = code.replace(/\bchats\.find/g, '(chats || []).find');
code = code.replace(/\bchatMessages\.find/g, '(chatMessages || []).find');
code = code.replace(/\bcontactCategories\.find/g, '(contactCategories || []).find');
code = code.replace(/\bappNamesDetailList\.cameraIdNames\.find/g, '(appNamesDetailList?.cameraIdNames || []).find');
code = code.replace(/\bappNamesDetailList\.applianceIdNames\.find/g, '(appNamesDetailList?.applianceIdNames || []).find');

// Also handle the empty src attributes
code = code.replace(/src={([^}]+) \? ([^:]+) : ""}/g, 'src={$1 ? $2 : undefined}');
code = code.replace(/src={([^}]+) \|\| ""}/g, 'src={$1 || undefined}');
code = code.replace(/src={([^}]+) \? ([^:]+) : ''}/g, 'src={$1 ? $2 : undefined}');
code = code.replace(/src={([^}]+) \|\| ''}/g, 'src={$1 || undefined}');
code = code.replace(/src=""/g, '');
code = code.replace(/src=''/g, '');

fs.writeFileSync('src/App.tsx', code);
