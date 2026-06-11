const fs = require('fs');

let clientCode = fs.readFileSync('src/api/client.ts', 'utf8');
clientCode = clientCode.replace(
  /if \(!window\.location\.pathname\.includes\('login'\)\) \{\n\s*window\.location\.reload\(\);\n\s*\}/,
  `window.dispatchEvent(new CustomEvent('auth-expired'));`
);
fs.writeFileSync('src/api/client.ts', clientCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /const handleLogout = \(\) => \{/g,
  `const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('roleName');
    localStorage.removeItem('personId');
    
    fetchedViewsRef.current = {};
    setIsLoggedIn(false);
    setUserDto(null);
    setUserProfile(null);
  };
  
  React.useEffect(() => {
    const handleAuthExpired = () => {
      handleLogout();
      toast.error("Session expired. Please log in again.");
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const _oldHandleLogout = () => {`
);

appCode = appCode.replace(
  /toast\.success\("Successfully logged out"\);\n  \};/g,
  `toast.success("Successfully logged out");\n  };`
);

fs.writeFileSync('src/App.tsx', appCode);
