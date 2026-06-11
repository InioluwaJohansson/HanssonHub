const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add authSuccess state
const authStateRef = `const [authError, setAuthError] = React.useState(false);`;
code = code.replace(authStateRef, `${authStateRef}\n  const [authSuccess, setAuthSuccess] = React.useState(false);`);

const verifyAuthOld = `if (response.success || response === true) {
            onAuthSuccess?.();
            setIsAuthModalOpen(false);
            setAuthCode('');
            setAuthError(false);
            setOnAuthSuccess(null);
          }`;

const verifyAuthNew = `if (response.success || response === true || response.data === true) {
            setAuthSuccess(true);
            setTimeout(() => {
              onAuthSuccess?.();
              setIsAuthModalOpen(false);
              setAuthCode('');
              setAuthError(false);
              setAuthSuccess(false);
              setOnAuthSuccess(null);
            }, 800);
          }`;

code = code.replace(verifyAuthOld, verifyAuthNew);

// Update DialogContent border
const dialogContentOld = `<DialogContent className="sm:max-w-[420px] rounded-3xl border shadow-2xl p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" showCloseButton={false}>`;
const dialogContentNew = `<DialogContent className={cn("sm:max-w-[420px] rounded-3xl border shadow-2xl p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-500", authSuccess && "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-green-50 dark:bg-green-900/10")} showCloseButton={false}>`;

code = code.replace(dialogContentOld, dialogContentNew);

const inputOld = `authCode[index] ? "border-primary" : "border-slate-200 focus:border-primary"`;
const inputNew = `authSuccess ? "border-green-500 text-green-600 bg-green-50" : (authCode[index] ? "border-primary" : "border-slate-200 focus:border-primary")`;

code = code.replace(/authCode\[index\] \? "border-primary" : "border-slate-200 focus:border-primary"/g, inputNew);

fs.writeFileSync('src/App.tsx', code);
