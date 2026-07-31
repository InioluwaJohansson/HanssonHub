const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert refs and states for speech recognition
const stateInsert = `
  const [transcription, setTranscription] = React.useState<string>("");
  const wasCallMutedBeforeHeyFridayRef = React.useRef<boolean>(false);
  const speechRecognitionRef = React.useRef<any>(null);
`;
code = code.replace("const [isMicOverlayActive, setIsMicOverlayActive] = React.useState<boolean>(false);", "const [isMicOverlayActive, setIsMicOverlayActive] = React.useState<boolean>(false);\n" + stateInsert);

// Insert useEffect for Speech Recognition
const effectInsert = `
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    speechRecognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      const lowerTranscript = currentTranscript.toLowerCase().trim();
      setTranscription(currentTranscript);
      
      if (lowerTranscript.includes("hey friday")) {
         if (!isMicOverlayActive) {
            setIsMicOverlayActive(true);
            setIsHeaderMicMuted(false);
            
            // Check if call is active
            if (activeCall) {
               wasCallMutedBeforeHeyFridayRef.current = isCallMuted;
               if (!isCallMuted) {
                  // Mute call
                  handleToggleCallMicrophone();
               }
            }
         }
      }

      if (lowerTranscript.includes("dispose")) {
         if (isMicOverlayActive) {
            setIsMicOverlayActive(false);
            setIsHeaderMicMuted(true);
            
            // Unmute call if it wasn't muted before
            if (activeCall && !wasCallMutedBeforeHeyFridayRef.current && isCallMuted) {
               handleToggleCallMicrophone();
            }
         }
      }
    };

    recognition.onend = () => {
      // Restart to keep listening continuously if needed, but browsers might block aggressive restarting.
      // We will try restarting if the app is still active.
      try {
        recognition.start();
      } catch (e) {}
    };

    try {
      recognition.start();
    } catch (e) {}

    return () => {
      recognition.onend = null;
      recognition.stop();
    };
  }, [isMicOverlayActive, activeCall, isCallMuted]);
`;

code = code.replace("React.useEffect(() => {\n    const root = document.documentElement;", effectInsert + "\n  React.useEffect(() => {\n    const root = document.documentElement;");

// Update GrainyAudioOverlay props
code = code.replace(/<GrainyAudioOverlay([^>]*)onClose=\{([^>]*)\}([^>]*)>/g, '<GrainyAudioOverlay$1onClose={$2} transcription={transcription}$3>');

fs.writeFileSync('src/App.tsx', code);
