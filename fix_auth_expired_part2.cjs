const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleLogout = \(\) => \{/,
  `React.useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('roleName');
      localStorage.removeItem('personId');
      fetchedViewsRef.current = {};
      setIsLoggedIn(false);
      setUserDto(null);
      setUserProfile(null);
      toast.error("Session expired. Please log in again.");
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const handleLogout = () => {`
);

fs.writeFileSync('src/App.tsx', code);
