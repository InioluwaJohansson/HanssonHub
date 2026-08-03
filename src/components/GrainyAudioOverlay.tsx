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
}

export const GrainyAudioOverlay: React.FC<GrainyAudioOverlayProps> = ({ 
  theme = 'dark', 
  onClose, 
  transcription = "", 
  onExecuteCommand,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [bgHue, setBgHue] = useState<number>(280);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          if (!isSpeaking) {
            setAudioLevel(avg);
          }

          // Continuously rotate background hue matching animation
          const currentHue = (Date.now() * 0.025 + avg * 0.4) % 360;
          setBgHue(currentHue);

          animationFrameRef.current = requestAnimationFrame(update);
        };

        update();
      } catch (err) {
        console.warn("Could not access microphone for overlay:", err);
        const simulate = () => {
          const t = Date.now() * 0.005;
          if (!isSpeaking) {
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
  }, [isSpeaking]);

  const isDark = theme === 'dark';

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-2xl select-none group cursor-pointer hover:border-pink-500/50 transition-all ${
          isDark 
            ? 'bg-zinc-950/80 text-white border-white/15' 
            : 'bg-slate-900/80 text-zinc-100 border-white/20 shadow-xl'
        }`}
        onClick={() => onToggleMinimize?.(false)}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-pink-500/50 opacity-75 animate-ping" />
          <div className="relative h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
            <DynamicParticleSphere audioLevel={audioLevel} size={28} isIcon={true} />
          </div>
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-bold bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wide">Friday</span>
          <span className="text-[10px] text-zinc-300 truncate max-w-[150px]">
            {isSpeaking ? "Responding..." : (transcription || "Listening...")}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 text-zinc-100 backdrop-blur-2xl"
      style={{
        background: `radial-gradient(circle at 50% 50%, hsla(${hue1}, 75%, 12%, ${0.82 + (audioLevel / 255) * 0.12}), hsla(${hue2}, 65%, 6%, 0.92), hsla(${hue3}, 55%, 3%, 0.97))`
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
          className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 px-3.5 text-xs font-medium border border-white/10 cursor-pointer"
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
          className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-zinc-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
          title="Close Friday"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* SVG Grain Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[repeat] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Dynamic Radial Glow in background shifting with sphere hue */}
      <div 
        className="absolute h-[580px] w-[580px] rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle, hsla(${hue1}, 85%, 50%, ${0.22 + (audioLevel / 255) * 0.3}), hsla(${hue2}, 80%, 45%, ${0.12 + (audioLevel / 255) * 0.2}), transparent)`,
          transform: `scale(${1 + (audioLevel / 255) * 0.7})`
        }}
      />

      {/* Main Center Overlay Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Title Header */}
        <div className="flex flex-col items-center justify-center">
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
          <span className="animated-friday-title text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight select-none py-1">
            Hi there, I'm Friday!
          </span>
        </div>

        {/* Floating 3D Particle Sphere Visualizer WITHOUT ANY SURROUNDING CIRCLE */}
        <div className="relative flex items-center justify-center my-2 pointer-events-none select-none">
          <DynamicParticleSphere audioLevel={audioLevel} size={330} />
        </div>

        {/* Friday Spoken AI Response Pill */}
        {lastResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-xl text-xs sm:text-sm text-pink-200 shadow-xl"
          >
            <Sparkles className="h-4 w-4 text-pink-400 shrink-0" />
            <span className="truncate">{lastResponse}</span>
          </motion.div>
        )}

        {/* Transcription Display */}
        {transcription && (
          <div className="min-h-[32px] flex flex-col items-center justify-center">
            <h3 className="text-lg sm:text-xl font-medium tracking-tight text-purple-200/90">
              "{transcription}"
            </h3>
          </div>
        )}

      </div>
    </motion.div>
  );
};



