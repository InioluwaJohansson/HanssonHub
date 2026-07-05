import React from 'react';

interface RecordingWaveformProps {
  stream: MediaStream | null;
}

export const RecordingWaveform: React.FC<RecordingWaveformProps> = ({ stream }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);

  React.useEffect(() => {
    if (!stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let audioContext: AudioContext;
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
    } catch (e) {
      console.error("Failed to create AudioContext", e);
      return;
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; // 32 frequency bins
    source.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      animationRef.current = requestAnimationFrame(draw);

      const currentCanvas = canvasRef.current;
      const currentCtx = currentCanvas.getContext('2d');
      if (!currentCtx) return;

      const width = currentCanvas.width;
      const height = currentCanvas.height;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Clear the canvas
      currentCtx.clearRect(0, 0, width, height);

      const barWidth = 4;
      const gap = 3;
      const maxBars = Math.floor(width / (barWidth + gap));
      const startX = (width - (maxBars * (barWidth + gap))) / 2;

      for (let i = 0; i < maxBars; i++) {
        // Create a symmetric waveform look by reflecting or shifting indices
        const index = i < maxBars / 2 ? i : maxBars - i - 1;
        const dataIdx = Math.min(index % bufferLength, bufferLength - 1);
        const value = dataArray[dataIdx];
        
        // Scale the amplitude so there is a nice dancing bar effect
        const percent = value / 255;
        // Ensure a minimum height of 4px and a max height of height - 6px
        const barHeight = Math.max(4, percent * (height - 6));

        const x = startX + i * (barWidth + gap);
        // Center the bar vertically
        const y = (height - barHeight) / 2;

        currentCtx.fillStyle = '#1fa855'; // Beautiful theme green
        
        currentCtx.beginPath();
        if (currentCtx.roundRect) {
          currentCtx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          currentCtx.rect(x, y, barWidth, barHeight);
        }
        currentCtx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream]);

  return (
    <div className="flex-1 h-10 flex items-center justify-center relative overflow-hidden px-4">
      <canvas 
        ref={canvasRef} 
        width={320} 
        height={40} 
        className="w-full max-w-[280px] h-10 opacity-90"
      />
    </div>
  );
};
