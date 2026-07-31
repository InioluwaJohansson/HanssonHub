const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  React\.useEffect\(\(\) => \{\n    const SpeechRecognition(.*?)\}, \[isMicOverlayActive, activeCall, isCallMuted\]\);\n/s;
const match = code.match(regex);
if (match) {
  code = code.replace(regex, ''); // remove it from here
  code = code.replace("  if (!isLoggedIn) {\n    return (\n      <>\n        <Toaster position=\"bottom-right\" richColors />\n        <LoginScreen", match[0] + "\n  if (!isLoggedIn) {\n    return (\n      <>\n        <Toaster position=\"bottom-right\" richColors />\n        <LoginScreen");
  fs.writeFileSync('src/App.tsx', code);
  console.log("Moved!");
} else {
  console.log("Not matched!");
}
