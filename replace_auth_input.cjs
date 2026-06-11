const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Input\s+type="password"\s+maxLength=\{6\}\s+className="text-center text-2xl tracking-\[0\.5em\] font-mono h-14 w-full"\s+placeholder="••••••"\s+value=\{authCode\}\s+onChange=\{\(e\) => \{\s+const val = e\.target\.value\.replace\(\/\\D\/g, ''\);\s+if \(val\.length <= 6\) \{ setAuthCode\(val\); setAuthError\(false\); \}\s+\}\}\s+\/>/g;

const replacement = `<div className="flex gap-2 justify-center w-full">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      id={\`auth-code-input-\${index}\`}
                      type="password"
                      maxLength={1}
                      className={cn(
                        "h-14 w-12 text-center text-2xl font-mono border-2 transition-all rounded-lg bg-white",
                        authCode[index] ? "border-primary" : "border-slate-200 focus:border-primary"
                      )}
                      value={authCode[index] || ''}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !authCode[index]) {
                          const prev = document.getElementById(\`auth-code-input-\${index - 1}\`);
                          if (prev) prev.focus();
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\\D/g, '');
                        if (val) {
                          const newCode = authCode.substring(0, index) + val + authCode.substring(index + 1);
                          const limitedCode = newCode.substring(0, 6);
                          setAuthCode(limitedCode);
                          setAuthError(false);
                          const next = document.getElementById(\`auth-code-input-\${index + 1}\`);
                          if (next) next.focus();
                        } else {
                          const newCode = authCode.substring(0, index) + authCode.substring(index + 1);
                          setAuthCode(newCode);
                        }
                      }}
                    />
                  ))}
                </div>`;

const newCode = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', newCode);
console.log("Replaced input.");
