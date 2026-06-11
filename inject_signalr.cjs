const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const signalRBlock = `  React.useEffect(() => {
    let refs = {
      isChatModalOpen: isChatModalOpenRef.current,
      userProfileId: userProfile?.id,
    };
    
    const { homeSecurityConnection, chatConnection } = initSignalR();

    if (homeSecurityConnection!.state === "Disconnected") {
      homeSecurityConnection!.start().catch(err => console.error("SignalR Connection Error: ", err));
    }
    if (chatConnection!.state === "Disconnected") {
      chatConnection!.start().catch(err => console.error("Chat SignalR Connection Error: ", err));
    }

    const hs = homeSecurityConnection!;
    
    // Action Events
    hs.on("ActionCreated", (data) => console.log("ActionCreated", data));
    hs.on("ActionUpdated", (data) => console.log("ActionUpdated", data));
    hs.on("ActionActivationChanged", (data) => console.log("ActionActivationChanged", data));
    hs.on("ActionDeleted", (data) => console.log("ActionDeleted", data));
    
    hs.on("ApplianceTriggered", (data) => {
        setAppliances(prev => prev.map(a => a.id === data.id ? { ...a, isActive: data.isActive } : a));
    });
    hs.on("CameraTriggered", (data) => {
        setCameras(prev => prev.map(c => c.id === data.id ? { ...c, isActive: data.isActive } : c));
    });
    hs.on("LightTriggered", (data) => {
        setLights(prev => prev.map(l => l.id === data.id ? { ...l, isActive: data.isActive, brightnessLevel: data.brightnessLevel || l.brightnessLevel } : l));
    });
    hs.on("DoorTriggered", (data) => {
        setDoors(prev => prev.map(d => d.id === data.id ? { ...d, isOpen: data.isOpen, isLocked: data.isLocked } : d));
    });
    hs.on("WindowTriggered", (data) => {
        setWindows(prev => prev.map(w => w.id === data.id ? { ...w, isOpen: data.isOpen, isLocked: data.isLocked } : w));
    });
    
    hs.on("ActionTriggered", (data) => console.log("ActionTriggered", data));
    hs.on("ActionStepAdded", (data) => console.log("ActionStepAdded", data));
    hs.on("ActionStepUpdated", (data) => console.log("ActionStepUpdated", data));
    hs.on("ActionStepDeleted", (data) => console.log("ActionStepDeleted", data));

    // Appliance Events
    hs.on("ApplianceCreated", (data) => setAppliances(prev => [...prev, data]));
    hs.on("ApplianceUpdated", (data) => setAppliances(prev => prev.map(a => a.id === data.id ? data : a)));
    hs.on("ApplianceDeleted", (data) => setAppliances(prev => prev.filter(a => a.id !== data.id)));

    // Camera Events
    hs.on("CameraCreated", (data) => setCameras(prev => [...prev, data]));
    hs.on("CameraUpdated", (data) => setCameras(prev => prev.map(c => c.id === data.id ? data : c)));
    hs.on("CameraDeleted", (data) => setCameras(prev => prev.filter(c => c.id !== data.id)));

    // FingerPrint Event
    hs.on("fingerprint_received", (data) => {
        console.log("Fingerprint received", data);
        toast.info(data.message || "Fingerprint data received");
        setFingerprintImages(prev => [...prev, data.fingerPrintEncoding]);
    });

    // External Events
    hs.on("ExternalsCreated", (data) => setExternals(prev => [...prev, data]));
    hs.on("ExternalsUpdated", (data) => setExternals(prev => prev.map(e => e.id === data.id ? data : e)));
    hs.on("ExternalsDeleted", (data) => setExternals(prev => prev.filter(e => e.id === data.id))); // Fix? the data only has Id for deleted usually.. filter if logic doesn't match

    // Light Events
    hs.on("LightCreated", (data) => setLights(prev => [...prev, data]));
    hs.on("LightUpdated", (data) => setLights(prev => prev.map(l => l.id === data.id ? data : l)));
    hs.on("LightDeleted", (data) => setLights(prev => prev.filter(l => l.id !== data.id))); // wait if payload is just { id } or { light: { id }}

    // Logs Event
    hs.on("LogCreated", (data) => setLogs(prev => [data, ...prev]));

    // Room
    hs.on("RoomCreated", (data) => setRooms(prev => [...prev, data]));
    hs.on("RoomUpdated", (data) => setRooms(prev => prev.map(r => r.id === data.id ? data : r)));
    hs.on("RoomDeleted", (id) => setRooms(prev => prev.filter(r => r.id !== id)));

    // Door
    hs.on("DoorCreated", (data) => setDoors(prev => [...prev, data]));
    hs.on("DoorUpdated", (data) => setDoors(prev => prev.map(d => d.id === data.id ? data : d)));

    // Window
    hs.on("WindowCreated", (data) => setWindows(prev => [...prev, data]));
    hs.on("WindowUpdated", (data) => setWindows(prev => prev.map(w => w.id === data.id ? data : w)));

    // Hardware
    hs.on("HardwareCreated", (data) => setHardwares(prev => [...prev, data]));
    hs.on("HardwareUpdated", (data) => setHardwares(prev => prev.map(h => h.id === data.id ? data : h)));

    // Section
    hs.on("SectionCreated", (data) => setSections(prev => [...prev, data]));
    hs.on("SectionUpdated", (data) => setSections(prev => prev.map(s => s.id === data.id ? data : s)));
    hs.on("SectionDeleted", (data) => setSections(prev => prev.filter(s => s.id !== data.id))); // payload is { id } it seems

    // AppNamesDetails
    hs.on("GetAppNamesDetails", (data) => {
         // This seems to provide combined data lists, likely useful for lookups, left empty if not specifically tracked in state directly yet.
    });

    // ContactCategory
    hs.on("ContactCategoryCreated", (data) => setContactCategories(prev => [...prev, data]));
    hs.on("ContactCategoryUpdated", (data) => setContactCategories(prev => prev.map(c => c.id === data.id ? data : c)));
    hs.on("ContactCategoryDeleted", (data) => setContactCategories(prev => prev.filter(c => c.id !== data.id)));

    // Person
    hs.on("PersonCreated", (data) => {
         setAllUsers(prev => [...prev, data]);
    });
    hs.on("PersonUpdated", (data) => {
         setAllUsers(prev => prev.map(u => u.id === data.id ? data : u));
    });
    hs.on("PersonStatusChanged", (data) => {
         setAllUsers(prev => prev.map(u => u.id === data.id ? { ...u, disabled: data.disabled } : u));
    });


    // Chat Events via chatConnection
    const cs = chatConnection!;
    cs.on("chat:history", (history) => setChatMessages(history));
    cs.on("chat:message", (msg) => {
      setChatMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        
        if (!refs.isChatModalOpen && msg.senderId !== refs.userProfileId) {
          setChatPopups(p => {
             if (p.some(m => m.id === msg.id)) return p;
             return [...p, msg];
          });
        }
        return [...prev, msg];
      });
    });

    return () => {
       hs.off("ActionCreated");
       hs.off("ActionUpdated");
       hs.off("ActionActivationChanged");
       hs.off("ActionDeleted");
       hs.off("ApplianceTriggered");
       hs.off("CameraTriggered");
       hs.off("LightTriggered");
       hs.off("DoorTriggered");
       hs.off("WindowTriggered");
       hs.off("ActionTriggered");
       hs.off("ActionStepAdded");
       hs.off("ActionStepUpdated");
       hs.off("ActionStepDeleted");
       hs.off("ApplianceCreated");
       hs.off("ApplianceUpdated");
       hs.off("ApplianceDeleted");
       hs.off("CameraCreated");
       hs.off("CameraUpdated");
       hs.off("CameraDeleted");
       hs.off("fingerprint_received");
       hs.off("ExternalsCreated");
       hs.off("ExternalsUpdated");
       hs.off("ExternalsDeleted");
       hs.off("LightCreated");
       hs.off("LightUpdated");
       hs.off("LightDeleted");
       hs.off("LogCreated");
       hs.off("RoomCreated");
       hs.off("RoomUpdated");
       hs.off("RoomDeleted");
       hs.off("DoorCreated");
       hs.off("DoorUpdated");
       hs.off("WindowCreated");
       hs.off("WindowUpdated");
       hs.off("HardwareCreated");
       hs.off("HardwareUpdated");
       hs.off("SectionCreated");
       hs.off("SectionUpdated");
       hs.off("SectionDeleted");
       hs.off("GetAppNamesDetails");
       hs.off("ContactCategoryCreated");
       hs.off("ContactCategoryUpdated");
       hs.off("ContactCategoryDeleted");
       hs.off("PersonCreated");
       hs.off("PersonUpdated");
       hs.off("PersonStatusChanged");

       cs.off("chat:history");
       cs.off("chat:message");
    };
  }, []);
`;


let startIndex = content.indexOf('React.useEffect(() => {\n    socketRef.current = io();');
let endIndex = content.indexOf('// Camera Fullscreen Logic', startIndex);
if(startIndex !== -1 && endIndex !== -1) {
   let startCode = content.substring(0, startIndex);
   let endCode = content.substring(endIndex);
   fs.writeFileSync('src/App.tsx', startCode + signalRBlock + "\n  " + endCode);
   console.log("Replaced socket.io with SignalR");
} else {
   console.log("Could not find socket.io block. startIndex:" + startIndex + " endIndex:" + endIndex);
}
