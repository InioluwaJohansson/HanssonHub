const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /React\.useEffect\(\(\) => \{\n    let refs = \{\n      isChatModalOpen: isChatModalOpenRef\.current,\n      userProfileId: userProfile\?\.id,\n    \};\n    \n    const \{ homeSecurityConnection, chatConnection \} = initSignalR\(\);/,
  `React.useEffect(() => {
    if (!isLoggedIn) return;

    let refs = {
      isChatModalOpen: isChatModalOpenRef.current,
      userProfileId: userProfile?.id,
    };
    
    const { homeSecurityConnection, chatConnection } = initSignalR();`
);

code = code.replace(
  /       cs\.off\("chat:message"\);\n    \};\n  \}, \[\]\);\n\n  \/\/ Camera Fullscreen Logic/,
  `       cs.off("chat:message");
    };
  }, [isLoggedIn]);

  // Camera Fullscreen Logic`
);

fs.writeFileSync('src/App.tsx', code);
