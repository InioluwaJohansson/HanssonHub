const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  React\.useEffect\(\(\) => \{\n  React\.useEffect\(\(\) => \{\n    const SpeechRecognition(.*?)\}, \[isMicOverlayActive, activeCall, isCallMuted\]\);\n  if \(\!isLoggedIn\) \{/s;

const match = code.match(regex);
if (match) {
  const speechEffect = `  React.useEffect(() => {\n    const SpeechRecognition${match[1]}, [isMicOverlayActive, activeCall, isCallMuted]);\n`;
  const fixedCode = code.replace(regex, `${speechEffect}\n  React.useEffect(() => {\n    if (!isLoggedIn) {`);
  fs.writeFileSync('src/App.tsx', fixedCode);
  console.log("Fixed!");
} else {
  console.log("Not matched!");
}
