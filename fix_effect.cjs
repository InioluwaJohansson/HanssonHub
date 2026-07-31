const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find and remove the large useEffect for speech recognition
const regex = /React\.useEffect\(\(\) => \{\s*const SpeechRecognition = \(window as any\)\.SpeechRecognition.*?\}\, \[isMicOverlayActive\, activeCall\, isCallMuted\]\)\;/s;
const match = code.match(regex);
if (match) {
  code = code.replace(regex, '');
  // Insert it before the first return in the main App body (usually around line 11209 but it's better to put it right before `if (!isLoggedIn) {`)
  code = code.replace("  if (!isLoggedIn) {", match[0] + "\n  if (!isLoggedIn) {");
}

fs.writeFileSync('src/App.tsx', code);
