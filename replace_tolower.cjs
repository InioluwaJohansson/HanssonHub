const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace potentially unsafe .toLowerCase() calls
const regexes = [
  { p: /c\.name\.toLowerCase\(\)/g, r: "(c.name || '').toLowerCase()" },
  { p: /d\.name\.toLowerCase\(\)/g, r: "(d?.name || '').toLowerCase()" },
  { p: /room\.name\.toLowerCase\(\)/g, r: "(room?.name || '').toLowerCase()" },
  { p: /r\.name\.toLowerCase\(\)/g, r: "(r?.name || '').toLowerCase()" },
  { p: /action\.actionName\.toLowerCase\(\)/g, r: "(action?.actionName || '').toLowerCase()" },
  { p: /hw\.hardwareName\.toLowerCase\(\)/g, r: "(hw?.hardwareName || '').toLowerCase()" },
  { p: /ext\.externalName\.toLowerCase\(\)/g, r: "(ext?.externalName || '').toLowerCase()" },
  { p: /s\.name\.toLowerCase\(\)/g, r: "(s?.name || '').toLowerCase()" },
  { p: /newSectionName\.toLowerCase\(\)/g, r: "(newSectionName || '').toLowerCase()" },
];

for (let rule of regexes) {
  content = content.replace(rule.p, rule.r);
}

fs.writeFileSync('src/App.tsx', content);
console.log('done replacing toLowerCase');
