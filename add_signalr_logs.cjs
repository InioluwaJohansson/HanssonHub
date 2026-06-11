const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I'll add a helper that wraps hs.on and console logs it
code = code.replace(/const hs = homeSecurityConnection!;/g, `const hsWrapper = homeSecurityConnection!;
    const hs = {
      on: (event, callback) => hsWrapper.on(event, (data) => { console.log('SignalR Event:', event, data); callback(data); }),
      off: (event) => hsWrapper.off(event)
    };`);

code = code.replace(/const cs = chatConnection!;/g, `const csWrapper = chatConnection!;
    const cs = {
      on: (event, callback) => csWrapper.on(event, (data) => { console.log('SignalR Chat Event:', event, data); callback(data); }),
      off: (event) => csWrapper.off(event)
    };`);

fs.writeFileSync('src/App.tsx', code);
