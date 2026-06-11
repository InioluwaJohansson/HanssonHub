const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/src=\{feedUrl\}/g, 'src={feedUrl || undefined}');
code = code.replace(/src=\{currentVideoUrl\}/g, 'src={currentVideoUrl || undefined}');
code = code.replace(/src=\{att\.filePath\}/g, 'src={att.filePath || undefined}');
code = code.replace(/src=\{url\}/g, 'src={url || undefined}');
code = code.replace(/src=\{previewMediaUrl\}/g, 'src={previewMediaUrl || undefined}');
code = code.replace(/src=\{img\}/g, 'src={img || undefined}');
code = code.replace(/src=\{videoUrl\}/g, 'src={videoUrl || undefined}');

fs.writeFileSync('src/App.tsx', code);
