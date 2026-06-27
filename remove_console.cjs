const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('{/* Developer Console Sliding Pane */}');
const endIndex = code.indexOf('{/* Schema Inspector / Payload Stream Logs */}');

if (startIndex !== -1 && endIndex !== -1) {
  // Find the end of the block. We know it ends around line 12346.
  const afterEndBlock = code.indexOf('            </>\n          )}\n        </DialogContent>\n      </Dialog>', endIndex);
  if (afterEndBlock !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(afterEndBlock);
    fs.writeFileSync('src/App.tsx', before + after);
    console.log("Replaced block successfully");
  } else {
    console.log("Could not find end of block");
  }
} else {
  console.log("Could not find start/end markers");
}
