const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexToRemove = /  React\.useEffect\(\(\) => \{\n    const SpeechRecognition(.*?)\, \[isMicOverlayActive\, activeCall\, isCallMuted\]\)\;\n/s;
const match = code.match(regexToRemove);

if (match) {
  code = code.replace(regexToRemove, '');
  
  // Now add it properly at the end
  const properEffect = `
  React.useEffect(() => {
    const SpeechRecognition${match[1]}}, [isMicOverlayActive, activeCall, isCallMuted]);
`;
  
  code = code.replace("  if (!isLoggedIn) {\n    return (\n      <>\n        <Toaster", properEffect + "\n  if (!isLoggedIn) {\n    return (\n      <>\n        <Toaster");
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed!");
} else {
  console.log("Not matched!");
}
