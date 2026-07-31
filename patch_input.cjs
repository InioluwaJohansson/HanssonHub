const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace <Input to include autoComplete="off" if it doesn't already have it
code = code.replace(/<Input\s+([^>]+)>/g, (match, props) => {
  if (props.includes('autoComplete')) {
    return `<Input ${props}>`;
  }
  return `<Input autoComplete="off" ${props}>`;
});

fs.writeFileSync('src/App.tsx', code);
