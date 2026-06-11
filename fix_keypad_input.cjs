const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\{\[0, 1, 2, 3, 4, 5\]\.map\(\(index\) => \(\s*<Input/g,
  '{[0, 1, 2, 3, 4, 5].map((index) => (<input'
);
code = code.replace(
  /\{\[0, 1, 2, 3, 4, 5\]\.map\(\(index\) => \(\s*<input([\s\S]*?)onChange=\{\(e\) => \{([\s\S]*?)\}\}([\s\S]*?)\/>/g,
  `{[0, 1, 2, 3, 4, 5].map((index) => (
                    <input$1onChange={(e) => {$2}}$3/>`
);

fs.writeFileSync('src/App.tsx', code);
