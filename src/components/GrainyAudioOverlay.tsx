import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Mic, X, Minimize2 } from 'lucide-react';

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
  const numBars = 48; // Increased number of bars
  const [frequencies, setFrequencies] = useState<number[]>(Array(numBars).fill(10));
  const animationFrameRef = useRef<number | null>(null);

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
        analyser.fftSize = 128; // Increased fftSize to have enough bins for numBars
        source = audioCtx.createMediaStreamSource(s);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          const barFreqs: number[] = [];
          
          // Using a subset of frequencies to represent the voice range better
          const step = Math.max(1, Math.floor((dataArray.length * 0.6) / numBars)); 
          
          for (let i = 0; i < numBars; i++) {
            const val = dataArray[i * step] || 0;
            sum += val;
            barFreqs.push(val);
          }

          // Center-out distribution for animation
          const centeredFreqs = new Array(numBars).fill(0);
          let mid = Math.floor(numBars / 2);
          for (let i = 0; i < numBars; i++) {
             let offset = Math.ceil(i/2) * (i % 2 !== 0 ? 1 : -1);
             if (i === 0) offset = 0;
             const targetIdx = mid + offset;
             if (targetIdx >= 0 && targetIdx < numBars) {
                centeredFreqs[targetIdx] = barFreqs[i];
             }
          }

          const avg = sum / (numBars || 1);
          setAudioLevel(avg);
          setFrequencies(centeredFreqs);

          animationFrameRef.current = requestAnimationFrame(update);
        };

        update();
      } catch (err) {
        console.warn("Could not access microphone for overlay:", err);
        const simulate = () => {
          const t = Date.now() * 0.005;
          const simFreqs = Array.from({ length: numBars }).map((_, i) => {
            const distFromCenter = Math.abs(i - numBars/2);
            const env = Math.max(0, 1 - (distFromCenter / (numBars/2)));
            return 20 + Math.abs(Math.sin(t + i * 0.4)) * 120 * env;
          });
          setFrequencies(simFreqs);
          setAudioLevel(60 + Math.sin(t) * 30);
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
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-xl select-none group cursor-pointer hover:border-emerald-400 transition-all ${
          isDark 
            ? 'bg-zinc-900/95 text-white border-emerald-500/40' 
            : 'bg-white/95 text-zinc-900 border-emerald-500/30 shadow-xl'
        }`}
        onClick={() => onToggleMinimize?.(false)}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <div className="relative h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950 shadow-md">
            <Mic className="h-4 w-4 text-zinc-950 font-black" />
          </div>
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide">Friday</span>
          <span className="text-[10px] text-slate-600 dark:text-zinc-300 truncate max-w-[150px]">
            {transcription || "Listening..."}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          title="Stop Friday"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-zinc-950/90 text-zinc-100 backdrop-blur-xl' 
          : 'bg-slate-100/90 text-slate-900 backdrop-blur-xl'
      }`}
      onClick={() => onToggleMinimize?.(true)}
    >
      {/* Top right buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMinimize?.(true);
          }}
          className="p-2.5 rounded-full bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 px-3.5 text-xs font-medium border border-white/10"
          title="Minimize Friday"
        >
          <Minimize2 className="h-4 w-4 text-emerald-400" />
          <span>Minimize</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2.5 rounded-full bg-black/20 dark:bg-white/10 hover:bg-black/30 dark:hover:bg-white/20 text-zinc-300 hover:text-white transition-colors border border-white/10"
          title="Close Friday"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* SVG Grain Noise Overlay - More transparent */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[repeat] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Radial Theme Glow */}
      <div 
        className={`absolute h-[450px] w-[450px] rounded-full blur-3xl pointer-events-none transition-all duration-300 ${
          isDark 
            ? 'bg-emerald-500/10 dark:bg-emerald-500/10' 
            : 'bg-emerald-400/10'
        }`}
        style={{
          transform: `scale(${1 + (audioLevel / 255) * 0.8})`
        }}
      />

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 text-center px-6 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Text - "Hi there, I'm Friday!" with glowing multi-color gradient moving left-right-left */}
        <div className="flex items-center justify-center">
          <style>{`
            @keyframes glowingGradientShift {
              0% {
                background-position: 0% 50%;
                filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 28px rgba(6, 182, 212, 0.4));
              }
              50% {
                background-position: 100% 50%;
                filter: drop-shadow(0 0 22px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 34px rgba(236, 72, 153, 0.5));
              }
              100% {
                background-position: 0% 50%;
                filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.6)) drop-shadow(0 0 28px rgba(6, 182, 212, 0.4));
              }
            }
            .animated-friday-title {
              background: linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #ec4899, #f59e0b, #10b981);
              background-size: 300% 100%;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: glowingGradientShift 5s ease-in-out infinite;
            }
          `}</style>
          <span className="animated-friday-title text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight select-none py-2">
            Hi there, I'm Friday!
          </span>
        </div>

        {/* Dynamic Center Frequency Bar Audio Visualizer */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-32 px-8 py-4 rounded-[3rem] bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md w-[70%] max-w-3xl">
          {frequencies.map((val, idx) => {
            const heightPx = Math.max(8, (val / 255) * 100);
            return (
              <div
                key={idx}
                className="w-1.5 sm:w-2 rounded-full bg-emerald-500 transition-all duration-75"
                style={{
                  height: `${heightPx}px`,
                  opacity: 0.4 + (val / 255) * 0.6
                }}
              />
            );
          })}
        </div>

        {/* Live Transcription */}
        <div className="space-y-4 h-24 flex flex-col items-center justify-center">
           <h3 className="text-2xl font-semibold tracking-tight text-emerald-500">
             {transcription || "Listening..."}
           </h3>
        </div>
      </div>
    </motion.div>
  );
};

