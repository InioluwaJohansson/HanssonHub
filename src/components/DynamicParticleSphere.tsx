import React, { useEffect, useRef } from 'react';

interface DynamicParticleSphereProps {
  audioLevel?: number; // 0 to 255 representing mic sound intensity
  size?: number; // width & height in px
  className?: string;
  isIcon?: boolean; // optimize for small rendering
  isGreyscale?: boolean; // render in greyscale (white, gray, black)
}

export const DynamicParticleSphere: React.FC<DynamicParticleSphereProps> = ({
  audioLevel = 0,
  size = 320,
  className = '',
  isIcon = false,
  isGreyscale = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioLevelRef = useRef<number>(audioLevel);
  const currentAudioSmooth = useRef<number>(audioLevel);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isSmall = isIcon || size < 70;
    // Point count: 320 for icons, 1800 for full overlay sphere
    const count = isSmall ? 300 : 1800;
    const points: { theta: number; phi: number }[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      points.push({ theta, phi });
    }

    let angleX = 0.2;
    let angleY = 0;
    let colorOffset = 0;

    const render = () => {
      // Smooth lerp audio level for graceful expansion & compaction
      const targetAudio = audioLevelRef.current;
      currentAudioSmooth.current += (targetAudio - currentAudioSmooth.current) * 0.12;

      const currentAudio = currentAudioSmooth.current;
      const normalizedAudio = Math.min(1, Math.max(0, currentAudio / 220));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvasWidth = size * dpr;
      const canvasHeight = size * dpr;

      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      
      // Default compact size when silent (0.44 ratio), expanding up to 0.82 ratio when speaking
      const baseRatio = isSmall ? 0.70 : 0.44;
      const expansionAmount = isSmall ? 0.15 : 0.38;
      const radius = (Math.min(canvasWidth, canvasHeight) / 2) * (baseRatio + normalizedAudio * expansionAmount);

      // Speed up rotation and color shifting when user speaks
      const speedMult = 1 + normalizedAudio * 3.2;
      angleY += 0.007 * speedMult;
      angleX += 0.003 * speedMult;
      colorOffset += (0.6 + normalizedAudio * 4.2);

      const time = Date.now() * 0.0015;

      // Dynamic color interpolation matching magenta/purple/blue glowing palette (or greyscale if isGreyscale is true)
      const getRgbColor = (normY: number, normZ: number) => {
        if (isGreyscale) {
          const intensity = Math.min(255, Math.max(90, Math.floor(125 + normY * 115 + normZ * 30)));
          return { r: intensity, g: intensity, b: intensity };
        }

        const hueBase = (colorOffset + normY * 110 + normZ * 70 + normalizedAudio * 180) % 360;
        
        const h = (hueBase + 360) % 360;
        const s = 0.88 + normalizedAudio * 0.12;
        const l = 0.52 + normalizedAudio * 0.18;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const xVal = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = xVal; b = 0; }
        else if (h < 120) { r = xVal; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = xVal; }
        else if (h < 240) { r = 0; g = xVal; b = c; }
        else if (h < 300) { r = xVal; g = 0; b = c; }
        else { r = c; g = 0; b = xVal; }

        return {
          r: Math.floor((r + m) * 255),
          g: Math.floor((g + m) * 255),
          b: Math.floor((b + m) * 255)
        };
      };

      const projected: { x: number; y: number; z: number; normY: number; r: number; g: number; b: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const { theta, phi } = points[i];

        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // Organic 3D sphere wave deformation
        const wave1 = Math.sin(theta * 4 + time * 2) * Math.cos(phi * 3 - time);
        const wave2 = Math.cos(theta * 2 - time * 1.5) * Math.sin(phi * 5 + time * 2.2);
        const voiceDisplacement = normalizedAudio * 0.38 * Math.sin(theta * 7 + time * 4) * Math.cos(phi * 5 - time * 3);

        const currentRadius = radius * (1 + 0.10 * wave1 + 0.06 * wave2 + voiceDisplacement);

        const x = currentRadius * sinPhi * cosTheta;
        const y = currentRadius * sinPhi * sinTheta;
        const z = currentRadius * cosPhi;

        // Rotation X
        const y1 = y * Math.cos(angleX) - z * Math.sin(angleX);
        const z1 = y * Math.sin(angleX) + z * Math.cos(angleX);

        // Rotation Y
        const x2 = x * Math.cos(angleY) + z1 * Math.sin(angleY);
        const z2 = -x * Math.sin(angleY) + z1 * Math.cos(angleY);

        // Perspective Projection
        const fov = radius * 3.6;
        const scale = fov / (fov + z2);
        const projX = cx + x2 * scale;
        const projY = cy + y1 * scale;

        const normY = (y1 + radius) / (radius * 2);
        const normZ = (z2 + radius) / (radius * 2);

        const color = getRgbColor(normY, normZ);

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          normY,
          r: color.r,
          g: color.g,
          b: color.b,
        });
      }

      // Depth sorting
      projected.sort((a, b) => a.z - b.z);

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        const depthFactor = (p.z + radius * 1.5) / (radius * 3);
        const clampedDepth = Math.max(0.15, Math.min(1, depthFactor));

        const baseDotRadius = isSmall
          ? (0.9 + clampedDepth * 1.4) * dpr
          : (1.1 + clampedDepth * 2.0 + normalizedAudio * 1.6) * dpr;

        const alpha = Math.max(0.2, Math.min(1, clampedDepth * (0.65 + normalizedAudio * 0.35)));

        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, baseDotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [size, isIcon, isGreyscale]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`pointer-events-none select-none inline-block ${className}`}
    />
  );
};
