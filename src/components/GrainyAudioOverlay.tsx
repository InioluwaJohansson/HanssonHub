import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Minimize2, Sparkles } from 'lucide-react';
import { DynamicParticleSphere } from './DynamicParticleSphere';

interface GrainyAudioOverlayProps {
  theme?: 'light' | 'dark';
  onClose: () => void;
  transcription?: string;
  onExecuteCommand?: (text: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: (minimized: boolean) => void;
  lastResponse?: string | null;
  isSpeaking?: boolean;
}

export const GrainyAudioOverlay: React.FC<GrainyAudioOverlayProps> = ({ 
  theme = 'dark', 
  onClose, 
  transcription = "", 
  onExecuteCommand,
  isMinimized = false,
  onToggleMinimize,
  lastResponse: propLastResponse = null,
  isSpeaking: propIsSpeaking = false
}) => {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [bgHue, setBgHue] = useState<number>(280);
  const [localLastResponse, setLocalLastResponse] = useState<string | null>(null);
  const [typedTitle, setTypedTitle] = useState<string>("");
  const animationFrameRef = useRef<number | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef<boolean>(propIsSpeaking);
  const hasTypedTitleRef = useRef<boolean>(false);

  const effectiveLastResponse = propLastResponse || localLastResponse;
  const effectiveIsSpeaking = propIsSpeaking;

  useEffect(() => {
    isSpeakingRef.current = propIsSpeaking;
  }, [propIsSpeaking]);

  // Typewriter effect on open (runs strictly ONCE when first opened)
  useEffect(() => {
    if (isMinimized) return;
    const FULL_TITLE = "Hi there, I'm Friday!";

    if (hasTypedTitleRef.current) {
      setTypedTitle(FULL_TITLE);
      return;
    }

    let idx = 0;
    setTypedTitle("");
    const timer = setInterval(() => {
      idx++;
      setTypedTitle(FULL_TITLE.slice(0, idx));
      if (idx >= FULL_TITLE.length) {
        clearInterval(timer);
        hasTypedTitleRef.current = true;
      }
    }, 65);

    return () => {
      clearInterval(timer);
      hasTypedTitleRef.current = true;
    };
  }, [isMinimized]);

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let activeStream: MediaStream | null = null;

    async function initMic() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000
          }
        });
        activeStream = s;
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source = audioCtx.createMediaStreamSource(s);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }

          const avg = sum / (dataArray.length || 1);
          if (isSpeakingRef.current) {
            const t = Date.now() * 0.015;
            const simulatedLevel = 140 + Math.sin(t) * 55 + Math.cos(t * 1.8) * 35;
            setAudioLevel(simulatedLevel);
          } else {
            setAudioLevel(avg);
          }

          // Continuously rotate background hue matching animation
          const currentHue = (Date.now() * 0.025 + (isSpeakingRef.current ? 120 : avg) * 0.4) % 360;
          setBgHue(currentHue);

          animationFrameRef.current = requestAnimationFrame(update);
        };

        update();
      } catch (err) {
        console.warn("Could not access microphone for overlay:", err);
        const simulate = () => {
          const t = Date.now() * 0.005;
          if (isSpeakingRef.current) {
            const tSpk = Date.now() * 0.015;
            setAudioLevel(140 + Math.sin(tSpk) * 55 + Math.cos(tSpk * 1.8) * 35);
          } else {
            setAudioLevel(15 + Math.sin(t) * 10);
          }
          const currentHue = (Date.now() * 0.025) % 360;
          setBgHue(currentHue);
          animationFrameRef.current = requestAnimationFrame(simulate);
        };
        simulate();
      }
    }

    initMic();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (speakingIntervalRef.current) {
        clearInterval(speakingIntervalRef.current);
      }
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  const isDark = theme === 'dark';

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-2xl select-none group cursor-pointer transition-all ${
          isDark 
            ? 'bg-zinc-950/95 text-white border-white/15 hover:border-pink-500/50' 
            : 'bg-white/95 text-slate-900 border-slate-200/90 shadow-xl hover:border-pink-500/50'
        }`}
        onClick={() => onToggleMinimize?.(false)}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-pink-500/40 opacity-75 animate-ping" />
          <div className="relative h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
            <DynamicParticleSphere audioLevel={audioLevel} size={28} isIcon={true} />
          </div>
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wide">Friday</span>
          <span className={`text-[10px] truncate max-w-[150px] ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
            {effectiveIsSpeaking ? "Responding..." : (transcription || "Listening...")}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isDark 
              ? 'hover:bg-white/10 text-zinc-400 hover:text-white' 
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
          title="Stop Friday"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  const hue1 = bgHue % 360;
  const hue2 = (bgHue + 90) % 360;
  const hue3 = (bgHue + 180) % 360;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 backdrop-blur-md ${
        isDark ? 'text-zinc-100' : 'text-slate-900'
      }`}
      style={{
        background: isDark
          ? `radial-gradient(circle at 50% 50%, hsla(${hue1}, 70%, 10%, 0.22), hsla(${hue2}, 60%, 5%, 0.32), hsla(${hue3}, 50%, 2%, 0.40))`
          : `radial-gradient(circle at 50% 50%, hsla(${hue1}, 80%, 96%, 0.22), hsla(${hue2}, 70%, 92%, 0.32), hsla(${hue3}, 60%, 96%, 0.40))`
      }}
      onClick={() => onToggleMinimize?.(true)}
    >
      {/* Top Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMinimize?.(true);
          }}
          className={`p-2.5 rounded-full transition-colors flex items-center gap-1.5 px-3.5 text-xs font-medium cursor-pointer ${
            isDark 
              ? 'bg-black/40 hover:bg-black/60 text-zinc-300 hover:text-white border border-white/10' 
              : 'bg-white/80 hover:bg-white/95 text-slate-700 hover:text-slate-900 border border-slate-300/80 shadow-xs'
          }`}
          title="Minimize Friday"
        >
          <Minimize2 className="h-4 w-4 text-current" />
          <span>Minimize</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`p-2.5 rounded-full transition-colors cursor-pointer ${
            isDark 
              ? 'bg-black/40 hover:bg-black/60 text-zinc-300 hover:text-white border border-white/10' 
              : 'bg-white/80 hover:bg-white/95 text-slate-700 hover:text-slate-900 border border-slate-300/80 shadow-xs'
          }`}
          title="Close Friday"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Top Title Header: Aligned at top-6 (same top position as minimize button) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center max-w-[calc(100vw-220px)] sm:max-w-2xl text-center">
        <style>{`
          @keyframes glowingGradientShift {
            0% {
              background-position: 0% 50%;
              filter: drop-shadow(0 0 16px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 28px rgba(139, 92, 246, 0.4));
            }
            50% {
              background-position: 100% 50%;
              filter: drop-shadow(0 0 22px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 34px rgba(234, 179, 8, 0.5));
            }
            100% {
              background-position: 0% 50%;
              filter: drop-shadow(0 0 16px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 28px rgba(139, 92, 246, 0.4));
            }
          }
          .animated-friday-title {
            background: linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6, #06b6d4, #f59e0b, #ec4899);
            background-size: 300% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: glowingGradientShift 5s ease-in-out infinite;
          }
        `}</style>
        <span className="animated-friday-title text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight select-none py-0.5 flex items-center leading-tight">
          {typedTitle || "Hi there, I'm Friday!"}
          {typedTitle.length < "Hi there, I'm Friday!".length && (
            <span className="inline-block w-1.5 h-6 sm:h-10 ml-1 bg-pink-500 animate-pulse rounded-full align-middle" />
          )}
        </span>
      </div>

      {/* SVG Grain Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[repeat] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Dynamic Radial Glow in background shifting with sphere hue */}
      <div 
        className="absolute h-[640px] w-[640px] rounded-full blur-3xl pointer-events-none transition-all duration-300 z-0 opacity-70"
        style={{
          background: isDark
            ? `radial-gradient(circle, hsla(${hue1}, 85%, 50%, ${0.15 + (audioLevel / 255) * 0.2}), hsla(${hue2}, 80%, 45%, ${0.08 + (audioLevel / 255) * 0.15}), transparent)`
            : `radial-gradient(circle, hsla(${hue1}, 85%, 65%, ${0.2 + (audioLevel / 255) * 0.2}), hsla(${hue2}, 80%, 60%, ${0.12 + (audioLevel / 255) * 0.15}), transparent)`,
          transform: `scale(${1 + (audioLevel / 255) * 0.7})`
        }}
      />

      {/* Main Center Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-between text-center px-6 w-full max-w-4xl pt-20 pb-6 min-h-screen" onClick={(e) => e.stopPropagation()}>
        
        {/* Middle: Floating 3D Particle Sphere Visualizer */}
        <div className="relative flex items-center justify-center w-full min-h-[380px] pointer-events-none select-none my-auto">
          <DynamicParticleSphere audioLevel={audioLevel} size={420} />
        </div>

        {/* Bottom: Friday Spoken AI Response Pill & Translated Voice Input */}
        <div className="flex flex-col items-center justify-center gap-3 w-full min-h-[80px]">
          {/* Friday Spoken AI Response Pill */}
          {effectiveLastResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md max-w-xl text-xs sm:text-sm shadow-xl ${
                isDark 
                  ? 'bg-zinc-900/70 border border-white/15 text-pink-200' 
                  : 'bg-white/85 border border-slate-200 text-slate-800 shadow-lg'
              }`}
            >
              <Sparkles className="h-4 w-4 text-pink-500 shrink-0" />
              <span className="truncate">{effectiveLastResponse}</span>
            </motion.div>
          )}

          {/* Transcription Display / Voice Input */}
          {transcription ? (
            <div className="min-h-[40px] flex flex-col items-center justify-center max-w-2xl px-4 py-2 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/5">
              <h3 className={`text-lg sm:text-2xl font-semibold tracking-tight ${
                isDark ? 'text-purple-200/95 drop-shadow-md' : 'text-purple-950/95 font-bold drop-shadow-sm'
              }`}>
                "{transcription}"
              </h3>
            </div>
          ) : (
            <div className="min-h-[40px] flex items-center justify-center">
              <span className={`text-sm font-medium tracking-wide ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Listening for your voice command...
              </span>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};



